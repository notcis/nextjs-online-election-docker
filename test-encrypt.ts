import { encryptForLineToken } from "./lib/crypto";

const memberIds = [
  "100001",
  "100002",
  "100003",
  "100004",
  "100005",
  "100006",
  "100007",
  "100008",
  "100009",
  "100010",
];

// 1. เลขทะเบียนของ สมร
//const memberId = "000001";

memberIds.map((memberId) => {
  // 2. เข้ารหัส
  const secureToken = encryptForLineToken(memberId);
  // ผลลัพธ์ตัวอย่าง: "9a2b3c4d...:8f9a2b1c..."

  // 3. สร้าง URL สำหรับปี 2026
  const votingUrl = `http://localhost:3000/2026?token=${secureToken}`;

  // 4. นำ votingUrl นี้ไปใส่เป็น action.uri ใน Flex Message หรือ Rich Menu
  console.log("เลขทะเบียน", memberId);
  console.log("votingUrl", votingUrl);
});
