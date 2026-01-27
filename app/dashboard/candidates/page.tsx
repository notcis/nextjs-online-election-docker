"use client";

import { useState } from "react";
import useSWR from "swr";
import { useDebounce } from "use-debounce";
import Image from "next/image";

import {
  getCandidates,
  saveCandidate,
  deleteCandidate,
} from "@/actions/candidate.action";
import DataTable from "@/components/DataTable"; // 👈 พระเอกของเรา
import ExcelImportModal from "@/components/ExcelImportModal";
import { UploadButton } from "@/components/uploadthing";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileUp, Plus, Trash2, Pencil, Search, UserCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CandidatesPage() {
  // --- States สำหรับ Pagination & Search ---
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  // --- SWR Data Fetching ---
  const { data, isLoading, mutate } = useSWR(
    ["candidates", page, debouncedSearch], // Key เปลี่ยนเมื่อค้นหาหรือเปลี่ยนหน้า
    () => getCandidates(2026, page, 20, debouncedSearch),
    { keepPreviousData: true },
  );

  const candidates = data?.candidates || [];
  const totalPages = data?.totalPages || 1;
  const electionId = data?.electionId || "";

  // --- Modal & Form States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<any>({
    candidateNumber: "",
    firstName: "",
    lastName: "",
    imageUrl: "",
  });

  // --- Handlers ---
  const handleSave = async () => {
    const res = await saveCandidate({
      ...formData,
      electionId,
      candidateNumber: parseInt(formData.candidateNumber),
    });
    if (res.success) {
      setFormOpen(false);
      mutate(); // รีเฟรชตาราง
    } else {
      alert(res.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบผู้สมัครท่านนี้?")) {
      await deleteCandidate(id);
      mutate();
    }
  };

  // --- 🎨 Render Row (ส่งให้ DataTable) ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderRow = (cand: any) => (
    <TableRow key={cand.id}>
      <TableCell className="text-center font-black text-lg text-slate-700">
        {cand.isAbstain ? "-" : cand.candidateNumber}
      </TableCell>
      <TableCell>
        <Avatar>
          <AvatarImage src={cand.imageUrl} />
          <AvatarFallback>NO</AvatarFallback>
        </Avatar>
      </TableCell>
      <TableCell>
        {cand.isAbstain ? (
          <Badge variant="secondary" className="bg-slate-100 text-slate-500">
            ไม่ประสงค์ลงคะแนน
          </Badge>
        ) : (
          <div className="font-medium text-slate-900">
            {cand.firstName} {cand.lastName}
          </div>
        )}
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
  );

  return (
    <div className="space-y-6">
      {/* --- Header & Toolbar --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center">
            <UserCheck className="w-6 h-6 mr-2 text-primary" />
            จัดการผู้สมัคร
          </h1>
          <p className="text-sm text-slate-500">
            เพิ่ม ลบ แก้ไข และอัปโหลดรูปภาพผู้สมัคร
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto flex-wrap">
          {/* ช่องค้นหา */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="ค้นหาชื่อผู้สมัคร..."
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <Button variant="outline" onClick={() => setIsModalOpen(true)}>
            <FileUp className="w-4 h-4 mr-2" /> นำเข้า Excel
          </Button>

          {/* ปุ่มเพิ่ม (Modal) */}
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

                {/* ☁️ Uploadthing */}
                <div className="border rounded-md p-4 bg-slate-50 flex items-center gap-4 justify-between">
                  <div className="flex items-center gap-3">
                    {formData.imageUrl ? (
                      <Avatar>
                        <AvatarImage src={formData.imageUrl} />
                        <AvatarFallback>NO</AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="w-[50px] h-[50px] rounded-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
                        No Img
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-600">
                      รูปโปรไฟล์
                    </span>
                  </div>
                  <div className="w-[140px]">
                    <UploadButton
                      endpoint="candidateImage"
                      onClientUploadComplete={(res) =>
                        setFormData({ ...formData, imageUrl: res[0].ufsUrl })
                      }
                      appearance={{
                        button: { fontSize: "12px", padding: "4px" },
                      }}
                    />
                  </div>
                </div>

                <Button className="w-full" onClick={handleSave}>
                  บันทึกข้อมูล
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* --- DataTable Component ใช้งานจริง --- */}
      <DataTable
        columns={["หมายเลข", "รูปภาพ", "ชื่อ - นามสกุล", "จัดการ"]}
        data={candidates}
        isLoading={isLoading}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        renderRow={renderRow}
      />

      {/* Modal Import Excel */}
      <ExcelImportModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        electionId={electionId}
        onRefresh={mutate}
        type="candidate"
      />
    </div>
  );
}
