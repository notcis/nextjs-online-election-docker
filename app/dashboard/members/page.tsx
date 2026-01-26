"use client";

import { useState } from "react";
import useSWR from "swr";
import { useDebounce } from "use-debounce"; // 💡 npm install use-debounce

import { getMembers, saveMember, deleteMember } from "@/actions/member.action";

import { parseExcelToMembers } from "@/lib/excel"; // ฟังก์ชันแปลง Excel ใหม่สำหรับ Member

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Search,
  Plus,
  Trash2,
  Pencil,
  FileUp,
  ShieldCheck,
} from "lucide-react";
import DataTable from "@/components/DataTable";
import ExcelImportModal from "@/components/ExcelImportModal";

export default function MembersPage() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch] = useDebounce(searchTerm, 500); // หน่วงเวลา 0.5 วิ ก่อนค้นหา

  // 🔄 ดึงข้อมูลอัตโนมัติเมื่อ page หรือ debouncedSearch เปลี่ยนแปลง
  const { data, isLoading, mutate } = useSWR(
    ["members", page, debouncedSearch],
    () => getMembers(page, 20, debouncedSearch),
    { keepPreviousData: true }, // ให้ตารางไม่กระตุกตอนเปลี่ยนหน้า
  );

  const [formOpen, setFormOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<any>({
    memberCode: "",
    nationalId: "",
    age: "",
    region: "",
    isEligible: true,
  });

  const members = data?.members || [];
  const totalPages = data?.totalPages || 1;

  const handleSave = async () => {
    await saveMember(formData);
    setFormOpen(false);
    mutate();
  };

  const handleDelete = async (id: string) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสมาชิกท่านนี้?")) {
      await deleteMember(id);
      mutate();
    }
  };

  // ฟังก์ชันวาดแถวในตาราง
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderRow = (member: any) => (
    <TableRow key={member.id}>
      <TableCell className="font-bold text-primary">
        {member.memberCode}
      </TableCell>
      <TableCell className="text-sm font-mono text-slate-400">
        ********{member.hashedNationalId.slice(-4)}
      </TableCell>
      <TableCell>{member.age} ปี</TableCell>
      <TableCell>{member.region}</TableCell>
      <TableCell>
        <Badge
          variant={member.isEligible ? "default" : "destructive"}
          className="text-xs"
        >
          {member.isEligible ? "มีสิทธิ์" : "ระงับสิทธิ์"}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setFormData({ ...member, nationalId: "" });
            setFormOpen(true);
          }}
        >
          <Pencil className="w-4 h-4 text-blue-600" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleDelete(member.id)}
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </Button>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center">
            <ShieldCheck className="w-6 h-6 mr-2 text-primary" />
            ฐานข้อมูลสมาชิก
          </h1>
          <p className="text-sm text-slate-500">
            จัดการข้อมูลสมาชิก และสิทธิ์ในการเลือกตั้ง
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          {/* ช่องค้นหา */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="ค้นหาเลขทะเบียน หรือ ภาค..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <Button variant="outline" onClick={() => setIsImportModalOpen(true)}>
            <FileUp className="w-4 h-4 mr-2" /> นำเข้า Excel
          </Button>

          <Dialog open={formOpen} onOpenChange={setFormOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() =>
                  setFormData({
                    memberCode: "",
                    nationalId: "",
                    age: "",
                    region: "",
                    isEligible: true,
                  })
                }
              >
                <Plus className="w-4 h-4 mr-2" /> เพิ่มสมาชิก
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {formData.id ? "แก้ไขข้อมูลสมาชิก" : "เพิ่มสมาชิกใหม่"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input
                  placeholder="เลขทะเบียน (6 หลัก)"
                  value={formData.memberCode}
                  onChange={(e) =>
                    setFormData({ ...formData, memberCode: e.target.value })
                  }
                />
                <Input
                  placeholder="เลขบัตร ปชช. 13 หลัก (เว้นว่างถ้าไม่ต้องการเปลี่ยน)"
                  type="password"
                  value={formData.nationalId}
                  onChange={(e) =>
                    setFormData({ ...formData, nationalId: e.target.value })
                  }
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="อายุ"
                    type="number"
                    value={formData.age}
                    onChange={(e) =>
                      setFormData({ ...formData, age: e.target.value })
                    }
                  />
                  <Input
                    placeholder="ภาค (เช่น ภาคกลาง)"
                    value={formData.region}
                    onChange={(e) =>
                      setFormData({ ...formData, region: e.target.value })
                    }
                  />
                </div>
                <div className="flex items-center justify-between border p-4 rounded-lg bg-slate-50">
                  <span className="font-bold">สถานะมีสิทธิ์เลือกตั้ง</span>
                  <Switch
                    checked={formData.isEligible}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isEligible: checked })
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

      {/* ตารางข้อมูล */}
      <DataTable
        columns={[
          "เลขทะเบียน",
          "เลขบัตร ปชช. (เข้ารหัส)",
          "อายุ",
          "ภาค",
          "สิทธิ์เลือกตั้ง",
          "จัดการ",
        ]}
        data={members}
        isLoading={isLoading}
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        renderRow={renderRow}
      />

      {/* เรียกใช้ Modal เดิมที่ปรับฟังก์ชันอ่าน Excel สำหรับ Member แล้ว */}
      <ExcelImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onRefresh={mutate}
        type="member"
      />
    </div>
  );
}
