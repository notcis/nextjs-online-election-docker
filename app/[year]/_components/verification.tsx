"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useVoting } from "@/context/VotingContext";

// Components จาก shadcn/ui
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";
import { verifyMemberStatus } from "@/actions/auth.action";

export default function Verification({ year }: { year: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setMemberId, setElectionInfo } = useVoting();

  // States
  const [lineToken, setLineToken] = useState<string | null>(null);
  const [nationalId, setNationalId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ดึง Token จาก URL เมื่อโหลดหน้า
  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setErrorMsg(
        "ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบผ่าน LINE OA ใหม่อีกครั้ง",
      );
    } else {
      setLineToken(token);
    }

    // สมมติ: ดึงข้อมูลการเลือกตั้งตั้งต้น (เช่น ID และ maxVotes = 7) จาก API
    //setElectionInfo("election-2026-id", 7);
  }, [searchParams, setElectionInfo]);

  // ฟังก์ชันจัดการตอนกด "ยืนยันตัวตน"
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (nationalId.length !== 13) {
      setErrorMsg("กรุณากรอกเลขบัตรประชาชนให้ครบ 13 หลัก");
      return;
    }

    setIsLoading(true);

    try {
      // เรียกใช้ Server Action ของจริง!
      const yearInt = parseInt(year);
      console.log(yearInt);

      const result = await verifyMemberStatus(lineToken!, nationalId, yearInt);

      if (result.success && result.memberId) {
        // อัปเดต Global State
        setMemberId(result.memberId);
        setElectionInfo(result.electionId!, result.maxVotes!);
        // เปลี่ยนหน้าไปยังหน้าเลือกตั้ง (Step 3)
        router.push(`/${year}/vote`);
      } else if (result.isAlreadyVoted) {
        // กรณีโหวตไปแล้ว: พาไปหน้า Step 5 (Success) เลย
        router.push(`/${year}/success`);
      } else {
        // กรณีอื่นๆ (บัตรผิด, ไม่ใช่สมาชิก, หมดเวลา)
        setErrorMsg(result.error || "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
      }
    } catch (error) {
      setErrorMsg("เชื่อมต่อฐานข้อมูลล้มเหลว");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 flex-1 flex flex-col justify-center animate-in fade-in duration-500">
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader className="text-center px-0">
          <div className="mx-auto bg-green-100 p-3 rounded-full mb-2">
            <ShieldCheck className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-xl text-primary">
            ยืนยันตัวตนเพื่อใช้สิทธิ์
          </CardTitle>
          <CardDescription className="text-sm">
            กรุณากรอกเลขบัตรประชาชน 13 หลัก
            <br />
            ที่ลงทะเบียนไว้กับสหกรณ์
          </CardDescription>
        </CardHeader>

        <CardContent className="px-0">
          {errorMsg ? (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>พบข้อผิดพลาด</AlertTitle>
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          ) : null}

          {/* ปิดการใช้งาน Form ถ้าไม่มี Token */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="nationalId"
                className="text-xs font-semibold text-muted-foreground"
              >
                เลขประจำตัวประชาชน 13 หลัก
              </Label>
              <Input
                id="nationalId"
                type="tel" // ใช้ type="tel" เพื่อให้คีย์บอร์ดมือถือขึ้นเป็นตัวเลขใหญ่ๆ
                maxLength={13}
                placeholder="X-XXXX-XXXXX-XX-X"
                value={nationalId}
                onChange={(e) =>
                  setNationalId(e.target.value.replace(/[^0-9]/g, ""))
                } // รับเฉพาะตัวเลข
                disabled={!lineToken || isLoading}
                className="text-center text-lg tracking-widest h-12"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-bold bg-primary hover:bg-primary/90"
              disabled={!lineToken || nationalId.length !== 13 || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  กำลังตรวจสอบข้อมูล...
                </>
              ) : (
                "ยืนยันตัวตน"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
