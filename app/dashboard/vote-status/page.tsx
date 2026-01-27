"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { useDebounce } from "use-debounce";
import {
  getVoteStatuses,
  deleteVoteStatus,
  getElectionOptions,
} from "@/actions/vote-status.action";
import DataTable from "@/components/DataTable";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  RotateCcw,
  AlertTriangle,
  Fingerprint,
  History,
} from "lucide-react";

export default function VoteStatusPage() {
  // States
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedElectionId, setSelectedElectionId] = useState<string>();
  const [debouncedSearch] = useDebounce(searchTerm, 500);

  // Data Fetching
  const { data: electionOptions } = useSWR(
    "election-options",
    getElectionOptions,
  );

  const activeElectionId = selectedElectionId ?? electionOptions?.[0]?.id;

  const { data, isLoading, mutate } = useSWR(
    activeElectionId
      ? ["vote-statuses", page, debouncedSearch, activeElectionId]
      : null,
    () => getVoteStatuses(page, 20, debouncedSearch, activeElectionId!),
  );

  // Actions
  const handleResetVote = async (id: string, memberCode: string) => {
    const confirmMsg = `⚠️ คำเตือน: การลบสถานะจะทำให้สมาชิก "${memberCode}" สามารถกลับมาโหวตซ้ำได้อีกครั้ง\n\nแต่คะแนนเดิมจะยังคงถูกนับรวมอยู่ (เนื่องจากระบบไม่ทราบว่าเขาโหวตใคร)\n\nคุณแน่ใจหรือไม่ที่จะดำเนินการ?`;

    if (confirm(confirmMsg)) {
      const res = await deleteVoteStatus(id);
      if (res.success) {
        mutate(); // Refresh Table
      } else {
        alert(res.error);
      }
    }
  };

  // Render Table Row
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderRow = (item: any) => (
    <TableRow key={item.id}>
      <TableCell className="font-mono text-sm">
        {new Date(item.votedAt).toLocaleString("th-TH", {
          dateStyle: "medium",
          timeStyle: "medium",
        })}
      </TableCell>
      <TableCell className="font-bold text-primary">
        {item.member.memberCode}
      </TableCell>
      <TableCell>{item.member.region}</TableCell>
      <TableCell className="font-mono text-xs text-slate-500">
        {item.ipAddress}
      </TableCell>
      <TableCell
        className="max-w-[200px] truncate text-xs text-slate-400"
        title={item.userAgent}
      >
        {item.userAgent}
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="sm"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => handleResetVote(item.id, item.member.memberCode)}
          title="รีเซ็ตสิทธิ์ (ให้โหวตใหม่)"
        >
          <RotateCcw className="w-4 h-4 mr-1" /> ล้างสิทธิ์
        </Button>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center">
            <History className="w-6 h-6 mr-2 text-primary" />
            ประวัติการใช้สิทธิ์ (Vote Logs)
          </h1>
          <p className="text-sm text-slate-500">
            ตรวจสอบรายการผู้มาใช้สิทธิ์ IP Address และจัดการสถานะ
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto flex-wrap">
          {/* เลือกปีการเลือกตั้ง */}
          <Select
            value={activeElectionId ?? ""}
            onValueChange={setSelectedElectionId}
          >
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="ปีการเลือกตั้ง..." />
            </SelectTrigger>
            <SelectContent>
              {// eslint-disable-next-line @typescript-eslint/no-explicit-any
              electionOptions?.map((elec: any) => (
                <SelectItem key={elec.id} value={elec.id}>
                  {elec.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* ค้นหา */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="ค้นหาเลขทะเบียน..."
              className="pl-9 bg-white"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      {/* คำเตือน */}
      <Alert
        variant="destructive"
        className="bg-amber-50 border-amber-200 text-amber-800"
      >
        <AlertTriangle className="w-4 h-4 text-amber-600" />
        <AlertDescription className="text-xs font-medium ml-2">
          การกด ล้างสิทธิ์ ควรกระทำเมื่อจำเป็นเท่านั้น (เช่น ระบบ Error
          สมาชิกโหวตไม่สำเร็จแต่ขึ้นว่าโหวตแล้ว) การล้างสิทธิ์จะทำให้
          **ยอดผู้มาใช้สิทธิ์ (Voter Turnout)** และ **คะแนนรวม (Total Votes)**
          ไม่ตรงกันเล็กน้อย
        </AlertDescription>
      </Alert>

      {/* สรุปจำนวน */}
      <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
        <Fingerprint className="w-4 h-4" />
        พบรายการทั้งหมด: {data?.totalRecords || 0} รายการ
      </div>

      {/* ตารางข้อมูล */}
      <DataTable
        columns={[
          "เวลาที่ลงคะแนน",
          "เลขทะเบียน",
          "ภาค",
          "IP Address",
          "Device / Browser",
          "จัดการ",
        ]}
        data={data?.data || []}
        isLoading={isLoading}
        currentPage={page}
        totalPages={data?.totalPages || 1}
        onPageChange={setPage}
        renderRow={renderRow}
      />
    </div>
  );
}
