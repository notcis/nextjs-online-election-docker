"use server";

import { getNowInThaiTime } from "@/lib/datetime";
import prisma from "@/lib/prisma";

export async function getDashboardData(year: number) {
  try {
    // 1. ดึงข้อมูลการเลือกตั้งปีปัจจุบัน
    const election = await prisma.election.findUnique({
      where: { year },
    });

    if (!election) {
      return { success: false, error: "ไม่พบข้อมูลการเลือกตั้ง" };
    }

    // 2. ดึงข้อมูลตั้งค่าระบบ (เพื่อเอาจำนวนสมาชิกทั้งหมด)
    const settings = await prisma.systemSetting.findUnique({
      where: { id: "global-settings" },
    });
    const totalMembers = settings?.totalMembersCount || 0;

    // 3. นับจำนวนผู้มีสิทธิ์เลือกตั้ง (isEligible = true)
    const totalEligible = await prisma.member.count({
      where: { isEligible: true },
    });

    // 4. ดึงข้อมูลคนที่มาโหวตทั้งหมด พร้อมข้อมูลส่วนตัว (อายุ, ภาค)
    const votedMembers = await prisma.memberVoteStatus.findMany({
      where: { electionId: election.id },
      include: {
        member: {
          select: { age: true, region: true }, // เลือกเฉพาะฟิลด์ที่ใช้ทำกราฟ
        },
      },
      orderBy: { votedAt: "asc" },
    });

    const totalVoted = votedMembers.length;

    // ==========================================
    // 📊 ส่วนที่ 1: คำนวณข้อมูลกราฟ (Analytics)
    // ==========================================

    // 1.1 กราฟแนวโน้มตามช่วงเวลา (Traffic Chart)
    const trafficMap: Record<string, number> = {};
    votedMembers.forEach((vote) => {
      // ใช้ชั่วโมงตามเวลา UTC โดยตรงจากฐานข้อมูล
      const hour =
        vote.votedAt.getUTCHours().toString().padStart(2, "0") + ":00";
      trafficMap[hour] = (trafficMap[hour] || 0) + 1;
    });
    const trafficData = Object.entries(trafficMap).map(([time, votes]) => ({
      time,
      votes,
    }));

    // 1.2 กราฟแยกตามภูมิภาค (Region Chart)
    const regionMap: Record<string, number> = {};
    votedMembers.forEach((vote) => {
      const region = vote.member.region || "ไม่ระบุ";
      regionMap[region] = (regionMap[region] || 0) + 1;
    });
    const regionData = Object.entries(regionMap).map(([name, value]) => ({
      name,
      value,
    }));

    // 1.3 กราฟแยกตามช่วงอายุ (Age Chart)
    const ageBuckets = {
      "20-30 ปี": 0,
      "31-45 ปี": 0,
      "46-60 ปี": 0,
      "60+ ปี": 0,
    };
    votedMembers.forEach((vote) => {
      const age = vote.member.age;
      if (age <= 30) ageBuckets["20-30 ปี"]++;
      else if (age <= 45) ageBuckets["31-45 ปี"]++;
      else if (age <= 60) ageBuckets["46-60 ปี"]++;
      else ageBuckets["60+ ปี"]++;
    });
    const ageData = Object.entries(ageBuckets).map(([age, votes]) => ({
      age,
      votes,
    }));

    // ==========================================
    // 🏆 ส่วนที่ 2: ดึงข้อมูล Leaderboard (Table)
    // ==========================================

    const tallies = await prisma.voteTally.findMany({
      where: { electionId: election.id },
      include: { candidate: true },
      orderBy: { totalVotes: "desc" },
    });

    // แยกคนปกติ และ ไม่ประสงค์ลงคะแนน
    const normalCandidates = tallies.filter((t) => !t.candidate.isAbstain);
    const abstainTally = tallies.find((t) => t.candidate.isAbstain);

    const liveResults = normalCandidates.map((t, index) => ({
      id: t.candidate.id,
      rank: index + 1,
      no: t.candidate.candidateNumber,
      name: `${t.candidate.firstName} ${t.candidate.lastName}`,
      img: t.candidate.imageUrl || "/images/default-avatar.png",
      votes: t.totalVotes,
      percent: totalVoted > 0 ? (t.totalVotes / totalVoted) * 100 : 0,
    }));

    const abstainResult = {
      votes: abstainTally?.totalVotes || 0,
      percent:
        totalVoted > 0
          ? ((abstainTally?.totalVotes || 0) / totalVoted) * 100
          : 0,
    };

    // ==========================================
    // 📦 ส่งข้อมูลทั้งหมดกลับไปให้ Dashboard
    // ==========================================

    console.log(election.endTime);

    return {
      success: true,
      summary: {
        totalMembers,
        totalEligible,
        totalVoted,
        votePercentage:
          totalEligible > 0 ? (totalVoted / totalEligible) * 100 : 0,
        endTime: calculateRemainingTime(election.endTime),
      },
      charts: {
        traffic: trafficData,
        region: regionData,
        age: ageData,
      },
      leaderboard: {
        totalVotes: totalVoted, // ใช้หารเปอร์เซ็นต์
        candidates: liveResults,
        abstain: abstainResult,
      },
    };
  } catch (error) {
    console.error("Dashboard Fetch Error:", error);
    return { success: false, error: "ไม่สามารถดึงข้อมูล Dashboard ได้" };
  }
}

const calculateRemainingTime = (endTimeParam: Date) => {
  // data.summary.endTime is already a Date object representing Thai time (UTC+7)
  const endTime = new Date(endTimeParam);
  const now = getNowInThaiTime(); // Get current Thai time

  const diffMs = endTime.getTime() - now.getTime();

  if (diffMs <= 0) {
    return "หมดเวลาลงคะแนนเสียงแล้ว";
  }

  const totalSeconds = Math.floor(diffMs / 1000);

  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  let result = "";
  if (days > 0) {
    result = `${days} วัน ${hours} ชั่วโมง`;
  } else if (hours > 0) {
    result = `${hours} ชั่วโมง ${minutes} นาที`;
  } else if (minutes > 0) {
    result = `${minutes} นาที ${seconds} วินาที`;
  } else if (seconds > 0) {
    result = `${seconds} วินาที`;
  } else {
    result = "ไม่กี่วินาที"; // Fallback for very small positive diffs
  }

  return result;
};
