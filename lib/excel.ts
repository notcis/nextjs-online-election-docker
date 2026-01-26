import * as XLSX from "xlsx";

// =========================================================================
// 1. ฟังก์ชันนำเข้าข้อมูล "ผู้สมัคร" (Candidate)
// รูปแบบ Excel: [0] หมายเลข, [1] ชื่อ, [2] นามสกุล, [3] URL รูปภาพ
// =========================================================================
export async function parseExcelToCandidates(file: File) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Promise<any[]>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // แปลงเป็น Array 2 มิติ
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // ตัดแถวหัวตาราง (แถว 0) ออก และแมพข้อมูล
        const candidates = jsonData
          .slice(1)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((row: any) => ({
            candidateNumber: parseInt(row[0]),
            firstName: String(row[1] || "").trim(),
            lastName: String(row[2] || "").trim(),
            imageUrl: row[3] || null,
          }))
          .filter((c) => !isNaN(c.candidateNumber) && c.firstName !== "");

        resolve(candidates);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

// =========================================================================
// 2. ฟังก์ชันนำเข้าข้อมูล "สมาชิก" (Member) [ตัวใหม่ 🌟]
// รูปแบบ Excel: [0] เลขทะเบียน, [1] เลขบัตร ปชช., [2] อายุ, [3] ภาค, [4] สิทธิ์ (ถ้ามี)
// =========================================================================
export async function parseExcelToMembers(file: File) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Promise<any[]>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // ตัดแถวหัวตารางออก และแมพข้อมูล
        const members = jsonData
          .slice(1)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((row: any) => {
            // 1. ดึงค่าจากแต่ละคอลัมน์
            const memberCode = String(row[0] || "").trim();
            // แปลงเลขบัตร ปชช. เป็น String เสมอ (ป้องกัน Excel แปลงเป็น E-notation)
            const nationalId = String(row[1] || "").trim();
            const age = parseInt(row[2]);
            const region = String(row[3] || "").trim();

            // 2. แปลงข้อความสิทธิ์เลือกตั้ง (คอลัมน์ E) ให้เป็น Boolean
            // รองรับคำว่า: 0, 1, false, true, "ไม่มีสิทธิ์", "ระงับสิทธิ์"
            let isEligible = true; // ค่าเริ่มต้นคือมีสิทธิ์
            const eligibleStr = String(row[4] || "")
              .trim()
              .toLowerCase();
            if (
              eligibleStr === "0" ||
              eligibleStr === "false" ||
              eligibleStr.includes("ไม่มี") ||
              eligibleStr.includes("ระงับ")
            ) {
              isEligible = false;
            }

            return { memberCode, nationalId, age, region, isEligible };
          })
          // 3. กรองเฉพาะแถวที่มีข้อมูลครบถ้วน (ต้องมีเลขทะเบียน และเลขบัตร ปชช. ครบ 13 หลัก)
          .filter(
            (m) =>
              m.memberCode !== "" &&
              m.nationalId.length === 13 &&
              !isNaN(m.age),
          );

        resolve(members);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}
