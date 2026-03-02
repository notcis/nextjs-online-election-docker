import {
  BarChart3,
  Users,
  UserCheck,
  CheckSquare,
  History,
  Unplug,
} from "lucide-react";

export const menuItems = [
  { name: "ภาพรวม (Dashboard)", href: "/dashboard", icon: BarChart3 },
  {
    name: "จัดการการเลือกตั้ง",
    href: "/dashboard/election",
    icon: CheckSquare,
  },
  { name: "รายชื่อผู้สมัคร", href: "/dashboard/candidates", icon: UserCheck },
  { name: "รายชื่อสมาชิก", href: "/dashboard/members", icon: Users },
  {
    name: "เชื่อมโยงข้อมูล",
    href: "/dashboard/vote-tally",
    icon: Unplug,
  },
  {
    name: "ประวัติการใช้สิทธิ์",
    href: "/dashboard/vote-status",
    icon: History,
  },
];
