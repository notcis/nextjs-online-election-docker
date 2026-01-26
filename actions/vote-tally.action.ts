"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 1. ดึงข้อมูลตัวเลือก (Election ทั้งหมด และ Candidate ทั้งหมด) สำหรับใส่ใน Dropdown
export async function getTallyOptions() {
  const [elections, candidates] = await Promise.all([
    prisma.election.findMany({ orderBy: { year: "desc" } }),
    prisma.candidate.findMany({ orderBy: { candidateNumber: "asc" } }),
  ]);
  return { success: true, elections, candidates };
}

// 2. ดึงข้อมูลคะแนนของปีการเลือกตั้งที่เลือก
export async function getTalliesByElection(electionId: string) {
  try {
    const tallies = await prisma.voteTally.findMany({
      where: { electionId },
      include: {
        candidate: true, // ดึงข้อมูลผู้สมัครมาแสดงด้วย
      },
      orderBy: {
        candidate: { candidateNumber: "asc" },
      },
    });
    return { success: true, tallies };
  } catch (error) {
    return { success: false, error: "ดึงข้อมูลไม่สำเร็จ" };
  }
}

// 3. เพิ่ม หรือ อัปเดต คะแนนแบบ Manual (กรณีฉุกเฉิน)
export async function saveVoteTally(
  id: string | null,
  electionId: string,
  candidateId: string,
  totalVotes: number,
) {
  try {
    if (id) {
      // แก้ไขคะแนน
      await prisma.voteTally.update({
        where: { id },
        data: { totalVotes },
      });
    } else {
      // สร้างใหม่ (เชื่อมโยงใหม่)
      await prisma.voteTally.create({
        data: { electionId, candidateId, totalVotes },
      });
    }
    revalidatePath("/dashboard/vote-tally");
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: "บันทึกไม่สำเร็จ (ผู้สมัครอาจถูกเชื่อมโยงแล้ว)",
    };
  }
}

// 4. ระบบอัตโนมัติ: เชื่อมโยงผู้สมัครทุกคนในระบบเข้ากับการเลือกตั้งนี้ (Set คะแนน = 0)
export async function initializeTallies(electionId: string) {
  try {
    // หาผู้สมัครทุกคนที่ลงแข่งในปีนี้
    const candidates = await prisma.candidate.findMany({
      where: { electionId },
    });

    // ล้างข้อมูลเก่าของปีนี้ออกก่อน (Reset)
    await prisma.voteTally.deleteMany({ where: { electionId } });

    // สร้าง Record ใหม่ให้คะแนน = 0
    const dataToInsert = candidates.map((cand) => ({
      electionId,
      candidateId: cand.id,
      totalVotes: 0,
    }));

    await prisma.voteTally.createMany({ data: dataToInsert });
    revalidatePath("/dashboard/vote-tally");
    return { success: true, count: dataToInsert.length };
  } catch (error) {
    return { success: false, error: "ไม่สามารถเตรียมระบบนับคะแนนได้" };
  }
}

// 5. ลบการเชื่อมโยง (ถอดผู้สมัครออก)
export async function deleteVoteTally(id: string) {
  await prisma.voteTally.delete({ where: { id } });
  revalidatePath("/dashboard/vote-tally");
  return { success: true };
}
