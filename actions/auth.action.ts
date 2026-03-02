"use server";

import { decryptLineToken } from "@/lib/crypto";
import { convertUtcToThaiTime, getNowInThaiTime } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { cookies } from "next/headers"; // 👈 1. Import cookies API

// -------------------------------------------------------------
// 2. Server Action หลัก: ตรวจสอบสิทธิ์ผู้ใช้ (Verify Member)
// -------------------------------------------------------------
export async function verifyMemberStatus(
  lineToken: string,
  nationalId: string,
  electionYear: number,
) {
  try {
    // ขั้นตอนที่ 1: ถอดรหัส Token ให้เป็นเลขทะเบียน 6 หลัก
    const memberCode = decryptLineToken(lineToken);

    if (!memberCode) {
      return {
        success: false,
        error: "Invalid Token: ไม่สามารถถอดรหัสข้อมูลได้",
      };
    }

    // ขั้นตอนที่ 2: ค้นหาข้อมูลสมาชิกใน Database
    const member = await prisma.member.findUnique({
      where: { memberCode: memberCode },
    });

    if (!member) {
      return {
        success: false,
        error: "ไม่พบข้อมูลสมาชิกที่ตรงกับบัญชี LINE นี้",
      };
    }

    // ขั้นตอนที่ 3: ตรวจสอบเลขบัตรประชาชน (เทียบกับ Hash ใน DB)
    const isNationalIdValid = bcrypt.compareSync(
      nationalId,
      member.hashedNationalId,
    );
    if (!isNationalIdValid) {
      return { success: false, error: "เลขบัตรประชาชนไม่ถูกต้อง" };
    }

    // ขั้นตอนที่ 4: ดึงข้อมูลการเลือกตั้งของปีที่ระบุ
    const election = await prisma.election.findUnique({
      where: { year: electionYear },
    });

    if (!election) {
      return { success: false, error: "ไม่พบข้อมูลการเลือกตั้งของปีนี้" };
    }

    // เช็คเวลาเปิด-ปิด (Business Logic)
    const now = getNowInThaiTime();
    if (
      !election.isActive ||
      now < election.startTime ||
      now > election.endTime
    ) {
      return { success: false, error: "ไม่อยู่ในช่วงเวลาการเปิดลงคะแนนเสียง" };
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

    // ขั้นตอนที่ 5: ตรวจสอบว่าเคยลงคะแนนแล้วหรือยัง
    const existingVote = await prisma.memberVoteStatus.findUnique({
      where: {
        memberId_electionId: {
          memberId: member.id,
          electionId: election.id,
        },
      },
    });

    if (existingVote) {
      // แจ้งให้ Frontend ทราบว่าโหวตไปแล้ว เพื่อ Redirect ไปหน้า Step 5 (Success)
      return {
        success: false,
        isAlreadyVoted: true,
        error: "ท่านได้ใช้สิทธิ์ลงคะแนนเสียงไปแล้ว",
      };
    }

    const thirtyMinutes = 30 * 60; // อายุ 30 นาที (วินาที)

    (await cookies()).set("voter_session", member.id, {
      httpOnly: true, // เปลี่ยนเป็น true เพื่อความปลอดภัยสูงสุด (อ่านค่าผ่าน Server Component แทน)
      secure: process.env.NODE_ENV === "production", // บังคับใช้ HTTPS บน Production
      sameSite: "strict", // ป้องกันการโจมตีแบบ CSRF
      maxAge: thirtyMinutes,
      path: "/",
    });

    // ผ่านทุกเงื่อนไข: คืนค่าข้อมูลที่จำเป็นเพื่อเข้าสู่หน้าเลือกตั้ง
    return {
      success: true,
      memberId: member.id,
      electionId: election.id,
      maxVotes: election.maxVotes,
    };
  } catch (error) {
    console.error("Verification Error:", error);
    return {
      success: false,
      error: "เกิดข้อผิดพลาดที่เซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง",
    };
  }
}

// -------------------------------------------------------------
// ฟังก์ชันสำหรับ "ลบ" Cookie (เรียกใช้เมื่อทำรายการเสร็จที่หน้า Success)
// -------------------------------------------------------------
export async function clearVoterSession() {
  (await cookies()).delete("voter_session");
}
