"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  getCandidates,
  saveCandidate,
  deleteCandidate,
} from "@/actions/candidate.action";
import ExcelImportModal from "@/components/ExcelImportModal";
import { UploadButton } from "@/components/uploadthing";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FileUp, Plus, Trash2, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CandidatesPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [candidates, setCandidates] = useState<any[]>([]);
  const [electionId, setElectionId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<any>({
    candidateNumber: "",
    firstName: "",
    lastName: "",
    imageUrl: "",
  });

  // 👈 2. ห่อ loadData ด้วย useCallback เพื่อจำค่าฟังก์ชันไม่ให้เปลี่ยนทุกครั้งที่ Render
  const loadData = useCallback(async () => {
    const res = await getCandidates(2026);
    if (res.success) {
      setCandidates(res.candidates);
      setElectionId(res.electionId!);
    }
  }, []); // <--- Dependency array ว่างเปล่า เพราะไม่มีตัวแปรภายนอก

  // 👈 3. ปรับการเรียกใน useEffect โดยสร้างฟังก์ชัน async ย่อยไว้ข้างใน
  useEffect(() => {
    const fetchInitialData = async () => {
      await loadData();
    };

    fetchInitialData();
  }, [loadData]); // ใส่ loadData เป็น Dependency ได้อย่างปลอดภัยแล้ว

  const handleSave = async () => {
    await saveCandidate({
      ...formData,
      electionId,
      candidateNumber: parseInt(formData.candidateNumber),
    });
    setFormOpen(false);
    await loadData(); // Await to ensure data is reloaded after save completes
  };

  const handleDelete = async (id: string) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบผู้สมัครท่านนี้?")) {
      await deleteCandidate(id);
      await loadData(); // Await to ensure data is reloaded after delete completes
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800">จัดการผู้สมัคร</h1>
          <p className="text-sm text-slate-500">
            เพิ่ม ลบ แก้ไข และอัปโหลดรูปภาพผู้สมัคร
          </p>
        </div>
        <div className="flex gap-3">
          {/* ปุ่ม Import Excel */}
          <Button variant="outline" onClick={() => setIsModalOpen(true)}>
            <FileUp className="w-4 h-4 mr-2" /> นำเข้า (Excel)
          </Button>

          {/* ปุ่มเพิ่มทีละคน */}
          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() =>
                  setFormData({
                    candidateNumber: "",
                    firstName: "",
                    lastName: "",
                    imageUrl: "",
                  })
                }
              >
                <Plus className="w-4 h-4 mr-2" /> เพิ่มผู้สมัคร
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {formData.id ? "แก้ไขข้อมูล" : "เพิ่มผู้สมัครใหม่"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="หมายเลขผู้สมัคร"
                  type="number"
                  value={formData.candidateNumber}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      candidateNumber: e.target.value,
                    })
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="ชื่อ"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
                  />
                  <Input
                    placeholder="นามสกุล"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                  />
                </div>
                {/* ☁️ ปุ่มอัปโหลดรูปของ Uploadthing */}
                <div className="border rounded-md p-4 bg-slate-50 flex items-center gap-4">
                  {formData.imageUrl && (
                    <Image
                      src={formData.imageUrl}
                      alt="preview"
                      width={60}
                      height={60}
                      className="rounded-full border shadow-sm"
                      unoptimized
                    />
                  )}
                  <UploadButton
                    endpoint="candidateImage"
                    onClientUploadComplete={(res) =>
                      setFormData({ ...formData, imageUrl: res[0].ufsUrl })
                    }
                  />
                </div>
                <Button className="w-full" onClick={handleSave}>
                  บันทึกข้อมูล
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* ตารางแสดงข้อมูล */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] text-center">หมายเลข</TableHead>
              <TableHead>รูปภาพ</TableHead>
              <TableHead>ชื่อ - นามสกุล</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidates.map((cand) => (
              <TableRow key={cand.id}>
                <TableCell className="text-center font-bold text-lg">
                  {cand.candidateNumber || "-"}
                </TableCell>
                <TableCell>
                  <Avatar>
                    <AvatarImage src={cand.imageUrl} />
                    <AvatarFallback>NO</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">
                  {cand.isAbstain
                    ? "ไม่ประสงค์ลงคะแนน"
                    : `${cand.firstName} ${cand.lastName}`}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {!cand.isAbstain && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setFormData(cand);
                          setFormOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(cand.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ExcelImportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        electionId={electionId}
        onRefresh={loadData}
        type="candidate"
      />
    </div>
  );
}
