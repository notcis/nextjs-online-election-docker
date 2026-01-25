import { encryptForLineToken } from "./lib/crypto";

// 1. เลขทะเบียนของ สมร
const memberId = "100001";

// 2. เข้ารหัส
const secureToken = encryptForLineToken(memberId);
// ผลลัพธ์ตัวอย่าง: "9a2b3c4d...:8f9a2b1c..."

// 3. สร้าง URL สำหรับปี 2026
const votingUrl = `http://localhost:3000/2026?token=${secureToken}`;

// 4. นำ votingUrl นี้ไปใส่เป็น action.uri ใน Flex Message หรือ Rich Menu
console.log("ส่ง URL นี้เข้า LINE ของสมร:", votingUrl);
