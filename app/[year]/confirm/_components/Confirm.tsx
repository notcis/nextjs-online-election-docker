"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useVoting } from "@/context/VotingContext";
import { submitVote } from "@/actions/vote.action";

// Components

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import StepIndicator from "../../vote/_components/StepIndicator";

export default function Confirm({ year }: { year: string }) {
  const router = useRouter();
  const { state, clearVotingData } = useVoting();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  

  // Guard: ตรวจสอบว่ามีข้อมูลการเลือกตั้งหรือไม่ (ถ้าไม่มีให้เด้งกลับหน้าโหวต)
  useEffect(() => {
    /* if (!state.memberId) {
      router.push(`/${year}`);
      return;
    } */
    if (state.selectedCandidates.length === 0 && !state.isAbstain) {
      router.push(`/${year}/vote`);
    }
  }, [state, router, year]);

  // ฟังก์ชันกดยืนยัน
  const handleConfirm = async () => {
    setIsLoading(true);
    setErrorMsg("");

    const payload = {
      memberId: state.memberId!,
      electionId: state.electionId!,
      selectedCandidateIds: state.selectedCandidates.map((c) => c.id),
      isAbstain: state.isAbstain,
    };

    const result = await submitVote(payload);

    if (result.success) {
      // สำเร็จ! ไปหน้า Success (เรายังไม่ Clear Context ตรงนี้ เผื่อหน้า Success จะดึงไปแสดงผล)
      router.push(`/${year}/success`);
    } else {
      setIsLoading(false);
      setErrorMsg(result.error || "บันทึกข้อมูลไม่สำเร็จ");
    }
  };

  return (
    <div className="max-w-7xl mx-auto flex-1 flex flex-col">
      {/* แถบสถานะ (Step 3: ตรวจสอบ) */}
      <StepIndicator currentStep={3} />

      <div className="flex-1 px-4 py-6 bg-gray-50 pb-24">
        <h2 className="text-xl font-bold text-center text-gray-800 mb-6 flex items-center justify-center gap-2">
          <CheckCircle2 className="text-green-500 w-6 h-6" />
          กรุณาตรวจสอบความถูกต้อง
        </h2>

        {errorMsg && (
          <Alert
            variant="destructive"
            className="mb-4 bg-red-50 border-red-200 text-red-700"
          >
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="font-medium">
              {errorMsg}
            </AlertDescription>
          </Alert>
        )}

        <Card className="border-0 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            {state.isAbstain ? (
              // กรณี: ไม่ประสงค์ลงคะแนน
              <div className="p-8 text-center bg-red-50">
                <span className="text-xl font-bold text-red-600">
                  ไม่ประสงค์ลงคะแนน
                </span>
                <p className="text-sm text-red-400 mt-2">
                  (สละสิทธิ์การเลือกผู้สมัครทั้งหมด)
                </p>
              </div>
            ) : (
              // กรณี: เลือกผู้สมัคร
              <div className="divide-y divide-gray-100">
                <div className="bg-primary/5 px-4 py-3 font-semibold text-primary text-sm flex justify-between">
                  <span>ผู้สมัครที่ท่านเลือก</span>
                  <span>{state.selectedCandidates.length} ท่าน</span>
                </div>
                {state.selectedCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="flex items-center gap-4 p-4 bg-white"
                  >
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white font-black text-lg">
                      {candidate.candidateNumber}
                    </div>
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-gray-100">
                      <Image
                        src={candidate.imageUrl || "/images/default-avatar.png"}
                        alt={candidate.firstName}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {candidate.firstName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {candidate.lastName}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          *เมื่อกดยืนยันแล้ว จะไม่สามารถแก้ไขข้อมูลได้*
        </p>
      </div>

      {/* Sticky Bottom Bar: ปุ่มย้อนกลับ & ยืนยัน */}
      <div className="sticky bottom-0 bg-white p-4 border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50 flex gap-3">
        {/* ปุ่มย้อนกลับ */}
        <Button
          variant="outline"
          className="flex-1 h-12 font-bold text-gray-600"
          onClick={() => router.back()}
          disabled={isLoading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          กลับไปแก้ไข
        </Button>

        {/* ปุ่มยืนยัน */}
        <Button
          className="flex-1 h-12 font-bold bg-green-600 hover:bg-green-700 text-white shadow-md"
          onClick={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              กำลังบันทึก...
            </>
          ) : (
            <>
              ยืนยันการลงคะแนน
              <CheckCircle2 className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
