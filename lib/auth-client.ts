import "dotenv/config";

import { createAuthClient } from "better-auth/react";
export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : process.env.NEXT_PUBLIC_SERVER_URL,

  // หากคุณใช้ Trusted Origins (จำเป็นในบางกรณีบน Vercel)
  trustedOrigins: [
    process.env.NEXT_PUBLIC_SERVER_URL!,
    `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
  ],
});
