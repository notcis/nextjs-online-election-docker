import "dotenv/config";
import crypto from "crypto";

// -------------------------------------------------------------
// 1. ฟังก์ชันถอดรหัส Token จาก LINE (AES-256-CBC)
// -------------------------------------------------------------
export function decryptLineToken(encryptedToken: string): string | null {
  try {
    // สมมติว่า Token ถูกเข้ารหัสมาแบบ "iv:encryptedData"
    // ต้องตั้งค่า SECRET_KEY ขนาด 32 bytes (64 hexadecimal characters) ใน .env
    const ENCRYPTION_KEY_HEX = process.env.ENCRYPTION_SECRET_KEY || "";
    const ENCRYPTION_KEY = Buffer.from(ENCRYPTION_KEY_HEX, "hex"); // Convert hex string to Buffer
    const textParts = encryptedToken.split(":");
    const iv = Buffer.from(textParts.shift()!, "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");

    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      ENCRYPTION_KEY, // Use the Buffer directly
      iv,
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString(); // ผลลัพธ์จะได้เป็นเลขทะเบียน 6 หลัก
  } catch (error) {
    console.error("Token Decryption Failed:", error);
    return null;
  }
}

// -------------------------------------------------------------
// ฟังก์ชันเข้ารหัส เลขทะเบียน 6 หลัก (AES-256-CBC)
// -------------------------------------------------------------
export function encryptForLineToken(memberCode: string): string {
  try {
    // 1. ดึง Secret Key จาก .env (ต้องเป็นตัวเดียวกับฝั่งเว็บเลือกตั้ง และต้องมีความยาว 32 ตัวอักษรพอดี)
    const ENCRYPTION_KEY_HEX = process.env.ENCRYPTION_SECRET_KEY || "";
    const ENCRYPTION_KEY = Buffer.from(ENCRYPTION_KEY_HEX, "hex"); // Convert hex string to Buffer

    if (ENCRYPTION_KEY.length !== 32 || ENCRYPTION_KEY_HEX.length !== 64) {
      throw new Error(
        "ENCRYPTION_SECRET_KEY must be exactly 32 bytes (64 hexadecimal characters) long.",
      );
    }

    // 2. สร้าง IV (Initialization Vector) แบบสุ่มขนาด 16 bytes
    // (การสุ่ม IV ทำให้การเข้ารหัสข้อความเดิม ได้ผลลัพธ์ไม่ซ้ำกัน ปลอดภัยขึ้น)
    const iv = crypto.randomBytes(16);

    // 3. เริ่มกระบวนการเข้ารหัส
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      ENCRYPTION_KEY, // Use the Buffer directly
      iv,
    );

    let encrypted = cipher.update(memberCode);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // 4. นำ IV และ ข้อมูลที่เข้ารหัสแล้ว มาต่อกันด้วยเครื่องหมาย ":"
    // แปลงเป็น base hex เพื่อให้ส่งผ่าน URL ได้อย่างปลอดภัย
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  } catch (error) {
    console.error("Encryption Failed:", error);
    throw error;
  }
}
