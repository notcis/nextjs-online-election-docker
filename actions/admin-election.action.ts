"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { convertUtcToThaiTime, getNowInThaiTime } from "@/lib/datetime";

// -----------------------------------------------------------------
// 1. ดึงข้อมูลการตั้งค่าทั้งหมด (หน้าแรก)
// -----------------------------------------------------------------
export async function getElectionSettings(year: number) {
  try {
    // ดึงข้อมูลการเลือกตั้งของปีนั้น
    const election = await prisma.election.findUnique({
      where: { year },
    });

    // ดึงข้อมูล Master Setting
    let settings = await prisma.systemSetting.findUnique({
      where: { id: "global-settings" },
    });

    // ถ้ายังไม่มี Setting (เพิ่งรันครั้งแรก) ให้สร้างใหม่
    if (!settings) {
      settings = await prisma.systemSetting.create({
        data: {
          id: "global-settings",
          isSystemActive: false,
          totalMembersCount: 0,
        },
      });
    }

    return { success: true, election, settings };
  } catch (error) {
    console.error("Get Settings Error:", error);
    return { success: false, error: "ไม่สามารถดึงข้อมูลการตั้งค่าได้" };
  }
}

// -----------------------------------------------------------------
// 2. อัปเดต สวิตช์ระบบ และ จำนวนสมาชิกทั้งหมด (System Setting)
// -----------------------------------------------------------------
export async function updateSystemSettings(
  isSystemActive: boolean,
  totalMembersCount: number,
) {
  try {
    await prisma.systemSetting.update({
      where: { id: "global-settings" },
      data: { isSystemActive, totalMembersCount },
    });

    revalidatePath("/dashboard"); // รีเฟรชข้อมูลที่แคชไว้ในหน้า Dashboard
    return { success: true };
  } catch (error) {
    console.error("Update System Error:", error);
    return { success: false, error: "อัปเดตสถานะระบบไม่สำเร็จ" };
  }
}

// -----------------------------------------------------------------
// 3. อัปเดต ข้อมูลการเลือกตั้ง (Election Config)
// -----------------------------------------------------------------
export async function updateElectionConfig(
  id: string,
  title: string,
  maxVotes: number,
  startTime: Date,
  endTime: Date,
) {
  try {
    // ป้องกันการใส่วันปิด ก่อน วันเปิด
    if (endTime <= startTime) {
      return {
        success: false,
        error: "วัน-เวลาปิดโหวต ต้องอยู่หลังวันเปิดโหวต",
      };
    }

    await prisma.election.update({
      where: { id },
      data: {
        title,
        maxVotes,
        startTime: convertUtcToThaiTime(startTime),
        endTime: convertUtcToThaiTime(endTime),
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Update Election Error:", error);
    return { success: false, error: "บันทึกข้อมูลการเลือกตั้งไม่สำเร็จ" };
  }
}
