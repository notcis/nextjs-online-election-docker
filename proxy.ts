// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminSession = getSessionCookie(request);

  // ------------------------------------------------------------------
  // Zone 1: ระบบหลังบ้าน (Admin Dashboard) ใช้ better-auth
  // ------------------------------------------------------------------
  if (pathname.startsWith("/dashboard")) {
    // เช็ค Cookie ของ better-auth (ชื่ออาจเปลี่ยนตาม Config ที่คุณตั้งไว้)
    /* const adminSession = request.cookies.get(
      "better-auth.session_token",
    )?.value; */

    if (!adminSession) {
      // ถ้าไม่มี Session แอดมิน ให้เด้งไปหน้า Login ของ Admin
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // อนุญาตให้เข้าหน้า Login ของ Admin ได้
  if (pathname.startsWith("/login")) {
    return NextResponse.next();
  }

  // ------------------------------------------------------------------
  // Zone 2: ระบบหน้าบ้าน (Voter System) ใช้ voter_session (โค้ดเดิม)
  // ------------------------------------------------------------------
  const voterSession = request.cookies.get("voter_session")?.value;
  const protectedVoterRoutes = ["/vote", "/confirm"];
  const isProtectedVoterRoute = protectedVoterRoutes.some((route) =>
    pathname.includes(route),
  );

  // กฎเดิม: ห้ามเข้าหน้าโหวตถ้ายังไม่ได้ Login
  if (isProtectedVoterRoute && !voterSession) {
    const yearMatch = pathname.match(/^\/(\d{4})/);
    const year = yearMatch ? yearMatch[1] : new Date().getFullYear().toString();
    return NextResponse.redirect(new URL(`/${year}`, request.url));
  }

  // กฎเดิม: ถ้า Login แล้ว ห้ามกลับไปหน้ากรอกบัตร ปชช.
  const isLandingPage = /^\/\d{4}$/.test(pathname);
  if (isLandingPage && voterSession) {
    return NextResponse.redirect(new URL(`${pathname}/vote`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|images|favicon.ico).*)"],
};
