import "dotenv/config";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mysql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [nextCookies()],

  // --- แก้ไขตรงนี้ ---
  // ให้ใช้ค่าจาก .env ตรงๆ ถ้าไม่มีค่อยถอยไปหา Vercel หรือ Localhost
  baseURL:
    process.env.BETTER_AUTH_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"),

  secret: process.env.BETTER_AUTH_SECRET,

  // --- เพิ่มความปลอดภัยและการจัดการ Cookie ---
  advanced: {
    // ถ้าไม่มี HTTPS (รันผ่าน IP) ให้ตั้งเป็น false เพื่อให้ Cookie ทำงานได้
    // แต่ถ้ามี SSL แล้ว ให้ใช้ true
    useSecureCookies:
      process.env.NODE_ENV === "production" &&
      process.env.BETTER_AUTH_URL?.startsWith("https"),
  },

  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001", // เพิ่มพอร์ต 3001 ที่คุณใช้ใน Docker
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL, // เพิ่ม URL ฝั่งหน้าบ้าน
  ].filter(Boolean) as string[],
});
