"use server";

import { convertUtcToThaiTime, getNowInThaiTime } from "@/lib/datetime";
import prisma from "@/lib/prisma";

// -------------------------------------------------------------
// ดึงข้อมูลการเลือกตั้งและรายชื่อผู้สมัครทั้งหมดของปีนั้น
// -------------------------------------------------------------
export async function getElectionCandidates(year: number) {
  try {
    // 1. ค้นหาข้อมูลการเลือกตั้งของปีที่ระบุ
    const election = await prisma.election.findUnique({
      where: { year: year },
      include: {
        candidates: true, // ดึงข้อมูลผู้สมัครมาด้วยเลย
      },
    });

    // 2. ตรวจสอบว่ามีข้อมูลหรือไม่
    if (!election) {
      return { success: false, error: "ไม่พบข้อมูลการเลือกตั้งของปีที่ระบุ" };
    }

    // 3. ตรวจสอบเวลา (Business Logic: ป้องกันการดึงรายชื่อนอกเวลาเลือกตั้ง)
    const now = getNowInThaiTime();
    if (now < election.startTime) {
      return { success: false, error: "ยังไม่ถึงเวลาเปิดลงคะแนนเสียง" };
    }
    if (now > election.endTime) {
      return { success: false, error: "หมดเวลาลงคะแนนเสียงแล้ว" };
    }
    if (!election.isActive) {
      return { success: false, error: "การเลือกตั้งถูกระงับชั่วคราว" };
    }

    // 4. แยกและจัดเรียงรายชื่อผู้สมัคร
    // 4.1. กลุ่มคนปกติ (isAbstain = false) เรียงตามหมายเลขน้อยไปมาก
    const normalCandidates = election.candidates
      .filter((c) => !c.isAbstain)
      .sort((a, b) => (a.candidateNumber || 0) - (b.candidateNumber || 0));

    // 4.2. กลุ่มไม่ประสงค์ลงคะแนน (isAbstain = true)
    const abstainOption = election.candidates.find((c) => c.isAbstain);

    // 4.3. เอามาต่อกัน (ปกติอยู่บน, ไม่ประสงค์ลงคะแนนอยู่ล่างสุด)
    const finalCandidates = abstainOption
      ? [...normalCandidates, abstainOption]
      : normalCandidates;

    // 5. ส่งข้อมูลกลับไปให้ Frontend
    return {
      success: true,
      electionInfo: {
        id: election.id,
        title: election.title,
        maxVotes: election.maxVotes, // maxVotes is not a datetime, no conversion needed
        endTime: election.endTime, // Convert for frontend if expected in Thai time
      },
      candidates: finalCandidates.map((c) => ({
        id: c.id,
        candidateNumber: c.candidateNumber,
        firstName: c.firstName,
        lastName: c.lastName,
        imageUrl: c.imageUrl,
        isAbstain: c.isAbstain,
      })),
    };
  } catch (error) {
    console.error("Failed to fetch election data:", error);
    return {
      success: false,
      error: "เกิดข้อผิดพลาดในการดึงข้อมูลจากฐานข้อมูล",
    };
  }
}
