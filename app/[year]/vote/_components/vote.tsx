"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useVoting, SelectedCandidate } from "@/context/VotingContext";
import { getElectionCandidates } from "@/actions/election.action";

// Components

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, ChevronRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import CandidateCard from "./CandidateCard";
import CountdownTimer from "./CountdownTimer";
import StepIndicator from "./StepIndicator";

export default function Vote({ year }: { year: string }) {
  const router = useRouter();
  const { state, setElectionInfo, toggleCandidate, toggleAbstain } =
    useVoting();

  // Local States
  const [candidates, setCandidates] = useState<SelectedCandidate[]>([]);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // ดึงข้อมูลผู้สมัครจาก Server Action เมื่อโหลดหน้า
  useEffect(() => {
    // ป้องกันการเข้าหน้านี้โดยไม่ได้ Login (ไม่มี memberId)
    if (!state.memberId) {
      router.push(`/${year}`);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      const yearInt = parseInt(year);
      const result = await getElectionCandidates(yearInt);

      if (result.success && result.candidates && result.electionInfo) {
        setCandidates(result.candidates as SelectedCandidate[]);
        setEndTime(result.electionInfo.endTime);
        // อัปเดตข้อมูล maxVotes เข้าสู่ Context
        setElectionInfo(result.electionInfo.id, result.electionInfo.maxVotes);
      } else {
        setErrorMsg(result.error || "ไม่สามารถดึงข้อมูลผู้สมัครได้");
      }
      setIsLoading(false);
    };

    fetchData();
  }, [year, router, state.memberId, setElectionInfo]);

  // แยกกลุ่มคนปกติ กับ ตัวเลือก "ไม่ประสงค์ลงคะแนน" เพื่อความชัวร์ในการ Render UI
  const { normalCandidates, abstainOption } = useMemo(() => {
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      normalCandidates: candidates.filter((c) => !(c as any).isAbstain),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      abstainOption: candidates.find((c) => (c as any).isAbstain),
    };
  }, [candidates]);

  // เช็คว่าปุ่ม "ถัดไป" ควรกดได้ไหม? (ต้องเลือกอย่างน้อย 1 คน หรือเลือกไม่ประสงค์ลงคะแนน)
  const canProceed = state.selectedCandidates.length > 0 || state.isAbstain;

  // Render: Loading State (โครงกระดูก)
  if (isLoading) {
    return (
      <div className="flex flex-col h-full space-y-4 pt-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[80px] w-full" />
        <Skeleton className="h-[80px] w-full" />
        <Skeleton className="h-[80px] w-full" />
      </div>
    );
  }

  // Render: Error State
  if (errorMsg) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>พบข้อผิดพลาด</AlertTitle>
        <AlertDescription>{errorMsg}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex-1 flex flex-col">
      {/* 1. แถบบอกสถานะขั้นตอน (Step 2: เลือกผู้สมัคร) */}
      <StepIndicator currentStep={2} />

      {/* 2. ตัวนับเวลาถอยหลัง */}
      {endTime && <CountdownTimer endTime={endTime} />}

      {/* 3. Sticky Header: สรุปจำนวนที่เลือก (Progress) */}
      <div className="sticky top-[72px] z-40 bg-white px-4 py-3 border-b shadow-sm flex items-center justify-between">
        <span className="font-semibold text-sm">ผู้สมัครที่เลือกไว้:</span>
        <div className="flex items-center gap-2">
          <span
            className={`text-lg font-black ${state.selectedCandidates.length === state.maxVotes ? "text-green-600" : "text-primary"}`}
          >
            {state.isAbstain ? 0 : state.selectedCandidates.length}
          </span>
          <span className="text-gray-400 font-medium">
            / {state.maxVotes} คน
          </span>
        </div>
      </div>

      {/* 4. รายชื่อผู้สมัคร (Scrollable List) */}
      <div className="flex-1 px-4 py-4 space-y-3 bg-gray-50 pb-24">
        {normalCandidates.map((candidate) => {
          const isSelected = state.selectedCandidates.some(
            (c) => c.id === candidate.id,
          );
          // ปิดการเลือกถ้า 1) กดไม่ประสงค์ลงคะแนนไปแล้ว หรือ 2) เลือกครบแล้วแต่คนนี้ยังไม่ได้ถูกเลือก
          const isDisabled =
            state.isAbstain ||
            (state.selectedCandidates.length >= state.maxVotes && !isSelected);

          return (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              isSelected={isSelected}
              onToggle={toggleCandidate}
              disabled={isDisabled}
            />
          );
        })}

        {/* เส้นคั่นก่อนตัวเลือก "ไม่ประสงค์ลงคะแนน" */}
        <div className="my-6 border-b-2 border-dashed border-gray-300 relative">
          <span className="absolute left-1/2 -top-3 -translate-x-1/2 bg-gray-50 px-2 text-xs text-gray-400 font-medium">
            หรือ
          </span>
        </div>

        {/* ตัวเลือก "ไม่ประสงค์ลงคะแนน" (อยู่ล่างสุดเสมอ) */}
        {abstainOption && (
          <CandidateCard
            candidate={abstainOption}
            isSelected={state.isAbstain}
            onToggle={() => toggleAbstain(!state.isAbstain)}
          />
        )}
      </div>

      {/* 5. Sticky Bottom Bar: ปุ่มถัดไป */}
      <div className="sticky bottom-0 bg-white p-4 border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
        <Button
          className="w-full h-12 text-base font-bold shadow-md"
          size="lg"
          disabled={!canProceed}
          onClick={() => router.push(`/${year}/confirm`)}
        >
          ถัดไป - ตรวจสอบข้อมูล
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}
