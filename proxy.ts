import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // 1. ดึง URL ปัจจุบันที่ผู้ใช้กำลังจะเข้า
  const { pathname } = request.nextUrl;

  // 2. ดึง Cookie ที่ชื่อ "voter_session" (ตั๋วผ่านทางที่ได้จากการ Login สำเร็จ)
  const voterSession = request.cookies.get("voter_session")?.value;

  // 3. กำหนดหน้าเว็บที่ "ต้องห้ามเข้า" ถ้ายังไม่ได้ยืนยันตัวตน
  const protectedRoutes = ["/vote", "/confirm"];

  // ตรวจสอบว่า URL ปัจจุบันมีคำต้องห้ามอยู่ใน protectedRoutes หรือไม่
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.includes(route),
  );

  // --- กฎข้อที่ 1: ถ้าจะเข้าหน้าหวงห้าม แต่ไม่มี Cookie (ยังไม่ได้ยืนยันตัวตน) ---
  if (isProtectedRoute && !voterSession) {
    // ดึงปีการเลือกตั้งจาก URL (เช่น /2026/vote -> ได้ 2026)
    const yearMatch = pathname.match(/^\/(\d{4})/);
    const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();

    // เตะกลับไปหน้าแรก (หน้า Landing) เพื่อให้ไปยืนยันตัวตนก่อน
    return NextResponse.redirect(new URL(`/${year}`, request.url));
  }

  // --- กฎข้อที่ 2 (Optional): ถ้ามี Cookie แล้ว (ยืนยันแล้ว) แต่พยายามกลับไปหน้าแรก (หน้ากรอกบัตร ปชช) ---
  // ให้พาข้ามไปหน้า /vote เลย เพื่อความสะดวก (UX)
  const isLandingPage = /^\/\d{4}$/.test(pathname); // เช็คว่าเป็นหน้า /2026 เพียวๆ หรือไม่
  if (isLandingPage && voterSession) {
    return NextResponse.redirect(new URL(`${pathname}/vote`, request.url));
  }

  // --- กฎข้อที่ 3: หน้า /results เป็นหน้าสาธารณะ (ใครก็ดูได้) ไม่ต้องเช็ค Cookie ---
  if (pathname.includes("/results")) {
    return NextResponse.next();
  }

  // ถ้าผ่านเงื่อนไขทั้งหมด ให้เข้าสู่หน้าเว็บได้ตามปกติ
  return NextResponse.next();
}

// กำหนดขอบเขตให้ Middleware ทำงานเฉพาะเส้นทางที่เราต้องการ (ลดภาระ Server)
export const config = {
  matcher: [
    // ให้ทำงานกับ URL ที่ขึ้นต้นด้วยปี 4 หลัก (เช่น /2026, /2026/vote, /2027/confirm)
    "/((?!api|_next/static|_next/image|images|favicon.ico).*)",
  ],
};
