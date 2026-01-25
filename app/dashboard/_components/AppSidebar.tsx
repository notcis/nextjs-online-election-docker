"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart3, Users, Settings, UserCheck, CheckSquare, LogOut } from "lucide-react";

// รายการเมนู
const menuItems = [
  { name: "ภาพรวม (Dashboard)", href: "/dashboard", icon: BarChart3 },
  { name: "จัดการการเลือกตั้ง", href: "/dashboard/election", icon: CheckSquare },
  { name: "รายชื่อผู้สมัคร", href: "/dashboard/candidates", icon: UserCheck },
  { name: "ฐานข้อมูลสมาชิก", href: "/dashboard/members", icon: Users },
  { name: "ตั้งค่าระบบ", href: "/dashboard/settings", icon: Settings },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r shadow-sm h-full">
      {/* ส่วนหัวโลโก้ */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black mr-3">
          พม.
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800 leading-tight">ระบบจัดการเลือกตั้ง</h2>
          <p className="text-xs text-slate-400">ผู้ดูแลระบบ</p>
        </div>
      </div>

      {/* รายการเมนู */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all",
                isActive
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "text-slate-600 hover:bg-slate-50 hover:text-primary"
              )}
            >
              <item.icon className={cn("w-5 h-5 mr-3", isActive ? "text-white" : "text-slate-400")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* ส่วนล่าง (Logout) */}
      <div className="p-4 border-t border-slate-100">
        <button className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-all">
          <LogOut className="w-5 h-5 mr-3" />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
}