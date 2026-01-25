import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"; // นำเข้าเมื่อติดตั้ง shadcn/ui toast

// ตั้งค่าฟอนต์ภาษาไทย
const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-noto-sans-thai",
});

// ตั้งค่า Metadata หลักสำหรับการแชร์ลิงก์หรือแสดงผลบน Search Engine
export const metadata: Metadata = {
  title: "ระบบเลือกตั้งออนไลน์ - สหกรณ์ออมทรัพย์ พม.",
  description: "ระบบลงคะแนนเสียงเลือกตั้งออนไลน์ สะดวก ปลอดภัย ผ่านสมาร์ทโฟน",
  icons: {
    icon: "/favicon.ico",
  },
};

// ตั้งค่า Viewport เพื่อป้องกันไม่ให้มือถือซูมเข้าอัตโนมัติเวลากด Input
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body
        className={`${notoSansThai.className} bg-gray-200 text-slate-900 antialiased`}
      >
        {/* children ตรงนี้จะถูกแทนที่ด้วย [year]/layout.tsx ที่เราทำไว้ก่อนหน้านี้ */}
        {children}

        <Toaster richColors />
      </body>
    </html>
  );
}
