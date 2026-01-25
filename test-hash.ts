import bcrypt from "bcrypt";

// 1. เลขทะเบียนของ สมร
const card_id = "1111111111111";

// 2. เข้ารหัส
const securehash = bcrypt.hashSync(card_id, 10);

// 4. นำ votingUrl นี้ไปใส่เป็น action.uri ใน Flex Message หรือ Rich Menu
console.log("hash", securehash);
