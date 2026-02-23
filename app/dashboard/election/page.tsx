"use client";

import { useEffect, useState } from "react";
import {
  getElectionSettings,
  updateSystemSettings,
  updateElectionConfig,
  getElectionsList, // <-- ฟังก์ชันใหม่
  createElection, // <-- ฟังก์ชันใหม่
} from "@/actions/admin-election.action";

// Components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Settings,
  Power,
  CalendarClock,
  Loader2,
  Save,
  Users,
  AlertCircle,
  Plus,
} from "lucide-react";

export default function ElectionSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // States: System Setting
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [totalMembers, setTotalMembers] = useState(0);

  // States: Election Lists & Selection
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [elections, setElections] = useState<any[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>("");

  // States: Current Election Data
  const [electionId, setElectionId] = useState("");
  const [title, setTitle] = useState("");
  const [maxVotes, setMaxVotes] = useState(7);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // States: Create New Election
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newYear, setNewYear] = useState(new Date().getFullYear() + 1);
  const [newTitle, setNewTitle] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");

  // โหลดรายชื่อปีการเลือกตั้งทั้งหมด
  const fetchElectionsList = async () => {
    const res = await getElectionsList();
    if (res.success && res.data) {
      setElections(res.data);
      // ถ้ายังไม่ได้เลือกปี และมีข้อมูล ให้ตั้งค่าเริ่มต้นเป็นปีล่าสุด (index 0)
      if (!selectedYear && res.data.length > 0) {
        setSelectedYear(res.data[0].year.toString());
      }
    }
  };

  useEffect(() => {
    fetchElectionsList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ดึงข้อมูลการตั้งค่าเมื่อ "ปีที่เลือก" เปลี่ยนแปลง
  useEffect(() => {
    if (!selectedYear) return;

    const fetchSettings = async () => {
      setLoading(true);
      setErrorMsg("");
      const res = await getElectionSettings(parseInt(selectedYear));

      if (res.success && res.election && res.settings) {
        // Map System
        setIsSystemActive(res.settings.isSystemActive);
        setTotalMembers(res.settings.totalMembersCount);

        // Map Election
        setElectionId(res.election.id);
        setTitle(res.election.title);
        setMaxVotes(res.election.maxVotes);
        setStartTime(
          new Date(res.election.startTime).toISOString().slice(0, 16),
        );
        setEndTime(new Date(res.election.endTime).toISOString().slice(0, 16));
      } else {
        setErrorMsg("ไม่พบข้อมูลของปีที่เลือก หรือเกิดข้อผิดพลาด");
      }
      setLoading(false);
    };
    fetchSettings();
  }, [selectedYear]);

  // ฟังก์ชันบันทึกข้อมูลการตั้งค่า
  const handleSave = async () => {
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    const sysRes = await updateSystemSettings(isSystemActive, totalMembers);
    const elecRes = await updateElectionConfig(
      electionId,
      title,
      maxVotes,
      new Date(startTime),
      new Date(endTime),
    );

    if (!sysRes.success || !elecRes.success) {
      setErrorMsg(elecRes.error || sysRes.error || "เกิดข้อผิดพลาด");
    } else {
      setSuccessMsg("บันทึกการตั้งค่าสำเร็จ!");
      setTimeout(() => setSuccessMsg(""), 3000);
    }
    setSaving(false);
  };

  // ฟังก์ชันสร้างการเลือกตั้งใหม่
  const handleCreateNew = async () => {
    setSaving(true);
    setErrorMsg("");

    const res = await createElection({
      year: newYear,
      title: newTitle,
      maxVotes: 7, // ค่าเริ่มต้น
      startTime: new Date(newStartTime),
      endTime: new Date(newEndTime),
    });

    if (res.success) {
      setIsCreateModalOpen(false);
      setSuccessMsg(`สร้างการเลือกตั้งปี ${newYear} สำเร็จ!`);
      setTimeout(() => setSuccessMsg(""), 3000);

      // รีเฟรชรายชื่อและสลับไปยังปีที่เพิ่งสร้าง
      await fetchElectionsList();
      setSelectedYear(newYear.toString());

      // ล้างฟอร์ม
      setNewTitle("");
      setNewStartTime("");
      setNewEndTime("");
    } else {
      setErrorMsg(res.error || "สร้างไม่สำเร็จ");
    }
    setSaving(false);
  };

  if (loading && elections.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            จัดการการเลือกตั้ง
          </h1>
          <p className="text-slate-500 text-sm">
            ตั้งค่าระบบ ควบคุมเวลาเปิด-ปิด และเงื่อนไขการเลือกตั้ง
          </p>
        </div>

        {/* --- Toolbar เลืออกปี & สร้างใหม่ --- */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-lg shadow-sm border">
          <Select
            value={selectedYear}
            onValueChange={setSelectedYear}
            disabled={loading}
          >
            <SelectTrigger className="w-[180px] border-0 shadow-none bg-slate-50">
              <SelectValue placeholder="เลือกปี..." />
            </SelectTrigger>
            <SelectContent>
              {elections.map((elec) => (
                <SelectItem key={elec.id} value={elec.year.toString()}>
                  ปี {elec.year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="w-px h-6 bg-slate-200" />

          {/* Modal สร้างการเลือกตั้งใหม่ */}
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary hover:bg-primary/10"
              >
                <Plus className="w-4 h-4 mr-1" /> สร้างปีใหม่
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>สร้างการเลือกตั้งใหม่</DialogTitle>
                <DialogDescription>
                  เพิ่มปีการเลือกตั้งเข้าสู่ระบบเพื่อเตรียมพร้อมสำหรับการลงคะแนน
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>ปี (ค.ศ.)</Label>
                  <Input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>ชื่อกิจกรรม</Label>
                  <Input
                    placeholder="เช่น การเลือกตั้งประจำปี..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>เปิดระบบ (เวลา)</Label>
                    <Input
                      type="datetime-local"
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ปิดระบบ (เวลา)</Label>
                    <Input
                      type="datetime-local"
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                    />
                  </div>
                </div>
                <Button
                  className="w-full mt-4"
                  onClick={handleCreateNew}
                  disabled={saving || !newTitle || !newStartTime || !newEndTime}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    "สร้างการเลือกตั้ง"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {errorMsg && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{errorMsg}</AlertDescription>
        </Alert>
      )}

      {/* --- ส่วนที่ 1: Master Switch --- */}
      <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
        <div
          className={`h-2 ${isSystemActive ? "bg-green-500" : "bg-red-500"}`}
        />
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Power
              className={`w-5 h-5 mr-2 ${isSystemActive ? "text-green-600" : "text-red-600"}`}
            />
            ควบคุมระบบหลัก (Master Control)
          </CardTitle>
          <CardDescription>
            สวิตช์หลักสำหรับเปิด-ปิดการใช้งานระบบทั้งหมด (มีผลกับทุกปี)
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-slate-50">
            <div>
              <Label className="font-bold text-base">สถานะระบบ</Label>
              <p className="text-sm text-slate-500 mt-1">
                {isSystemActive
                  ? "ระบบกำลังออนไลน์ (ผู้ใช้เข้าสู่ระบบได้)"
                  : "ระบบปิดปรับปรุง (ผู้ใช้ไม่สามารถเข้าได้)"}
              </p>
            </div>
            <Switch
              checked={isSystemActive}
              onCheckedChange={setIsSystemActive}
              className="data-[state=checked]:bg-green-600"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-bold flex items-center">
              <Users className="w-4 h-4 mr-1 text-slate-500" />
              จำนวนสมาชิกทั้งหมด (คน)
            </Label>
            <Input
              type="number"
              value={totalMembers}
              onChange={(e) => setTotalMembers(parseInt(e.target.value) || 0)}
              className="font-medium"
            />
            <p className="text-xs text-slate-400">
              *ใช้สำหรับคำนวณกราฟในหน้า Dashboard
            </p>
          </div>
        </CardContent>
      </Card>

      {/* --- ส่วนที่ 2: Election Config --- */}
      {loading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
        </div>
      ) : elections.length === 0 ? (
        <div className="text-center py-10 bg-slate-50 rounded-lg border text-slate-500 border-dashed">
          ยังไม่มีข้อมูลการเลือกตั้ง กรุณาสร้างใหม่
        </div>
      ) : (
        <Card className="border-slate-200 shadow-sm relative">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Settings className="w-5 h-5 mr-2 text-primary" />
              ตั้งค่าการเลือกตั้ง (ปี {selectedYear})
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label className="font-bold">
                ชื่อกิจกรรม / หัวข้อการเลือกตั้ง
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น การเลือกตั้งคณะกรรมการดำเนินการ..."
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold flex items-center">
                <CalendarClock className="w-4 h-4 mr-1 text-slate-500" />
                วัน-เวลา เปิดรับคะแนน
              </Label>
              <Input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold flex items-center">
                <CalendarClock className="w-4 h-4 mr-1 text-slate-500" />
                วัน-เวลา ปิดหีบ
              </Label>
              <Input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="font-bold">จำนวนที่เลือกได้สูงสุด (คน)</Label>
              <Input
                type="number"
                value={maxVotes}
                onChange={(e) => setMaxVotes(parseInt(e.target.value) || 1)}
                min={1}
                max={15}
              />
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 py-4 px-6 flex justify-end gap-4 border-t">
            {successMsg && (
              <span className="text-green-600 font-bold self-center animate-in fade-in">
                {successMsg}
              </span>
            )}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-primary hover:bg-primary/90 min-w-[120px]"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              บันทึกข้อมูล
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
