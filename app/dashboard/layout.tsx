import AppSidebar from "./_components/AppSidebar";
import Topbar from "./_components/Topbar";

export const metadata = {
  title: "Admin Dashboard - ระบบเลือกตั้ง พม.",
  description: "ระบบจัดการข้อมูลการเลือกตั้งสหกรณ์",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* 1. แถบเมนูด้านซ้าย (Sidebar) */}
      <AppSidebar />

      {/* 2. พื้นที่การทำงานหลัก */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* แถบด้านบน (Topbar) */}
        <Topbar />

        {/* เนื้อหาหน้าเว็บ (Children) */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
