"use server";

import { prisma } from "@/lib/prisma";
import { convertUtcToThaiTime, getNowInThaiTime } from "@/lib/datetime";
import { headers } from "next/headers";

// ประเภทของข้อมูลที่จะรับเข้ามา
interface SubmitVotePayload {
  memberId: string;
  electionId: string;
  selectedCandidateIds: string[];
  isAbstain: boolean;
}

export async function submitVote(payload: SubmitVotePayload) {
  try {
    const { memberId, electionId, selectedCandidateIds, isAbstain } = payload;

    // 1. ดึง IP และ User-Agent สำหรับบันทึก Audit Log (ความปลอดภัย)
    const headersList = headers();
    const ipAddress = (await headersList).get("x-forwarded-for") || "unknown";
    const userAgent = (await headersList).get("user-agent") || "unknown";

    // 2. ตรวจสอบว่าโหวตไปหรือยัง? (ป้องกันการกดเบิ้ล หรือ Refresh ส่งซ้ำ)
    const existingVote = await prisma.memberVoteStatus.findUnique({
      where: {
        memberId_electionId: { memberId, electionId },
      },
    });

    if (existingVote) {
      return { success: false, error: "ท่านได้ทำการลงคะแนนเสียงไปแล้ว" };
    }

    // 3. ตรวจสอบเวลาเปิด-ปิด อีกครั้ง ณ วินาทีที่กดส่ง
    const election = await prisma.election.findUnique({
      where: { id: electionId },
    });
    const now = getNowInThaiTime();
    if (!election || now > election.endTime || !election.isActive) {
      return {
        success: false,
        error: "หมดเวลาลงคะแนนเสียงแล้ว ระบบไม่สามารถบันทึกข้อมูลได้",
      };
    }

    const systemSettings = await prisma.systemSetting.findUnique({
      where: { id: "global-settings" },
    });
    if (!systemSettings || !systemSettings.isSystemActive) {
      return {
        success: false,
        error: "การเลือกตั้งถูกระงับชั่วคราว",
      };
    }

    // 4. กรณีเลือก "ไม่ประสงค์ลงคะแนน": ต้องไปหา ID ของตัวเลือกนี้ก่อน
    let finalCandidateIds = selectedCandidateIds;
    if (isAbstain) {
      const abstainCandidate = await prisma.candidate.findFirst({
        where: { electionId, isAbstain: true },
      });
      if (!abstainCandidate)
        throw new Error("ไม่พบตัวเลือก 'ไม่ประสงค์ลงคะแนน' ในระบบ");
      finalCandidateIds = [abstainCandidate.id];
    } else {
      // ตรวจสอบว่าเลือกเกินจำนวนที่กำหนดหรือไม่
      if (finalCandidateIds.length > election.maxVotes) {
        return { success: false, error: "ท่านเลือกผู้สมัครเกินจำนวนที่กำหนด" };
      }
    }

    // =================================================================
    // 5. เริ่มต้น TRANSACTION: บันทึกสถานะ และ บวกคะแนน (ต้องสำเร็จพร้อมกัน)
    // =================================================================
    await prisma.$transaction(async (tx) => {
      // 5.1 บันทึกว่าสมาชิกคนนี้ลงคะแนนแล้ว
      await tx.memberVoteStatus.create({
        data: {
          memberId,
          electionId,
          // แปลงเวลาปัจจุบันให้เป็นเขตเวลาไทย (UTC+7) ก่อนบันทึก
          // Use the helper function for consistency
          votedAt: getNowInThaiTime(),
          ipAddress,
          userAgent,
        },
      });

      // 5.2 บวกคะแนน (Increment) ให้ผู้สมัครที่เลือกทีละ 1 คะแนน
      // ใช้การวนลูปสร้างคำสั่ง update ให้แต่ละคน
      const tallyUpdates = finalCandidateIds.map((candidateId) =>
        tx.voteTally.update({
          where: { candidateId },
          data: { totalVotes: { increment: 1 } },
        }),
      );

      await Promise.all(tallyUpdates);
    });

    return { success: true };
  } catch (error) {
    console.error("Submit Vote Error:", error);
    return {
      success: false,
      error: "เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง",
    };
  }
}

export async function getVoteTime({
  electionId,
  memberId,
}: {
  electionId: string;
  memberId: string;
}) {
  const vote = await prisma.memberVoteStatus.findUnique({
    where: {
      memberId_electionId: {
        memberId: memberId,
        electionId: electionId,
      },
    },
  });

  return vote;
}
