"use server";

import { convertUtcToThaiTime, getNowInThaiTime } from "@/lib/datetime";
import prisma from "@/lib/prisma";

export async function getElectionResults(year: number) {
  try {
    const election = await prisma.election.findUnique({
      where: { year },
    });

    if (!election) {
      return { success: false, error: "ไม่พบข้อมูลการเลือกตั้งของปีที่ระบุ" };
    }

    // 1. ตรวจสอบเวลา: ถ้ายังไม่ปิดโหวต ไม่ให้ดูผล (ความลับ)
    const now = getNowInThaiTime();

    if (now < election.endTime) {
      return {
        success: true,
        isClosed: false,
        endTime: election.endTime, // Convert for frontend if expected in Thai time
      };
    }

    // 2. ดึงผลคะแนนทั้งหมด พร้อมข้อมูลผู้สมัคร
    const tallies = await prisma.voteTally.findMany({
      where: { electionId: election.id },
      include: {
        candidate: true,
      },
      orderBy: {
        totalVotes: "desc", // เรียงคะแนนจากมากไปน้อย
      },
    });

    // 3. คำนวณยอดโหวตทั้งหมด เพื่อทำเป็น %
    const totalVotes = tallies.reduce(
      (sum, tally) => sum + tally.totalVotes,
      0,
    );

    // 4. แยกกลุ่มคนปกติ และ ตัวเลือก "ไม่ประสงค์ลงคะแนน"
    const normalCandidates = tallies.filter((t) => !t.candidate.isAbstain);
    const abstainTally = tallies.find((t) => t.candidate.isAbstain);

    return {
      success: true,
      isClosed: true,
      electionTitle: election.title,
      totalVotes,
      results: normalCandidates.map((t, index) => ({
        rank: index + 1, // อันดับ (1, 2, 3...)
        candidateId: t.candidate.id,
        candidateNumber: t.candidate.candidateNumber,
        firstName: t.candidate.firstName,
        lastName: t.candidate.lastName,
        imageUrl: t.candidate.imageUrl,
        votes: t.totalVotes,
        percentage: totalVotes > 0 ? (t.totalVotes / totalVotes) * 100 : 0,
      })),
      abstainResult: abstainTally
        ? {
            votes: abstainTally.totalVotes,
            percentage:
              totalVotes > 0 ? (abstainTally.totalVotes / totalVotes) * 100 : 0,
          }
        : null,
    };
  } catch (error) {
    console.error("Results Error:", error);
    return { success: false, error: "ไม่สามารถดึงข้อมูลผลการลงคะแนนได้" };
  }
}
