"use client";

import useSWR from "swr";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client"; // 👈 ดึง Session User
import {
  getElectionSettings,
  updateSystemSettings,
} from "@/actions/admin-election.action";

import {
  Bell,
  Menu,
  Crown,
  Power,
  Settings,
  Users,
  CheckSquare,
  BarChart3,
  UserCheck,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { menuItems } from "@/lib/consistent";

export default function Topbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false); // ควบคุม Mobile Menu

  // 1. ดึงข้อมูล User ที่ล็อกอินอยู่ (Better-Auth)
  const { data: sessionData } = authClient.useSession();
  const adminName = sessionData?.user?.name || "Admin";

  // 2. ดึงสถานะระบบ Real-time (SWR)
  const {
    data: settingsData,
    mutate,
    isLoading,
  } = useSWR(
    "system-settings",
    () => getElectionSettings(2026),
    { refreshInterval: 60000 }, // รีเฟรชเช็คสถานะทุก 1 นาที
  );

  const isSystemLive = settingsData?.settings?.isSystemActive ?? false;

  // 3. ฟังก์ชันสลับสถานะระบบฉุกเฉิน
  const toggleSystemStatus = async () => {
    if (
      confirm(isSystemLive ? "ยืนยันการปิดระบบฉุกเฉิน?" : "ยืนยันการเปิดระบบ?")
    ) {
      const totalMembers = settingsData?.settings?.totalMembersCount || 0;
      await updateSystemSettings(!isSystemLive, totalMembers);
      mutate(); // รีเฟรช UI ทันที
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 lg:px-8 z-10 shadow-sm">
      <div className="flex items-center">
        {/* 📱 Mobile Menu (Hamburger) */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="md:hidden mr-4 text-slate-500 hover:text-primary">
              <Menu className="w-6 h-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 flex flex-col">
            <SheetTitle className="sr-only">เมนูนำทาง</SheetTitle>
            <SheetDescription className="sr-only">
              เมนูสำหรับผู้ดูแลระบบ
            </SheetDescription>
            <div className="h-16 flex items-center px-6 border-b">
              <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black mr-3">
                พม.
              </span>
              <span className="font-bold">ระบบจัดการเลือกตั้ง</span>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg text-sm font-medium ${isActive ? "bg-primary text-white" : "text-slate-600 hover:bg-slate-100"}`}
                  >
                    <item.icon className="w-5 h-5 mr-3" /> {item.name}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>

        {/* 🟢 Status Badge */}
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        ) : (
          <Badge
            variant="outline"
            className={`hidden sm:flex px-3 py-1 font-medium border ${isSystemLive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}
          >
            <span
              className={`w-2 h-2 rounded-full mr-2 animate-pulse ${isSystemLive ? "bg-green-500" : "bg-red-500"}`}
            ></span>
            {isSystemLive ? "ระบบกำลังเปิดใช้งาน" : "ระบบปิดปรับปรุง"}
          </Badge>
        )}
      </div>

      {/* 👤 Right Side: Actions & Profile */}
      <div className="flex items-center gap-4">
        {/* ปุ่มลัด เปิด-ปิดระบบฉุกเฉิน */}
        <Button
          variant={isSystemLive ? "destructive" : "default"}
          size="sm"
          className="hidden sm:flex"
          onClick={toggleSystemStatus}
          disabled={isLoading}
        >
          <Power className="w-4 h-4 mr-2" />{" "}
          {isSystemLive ? "ปิดระบบฉุกเฉิน" : "เปิดระบบ"}
        </Button>

        <button className="relative p-2 text-slate-400 hover:text-slate-600">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <div className="w-px h-6 bg-slate-200 mx-2"></div>

        {/* ข้อมูล Admin (ดึงจาก Better-Auth) */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800">{adminName}</p>
            <p className="text-xs text-slate-500 flex items-center justify-end">
              <Crown className="w-3 h-3 text-amber-500 mr-1" /> Admin
            </p>
          </div>
          <div className="w-9 h-9 bg-primary text-white font-bold rounded-full flex items-center justify-center uppercase">
            {adminName.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  );
}
