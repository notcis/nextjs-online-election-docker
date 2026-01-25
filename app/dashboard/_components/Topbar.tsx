"use client";

import { useState } from "react";
import { Bell, Menu, Crown, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Topbar() {
  // สมมติ State ควบคุมระบบ เปิด/ปิดการเลือกตั้ง (เดี๋ยวเราจะเชื่อมกับ DB ภายหลัง)
  const [isSystemLive, setIsSystemLive] = useState(true);

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-8 z-10 shadow-sm">
      {/* ซ้าย: ปุ่ม Hamburger (สำหรับมือถือ) และ ชื่อหน้า */}
      <div className="flex items-center">
        <button className="md:hidden mr-4 text-slate-500">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
          {/* ป้ายแสดงสถานะระบบ (System Status) */}
          <Badge
            variant="outline"
            className={`px-3 py-1 font-medium border ${isSystemLive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
          >
            <span
              className={`w-2 h-2 rounded-full mr-2 animate-pulse ${isSystemLive ? "bg-green-500" : "bg-red-500"}`}
            ></span>
            {isSystemLive ? "ระบบกำลังเปิดรับลงคะแนน" : "ระบบปิดปรับปรุง"}
          </Badge>
        </div>
      </div>

      {/* ขวา: ระบบแจ้งเตือน & โปรไฟล์ */}
      <div className="flex items-center gap-4">
        {/* ปุ่มลัด เปิด-ปิดระบบฉุกเฉิน */}
        <Button
          variant={isSystemLive ? "destructive" : "default"}
          size="sm"
          className="hidden sm:flex"
          onClick={() => setIsSystemLive(!isSystemLive)}
        >
          <Power className="w-4 h-4 mr-2" />
          {isSystemLive ? "ปิดระบบฉุกเฉิน" : "เปิดระบบ"}
        </Button>

        {/* กระดิ่งแจ้งเตือน */}
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <div className="w-px h-6 bg-slate-200 mx-2"></div>

        {/* โปรไฟล์แอดมิน */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">Admin Awi</p>
            <p className="text-xs text-slate-500 flex items-center justify-end">
              <Crown className="w-3 h-3 text-amber-500 mr-1" /> Super Admin
            </p>
          </div>
          <div className="w-9 h-9 bg-primary text-white font-bold rounded-full flex items-center justify-center">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
