"use client"; // ต้องใส่เสมอสำหรับ error.tsx

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // บันทึก Error ลง Log ระบบหลังบ้าน (เช่น Sentry หรือ Console)
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center space-y-6 animate-in fade-in zoom-in duration-300">
        {/* ไอคอนแจ้งเตือน */}
        <div className="mx-auto bg-red-100 w-20 h-20 rounded-full flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>

        {/* ข้อความอธิบาย */}
        <div>
          <h1 className="text-2xl font-black text-gray-900">
            ขออภัย เกิดข้อผิดพลาด
          </h1>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            ระบบขัดข้องชั่วคราว หรือการเชื่อมต่ออินเทอร์เน็ตมีปัญหา
            กรุณาลองใหม่อีกครั้ง
          </p>
        </div>

        {/* ปุ่ม Action */}
        <div className="flex flex-col gap-3">
          {/* ปุ่ม Reset จะทำการ Re-render คอมโพเนนต์ที่มีปัญหาใหม่ */}
          <Button
            onClick={() => reset()}
            className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90 shadow-md"
          >
            <RefreshCcw className="w-5 h-5 mr-2" />
            ลองใหม่อีกครั้ง
          </Button>

          {/* ปุ่มกลับหน้าแรก (เผื่อกรณี Reset ไม่หาย) */}
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
            className="w-full h-12 text-base font-bold text-gray-600 border-gray-300"
          >
            <Home className="w-5 h-5 mr-2" />
            กลับไปหน้าแรก
          </Button>
        </div>

        {/* รหัส Error (สำหรับแจ้ง Admin) */}
        <p className="text-xs text-gray-300 font-mono">
          รหัสอ้างอิง: {error.digest || "ERR_UNKNOWN_CRASH"}
        </p>
      </div>
    </div>
  );
}
