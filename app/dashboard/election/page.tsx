"use client";

import { useEffect, useState } from "react";
import {
  getElectionSettings,
  updateSystemSettings,
  updateElectionConfig,
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
  Settings,
  Power,
  CalendarClock,
  Loader2,
  Save,
  Users,
  AlertCircle,
} from "lucide-react";

export default function ElectionSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // States: System Setting
  const [isSystemActive, setIsSystemActive] = useState(false);
  const [totalMembers, setTotalMembers] = useState(0);

  // States: Election Data
  const [electionId, setElectionId] = useState("");
  const [electionYear, setElectionYear] = useState(2026);
  const [title, setTitle] = useState("");
  const [maxVotes, setMaxVotes] = useState(7);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // ดึงข้อมูลเมื่อโหลดหน้า
  useEffect(() => {
    const fetchSettings = async () => {
      const res = await getElectionSettings(2026); // Fix ปีไว้ก่อน หรือดึงจาก Env
      if (res.success && res.election && res.settings) {
        // Map System
        setIsSystemActive(res.settings.isSystemActive);
        setTotalMembers(res.settings.totalMembersCount);

        // Map Election
        setElectionId(res.election.id);
        setElectionYear(res.election.year);
        setTitle(res.election.title);
        setMaxVotes(res.election.maxVotes);

        // แปลง Date เป็น String สำหรับ Input type="datetime-local"
        setStartTime(
          new Date(res.election.startTime).toISOString().slice(0, 16),
        );
        setEndTime(new Date(res.election.endTime).toISOString().slice(0, 16));
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  // ฟังก์ชันบันทึกข้อมูล
  const handleSave = async () => {
    setSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    // 1. บันทึก System Settings
    const sysRes = await updateSystemSettings(isSystemActive, totalMembers);

    // 2. บันทึก Election Settings
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
      // ซ่อนข้อความสำเร็จหลัง 3 วินาที
      setTimeout(() => setSuccessMsg(""), 3000);
    }
    setSaving(false);
  };

  if (loading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-800">
          จัดการการเลือกตั้ง
        </h1>
        <p className="text-slate-500 text-sm">
          ตั้งค่าระบบ ควบคุมเวลาเปิด-ปิด และเงื่อนไขการเลือกตั้ง
        </p>
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
            สวิตช์หลักสำหรับเปิด-ปิดการใช้งานระบบทั้งหมด
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
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Settings className="w-5 h-5 mr-2 text-primary" />
            ตั้งค่าการเลือกตั้ง (ปี {electionYear})
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
    </div>
  );
}
