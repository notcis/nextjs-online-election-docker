import * as XLSX from "xlsx";

export async function parseExcelToCandidates(file: File) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Promise<any[]>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // แปลงเป็น JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // ข้ามแถว Header (แถวที่ 0) แล้วแมพข้อมูล
        const candidates = jsonData
          .slice(1)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((row: any) => ({
            candidateNumber: parseInt(row[0]),
            firstName: row[1],
            lastName: row[2],
            imageUrl: row[3] || null, // URL รูปภาพ (ถ้ามี)
          }))
          .filter((c) => !isNaN(c.candidateNumber)); // กรองแถวว่างออก

        resolve(candidates);
      } catch (err) {
        reject(err);
      }
    };
    reader.readAsArrayBuffer(file);
  });
}
