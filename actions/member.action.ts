"use server";

import { convertUtcToThaiTime } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";

// 1. ดึงข้อมูลสมาชิก (มี Search และ Pagination)
export async function getMembers(page = 1, limit = 20, search = "") {
  try {
    const skip = (page - 1) * limit;
    const whereCondition = search
      ? {
          OR: [
            { memberCode: { contains: search } },
            { region: { contains: search } },
          ],
        }
      : {};

    const [members, total] = await Promise.all([
      prisma.member.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { memberCode: "asc" },
      }),
      prisma.member.count({ where: whereCondition }),
    ]);

    return {
      success: true,
      members,
      totalPages: Math.ceil(total / limit),
      totalMembers: total,
    };
  } catch (error) {
    return { success: false, error: "ไม่สามารถดึงข้อมูลสมาชิกได้" };
  }
}

// 2. เพิ่ม/แก้ไข สมาชิกทีละคน
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveMember(data: any) {
  try {
    // Hash เลขบัตร ปชช. (ถ้ามีการส่งมา)
    const hashedId = data.nationalId
      ? await bcrypt.hash(data.nationalId, 10)
      : undefined;

    if (data.id) {
      // อัปเดตข้อมูลเดิม
      await prisma.member.update({
        where: { id: data.id },
        data: {
          memberCode: data.memberCode,
          age: parseInt(data.age),
          region: data.region,
          isEligible: data.isEligible,
          ...(hashedId && { hashedNationalId: hashedId }), // อัปเดต Hash ใหม่ถ้ามี
        },
      });
    } else {
      // สร้างใหม่
      await prisma.member.create({
        data: {
          memberCode: data.memberCode,
          hashedNationalId: hashedId!,
          age: parseInt(data.age),
          region: data.region,
          isEligible: data.isEligible,
          createdAt: convertUtcToThaiTime(new Date()),
        },
      });
    }

    revalidatePath("/dashboard/members");
    return { success: true };
  } catch (error) {
    return { success: false, error: "บันทึกไม่สำเร็จ เลขทะเบียนอาจซ้ำในระบบ" };
  }
}

// 3. ลบสมาชิก
export async function deleteMember(id: string) {
  try {
    await prisma.member.delete({ where: { id } });
    revalidatePath("/dashboard/members");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "ไม่สามารถลบได้ (อาจมีประวัติการลงคะแนนผูกอยู่)",
    };
  }
}

// 4. นำเข้าข้อมูล Excel (Bulk Insert พร้อม Hash)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function importMembersBulk(membersData: any[]) {
  try {
    // เนื่องจาก bcrypt ทำงานหนัก เราจะ Hash รวดเดียวด้วย Promise.all
    const membersToInsert = await Promise.all(
      membersData.map(async (m) => {
        const hashedNationalId = await bcrypt.hash(m.nationalId.toString(), 10);
        return {
          memberCode: m.memberCode.toString(),
          hashedNationalId,
          age: parseInt(m.age),
          region: m.region,
          isEligible: m.isEligible ?? true,
        };
      }),
    );

    // ใช้ createMany พร้อม skipDuplicates (ถ้าซ้ำให้ข้ามไปเลย ไม่พัง)
    const result = await prisma.member.createMany({
      data: membersToInsert,
      skipDuplicates: true,
    });

    revalidatePath("/dashboard/members");
    return { success: true, count: result.count };
  } catch (error) {
    return { success: false, error: "เกิดข้อผิดพลาดระหว่างนำเข้าข้อมูล" };
  }
}
