"use client";

import { useState } from "react";
import { parseExcelToCandidates } from "@/lib/excel";
import { importCandidates } from "@/actions/candidate.action";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UploadCloud, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ExcelImportModal({
  isOpen,
  onClose,
  electionId,
  onRefresh,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError("");

    try {
      // 1. แปลงไฟล์เป็น JSON
      const data = await parseExcelToCandidates(file);

      // 2. ส่งให้ Server Action บันทึก
      const res = await importCandidates(electionId, data);

      if (res.success) {
        setSuccess(`นำเข้าข้อมูลสำเร็จ ${res.count} รายการ`);
        onRefresh(); // รีเฟรชตารางหน้าหลัก
        setTimeout(() => {
          onClose();
          setSuccess("");
          setFile(null);
        }, 2000);
      } else {
        setError(res.error || "เกิดข้อผิดพลาด");
      }
    } catch (err) {
      setError("ไฟล์ไม่ถูกต้อง โปรดใช้ไฟล์ .xlsx และจัดรูปแบบให้ถูกต้อง");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>นำเข้าข้อมูลผู้สมัคร (Excel)</DialogTitle>
          <DialogDescription>
            กรุณาใช้ไฟล์ .xlsx ที่มีคอลัมน์: หมายเลข, ชื่อ, นามสกุล, URL รูปภาพ
            (ถ้ามี)
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="w-4 h-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            id="excel-upload"
          />
          <label
            htmlFor="excel-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            <UploadCloud className="w-10 h-10 text-slate-400 mb-2" />
            <span className="font-semibold">
              {file ? file.name : "คลิกเพื่อเลือกไฟล์ Excel"}
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleImport}
            disabled={!file || loading}
            className="bg-primary"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              "นำเข้าข้อมูล"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
