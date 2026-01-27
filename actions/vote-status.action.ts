"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. ดึงข้อมูลสถานะการโหวต (พร้อม Search & Pagination)
export async function getVoteStatuses(
  page = 1,
  limit = 20,
  search = "",
  electionId = "",
) {
  try {
    const skip = (page - 1) * limit;

    // สร้างเงื่อนไขการค้นหา
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereCondition: any = {};

    // ถ้ามีการเลือกปีการเลือกตั้ง
    if (electionId) {
      whereCondition.electionId = electionId;
    }

    // ถ้ามีการค้นหาด้วยเลขสมาชิก
    if (search) {
      whereCondition.member = {
        memberCode: { contains: search },
      };
    }

    const [statuses, total] = await Promise.all([
      prisma.memberVoteStatus.findMany({
        where: whereCondition,
        include: {
          member: {
            select: { memberCode: true, region: true }, // ดึงข้อมูลสมาชิกมาแสดง
          },
          election: {
            select: { title: true },
          },
        },
        orderBy: { votedAt: "desc" }, // เรียงจากล่าสุดไปเก่า
        skip,
        take: limit,
      }),
      prisma.memberVoteStatus.count({ where: whereCondition }),
    ]);

    return {
      success: true,
      data: statuses,
      totalPages: Math.ceil(total / limit),
      totalRecords: total,
    };
  } catch (error) {
    return {
      success: false,
      error: "ไม่สามารถดึงข้อมูลประวัติการใช้สิทธิ์ได้",
    };
  }
}

// 2. ลบสถานะการโหวต (Reset Vote)
// ⚠️ คำเตือน: การลบนี้จะทำให้สมาชิกกลับมาโหวตใหม่ได้ แต่คะแนนเดิมที่โหวตไปแล้วจะยังค้างอยู่ในระบบ (เพราะเราไม่รู้ว่าเขาโหวตใคร)
export async function deleteVoteStatus(id: string) {
  try {
    await prisma.memberVoteStatus.delete({
      where: { id },
    });
    revalidatePath("/dashboard/vote-status");
    return { success: true };
  } catch (error) {
    return { success: false, error: "ไม่สามารถลบข้อมูลได้" };
  }
}

// 3. ดึงตัวเลือกปีการเลือกตั้ง
export async function getElectionOptions() {
  const elections = await prisma.election.findMany({
    orderBy: { year: "desc" },
    select: { id: true, title: true, year: true },
  });
  return elections;
}
