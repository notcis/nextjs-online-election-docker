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

// [เพิ่มใหม่] 1. ดึงรายชื่อการเลือกตั้งทั้งหมดสำหรับทำ Dropdown
export async function getElectionsList() {
  try {
    const elections = await prisma.election.findMany({
      orderBy: { year: "desc" },
    });
    return { success: true, data: elections };
  } catch (error) {
    console.error("Get Elections Error:", error);
    return { success: false, error: "ไม่สามารถดึงข้อมูลปีการเลือกตั้งได้" };
  }
}

// [เพิ่มใหม่] 2. สร้างการเลือกตั้งใหม่
export async function createElection(data: {
  year: number;
  title: string;
  maxVotes: number;
  startTime: Date;
  endTime: Date;
}) {
  try {
    // เช็คว่าปีนี้สร้างไปแล้วหรือยัง
    const existing = await prisma.election.findUnique({
      where: { year: data.year },
    });

    if (existing) {
      return {
        success: false,
        error: `ปีการเลือกตั้ง ${data.year} มีอยู่ในระบบแล้ว`,
      };
    }

    if (data.endTime <= data.startTime) {
      return { success: false, error: "เวลาปิดหีบต้องอยู่หลังเวลาเปิดหีบ" };
    }

    await prisma.election.create({
      data: {
        year: data.year,
        title: data.title,
        maxVotes: data.maxVotes,
        startTime: data.startTime,
        endTime: data.endTime,
        isActive: true,
      },
    });

    revalidatePath("/dashboard/election");
    return { success: true };
  } catch (error) {
    console.error("Create Election Error:", error);
    return { success: false, error: "เกิดข้อผิดพลาดในการสร้างการเลือกตั้ง" };
  }
}
