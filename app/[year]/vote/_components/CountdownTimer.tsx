"use client";

import { useEffect, useState } from "react"; // Import useEffect and useState
import { Clock, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNowInThaiTime } from "@/lib/datetime";

interface CountdownTimerProps {
  endTime: Date | string;
}

export default function CountdownTimer({ endTime }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    mins: number;
    secs: number;
  } | null>(null);

  useEffect(() => {
    const end = new Date(endTime).getTime();

    const updateTimer = () => {
      const now = getNowInThaiTime().getTime(); // ใช้เวลาปัจจุบันใน Thai Time Zone
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft({ hours: 0, mins: 0, secs: 0 });
        return;
      }

      setTimeLeft({
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        ),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    updateTimer(); // เรียกครั้งแรกทันที
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  // ซ่อน Component ถ้ายังโหลดไม่เสร็จ เพื่อป้องกัน Hydration error
  if (!timeLeft) return null;

  const isEndingSoon = timeLeft.hours === 0 && timeLeft.mins < 30;
  const isExpired =
    timeLeft.hours === 0 && timeLeft.mins === 0 && timeLeft.secs === 0;

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
        {timeLeft.hours.toString().padStart(2, "0")} ชม.{" "}
        {timeLeft.mins.toString().padStart(2, "0")} น.{" "}
        {timeLeft.secs.toString().padStart(2, "0")} วินาที
      </span>
    </div>
  );
}
