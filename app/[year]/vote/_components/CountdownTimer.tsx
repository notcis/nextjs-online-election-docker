"use client";

import { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNowInThaiTime } from "@/lib/datetime";

interface CountdownTimerProps {
  endTime: Date | string;
}

export default function CountdownTimer({ endTime }: CountdownTimerProps) {
  // 1. เพิ่ม days เข้าไปใน State
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    mins: number;
    secs: number;
  } | null>(null);

  useEffect(() => {
    const end = new Date(endTime).getTime();

    const updateTimer = () => {
      const now = getNowInThaiTime().getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }

      // 2. คำนวณจำนวนวัน และชั่วโมงที่เหลือจากเศษของวัน
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (!timeLeft) return null;

  // 3. อัปเดตเงื่อนไข: จะขึ้นเตือนใกล้หมดเวลา ก็ต่อเมื่อ วัน=0, ชั่วโมง=0 และเหลือน้อยกว่า 30 นาที
  const isEndingSoon = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.mins < 30;
  
  const isExpired =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.mins === 0 &&
    timeLeft.secs === 0;

  if (isExpired) {
    return (
      <div className="flex items-center justify-center bg-red-100 text-red-700 px-4 py-2 text-sm font-bold">
        <AlertTriangle className="w-4 h-4 mr-2" />
        หมดเวลาลงคะแนนเสียง
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors",
        isEndingSoon ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700",
      )}
    >
      <Clock className="w-4 h-4 mr-2" />
      เหลือเวลา:
      <span className="font-bold ml-1 tabular-nums">
        {/* 4. แสดงจำนวนวัน เฉพาะกรณีที่มีเวลาเหลือตั้งแต่ 1 วันขึ้นไป */}
        {timeLeft.days > 0 && `${timeLeft.days} วัน `}
        {timeLeft.hours.toString().padStart(2, "0")} ชม.{" "}
        {timeLeft.mins.toString().padStart(2, "0")} น.{" "}
        {timeLeft.secs.toString().padStart(2, "0")} วินาที
      </span>
    </div>
  );
}