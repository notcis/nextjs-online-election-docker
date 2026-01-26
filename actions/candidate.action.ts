"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. ดึงรายชื่อผู้สมัคร (หน้าตาราง)
export async function getCandidates(electionYear: number) {
  const election = await prisma.election.findUnique({
    where: { year: electionYear },
  });
  if (!election) return { success: false, candidates: [] };

  const candidates = await prisma.candidate.findMany({
    where: { electionId: election.id },
    orderBy: { candidateNumber: "asc" },
  });
  return { success: true, electionId: election.id, candidates };
}

// 2. เพิ่ม/แก้ไข ผู้สมัครทีละคน
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function saveCandidate(data: any) {
  try {
    if (data.id) {
      await prisma.candidate.update({ where: { id: data.id }, data });
    } else {
      await prisma.candidate.create({ data });
    }
    revalidatePath("/dashboard/candidates");
    return { success: true };
  } catch (err) {
    return { success: false, error: "บันทึกไม่สำเร็จ อาจมีหมายเลขผู้สมัครซ้ำ" };
  }
}

// 3. นำเข้าผ่าน Excel (Bulk Insert)
export async function importCandidates(
  electionId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  candidatesData: any[],
) {
  try {
    // ลบข้อมูลเก่า (ที่ปกติ) ออกก่อน เพื่อป้องกันข้อมูลซ้ำ (แต่ไม่ลบ "ไม่ประสงค์ลงคะแนน")
    await prisma.candidate.deleteMany({
      where: { electionId, isAbstain: false },
    });

    const dataToInsert = candidatesData.map((c) => ({
      ...c,
      electionId,
      isAbstain: false,
    }));

    await prisma.candidate.createMany({ data: dataToInsert });
    revalidatePath("/dashboard/candidates");
    return { success: true, count: dataToInsert.length };
  } catch (error) {
    return { success: false, error: "ฐานข้อมูลปฏิเสธการบันทึก" };
  }
}

// 4. ลบผู้สมัคร
export async function deleteCandidate(id: string) {
  await prisma.candidate.delete({ where: { id } });
  revalidatePath("/dashboard/candidates");
  return { success: true };
}
