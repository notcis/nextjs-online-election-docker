"use client";

import { useState } from "react";
import useSWR from "swr";
import Image from "next/image";
import {
  getTallyOptions,
  getTalliesByElection,
  saveVoteTally,
  initializeTallies,
  deleteVoteTally,
} from "@/actions/vote-tally.action";

// Components
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Trash2,
  Pencil,
  Zap,
  RefreshCcw,
  Loader2,
  Database,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function VoteTallyPage() {
  // State หลัก
  const [selectedElectionId, setSelectedElectionId] = useState<string>("");

  // 1. Options สำหรับ Dropdown
  const { data: optionsData } = useSWR("tally-options", getTallyOptions, {
    onSuccess: (data) => {
      if (data?.elections && data.elections.length > 0) {
        setSelectedElectionId((prev) => prev || data.elections[0].id);
      }
    },
  });

  // 2. ดึงข้อมูลคะแนนของปีที่เลือก
  const {
    data: talliesData,
    isLoading,
    mutate,
  } = useSWR(selectedElectionId ? ["tallies", selectedElectionId] : null, () =>
    getTalliesByElection(selectedElectionId),
  );

  // States สำหรับ Modal
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [formData, setFormData] = useState<any>({
    id: null,
    candidateId: "",
    totalVotes: 0,
  });

  const elections = optionsData?.elections || [];
  const candidates = optionsData?.candidates || [];
  const tallies = talliesData?.tallies || [];

  // --- Functions ---
  const handleBulkInit = async () => {
    if (
      confirm(
        "การกดปุ่มนี้จะ 'ล้างคะแนนเดิมทั้งหมด' และตั้งค่าผู้สมัครทุกคนให้เริ่มนับ 0 ใหม่ \nคุณแน่ใจหรือไม่?",
      )
    ) {
      await initializeTallies(selectedElectionId);
      mutate();
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await saveVoteTally(
      formData.id,
      selectedElectionId,
      formData.candidateId,
      formData.totalVotes,
    );
    setSaving(false);
    setFormOpen(false);
    mutate();
  };

  const handleDelete = async (id: string) => {
    if (confirm("ต้องการถอดผู้สมัครคนนี้ออกจากการนับคะแนนหรือไม่?")) {
      await deleteVoteTally(id);
      mutate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center">
            <Database className="w-6 h-6 mr-2 text-primary" />
            เชื่อมโยงข้อมูลและนับคะแนน (Vote Tally)
          </h1>
          <p className="text-sm text-slate-500">
            จับคู่ผู้สมัครกับการเลือกตั้ง และจัดการคะแนนดิบ
          </p>
        </div>

        {/* ตัวกรองปีการเลือกตั้ง */}
        <div className="flex gap-3 items-center">
          <span className="text-sm font-bold text-slate-600">
            เลือกปีการเลือกตั้ง:
          </span>
          <Select
            value={selectedElectionId}
            onValueChange={setSelectedElectionId}
          >
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="เลือกปี..." />
            </SelectTrigger>
            <SelectContent>
              {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                elections.map((elec: any) => (
                  <SelectItem key={elec.id} value={elec.id}>
                    {elec.title}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex flex-wrap gap-3">
        {/* ปุ่มสร้างทุกคนอัตโนมัติ (Magic Button) */}
        <Button
          onClick={handleBulkInit}
          className="bg-amber-500 hover:bg-amber-600"
        >
          <Zap className="w-4 h-4 mr-2" />
          เตรียมระบบ (รีเซ็ตคะแนนทุกคนเป็น 0)
        </Button>

        {/* ปุ่มเพิ่มทีละคน */}
        <Button
          variant="outline"
          onClick={() => {
            setFormData({ id: null, candidateId: "", totalVotes: 0 });
            setFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> เพิ่มผู้สมัครแบบ Manual
        </Button>

        <Button variant="ghost" onClick={() => mutate()} disabled={isLoading}>
          <RefreshCcw
            className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />{" "}
          รีเฟรช
        </Button>
      </div>

      {/* ตารางแสดงผล */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[80px] text-center">หมายเลข</TableHead>
              <TableHead>ผู้สมัคร</TableHead>
              <TableHead className="text-right">คะแนน (Votes)</TableHead>
              <TableHead className="text-right">จัดการ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  กำลังโหลด...
                </TableCell>
              </TableRow>
            ) : tallies.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-10 text-slate-500"
                >
                  ยังไม่มีผู้สมัครที่ผูกกับปีนี้ (กดปุ่ม เตรียมระบบ ด้านบน)
                </TableCell>
              </TableRow>
            ) : (
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              tallies.map((tally: any) => (
                <TableRow key={tally.id}>
                  <TableCell className="text-center font-bold text-lg">
                    {tally.candidate.candidateNumber || "-"}
                  </TableCell>
                  <TableCell className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={tally.candidate.imageUrl} />
                      <AvatarFallback>NO</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">
                      {tally.candidate.isAbstain
                        ? "ไม่ประสงค์ลงคะแนน"
                        : `${tally.candidate.firstName} ${tally.candidate.lastName}`}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant={tally.totalVotes === 0 ? "secondary" : "default"}
                      className="text-base px-3 py-1"
                    >
                      {tally.totalVotes.toLocaleString()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setFormData({
                          id: tally.id,
                          candidateId: tally.candidateId,
                          totalVotes: tally.totalVotes,
                        });
                        setFormOpen(true);
                      }}
                    >
                      <Pencil className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(tally.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal: เพิ่ม/แก้ไข คะแนน */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formData.id ? "แก้ไขคะแนน (Manual)" : "เชื่อมโยงผู้สมัคร"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>เลือกผู้สมัคร</Label>
              <Select
                value={formData.candidateId}
                onValueChange={(val) =>
                  setFormData({ ...formData, candidateId: val })
                }
                disabled={!!formData.id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ค้นหาผู้สมัคร..." />
                </SelectTrigger>
                <SelectContent>
                  {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    candidates.map((c: any) => (
                      <SelectItem key={c.id} value={c.id}>
                        เบอร์ {c.candidateNumber} -{" "}
                        {c.isAbstain
                          ? "ไม่ประสงค์ลงคะแนน"
                          : `${c.firstName} ${c.lastName}`}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>ตั้งค่าคะแนน</Label>
              <Input
                type="number"
                value={formData.totalVotes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    totalVotes: parseInt(e.target.value) || 0,
                  })
                }
              />
              <p className="text-xs text-slate-400">
                ใช้สำหรับรีเซ็ต หรือแก้ไขคะแนนในกรณีฉุกเฉิน
              </p>
            </div>
            <Button
              className="w-full"
              onClick={handleSave}
              disabled={saving || !formData.candidateId}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                "บันทึกข้อมูล"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
