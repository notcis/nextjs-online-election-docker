"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Icons
import {
  LayoutDashboard,
  Building2,
  DoorOpen,
  Users,
  Zap,
  Receipt,
  FileText,
  Menu,
  LogOut,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// 1. เมนูเอาไว้นอกสุดเหมือนเดิม
const navItems = [
  { name: "ภาพรวม", href: "/dashboard", icon: LayoutDashboard },
  { name: "จัดการสาขา", href: "/dashboard/branches", icon: Building2 },
  { name: "จัดการห้องพัก", href: "/dashboard/rooms", icon: DoorOpen },
  { name: "ผู้เช่า", href: "/dashboard/tenants", icon: Users },
  { name: "จดมิเตอร์ น้ำ/ไฟ", href: "/dashboard/utilities", icon: Zap },
  { name: "บิลเรียกเก็บ", href: "/dashboard/invoices", icon: Receipt },
  { name: "รายงาน", href: "/dashboard/reports", icon: FileText },
];

// 2. แยก SidebarContent ออกมาเป็น Component อิสระข้างนอก
// รับ prop 'onNavigate' เพื่อสั่งปิดเมนูมือถือเวลาคลิก
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-950 border-r">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b">
        <Building2 className="h-6 w-6 text-primary mr-2" />
        <span className="font-bold text-lg">Awi Apartment</span>
      </div>

      {/* Nav Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate} // เรียกฟังก์ชันปิดเมนู (ถ้ามีส่งมา)
              className={cn(
                "flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800",
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 mr-3",
                  isActive ? "text-primary" : "text-zinc-500",
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </div>

      {/* User Footer */}
      <div className="p-4 border-t bg-zinc-50 dark:bg-zinc-900">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarImage src={session?.user?.image || ""} />
            <AvatarFallback>
              {session?.user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate text-zinc-900 dark:text-white">
              {session?.user?.name || "Loading..."}
            </p>
            <p className="text-xs text-zinc-500 truncate">
              {session?.user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3. Main Layout Component
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login"); // กลับไปหน้า Login หลังออกระบบ
        },
      },
    });
  };

  return (
    <div className="flex min-h-screen bg-zinc-50/50 dark:bg-zinc-900">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
        {/* ไม่ต้องส่ง onNavigate เพราะ Desktop ไม่ต้องปิดเมนู */}
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b bg-white dark:bg-zinc-950 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                {/* ส่งฟังก์ชันปิดเมนูไปให้ Sidebar ของ Mobile */}
                <SidebarContent onNavigate={() => setIsMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>

            <h1 className="text-lg font-semibold text-zinc-800 dark:text-zinc-100">
              {navItems.find((i) => i.href === pathname)?.name || "Dashboard"}
            </h1>
          </div>

          {/* User Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback>
                    {session?.user?.name?.charAt(0) || "A"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-red-600 focus:text-red-600 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>ออกจากระบบ</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
