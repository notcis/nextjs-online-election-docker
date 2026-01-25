"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useVoting } from "@/context/VotingContext";

// Components

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ExternalLink, BarChart3, X, Receipt } from "lucide-react";
import StepIndicator from "../../vote/_components/StepIndicator";
import { clearVoterSession } from "@/actions/auth.action";

export default function Success({ year }: { year: string }) {
  const router = useRouter();
  const { state, clearVotingData } = useVoting();
  const [timestamp] = useState(() => {
    const now = new Date();
    return (
      now.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }) + " น."
    );
  });

  useEffect(() => {
    // ลบ Cookie ทันทีที่โหลดหน้าสำเร็จ
    clearVoterSession();
  }, []);

  /*   useEffect(() => {
    if (!state.memberId) {
      router.push(`/${year}`);
      return;
    }
  }, [state, router, year]); */

  /*   useEffect(() => {
    // เคลียร์ Context ทิ้ง (หน่วงเวลาเล็กน้อยเพื่อให้ UI Render เสร็จก่อน)
    // การเคลียร์นี้ช่วยป้องกันไม่ให้กดย้อนกลับแล้วไป Submit ซ้ำ
    const timer = setTimeout(() => {
      clearVotingData();
    }, 500);

    return () => clearTimeout(timer);
  }, [clearVotingData]); */

  // ฟังก์ชันปิดหน้าต่าง LINE LIFF
  const handleClose = async () => {
    // Fallback
    window.location.href = "https://line.me/R/";
  };

  return (
    <div className="max-w-7xl mx-auto flex-1 flex flex-col  bg-gray-50 h-full min-h-screen">
      {/* แถบสถานะ (Step 4: เสร็จสิ้น) */}
      <StepIndicator currentStep={4} />

      <div className="flex-1 px-4 py-8 flex flex-col items-center">
        {/* Success Icon & Message */}
        <div className="flex flex-col items-center animate-in zoom-in duration-500 mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 bg-green-50 rounded-full" />
          <h1 className="text-2xl font-black text-gray-900 mt-4">
            ลงคะแนนสำเร็จ!
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            ขอบคุณที่ร่วมใช้สิทธิ์ของท่านในครั้งนี้
          </p>
        </div>

        {/* e-Receipt Card */}
        <Card className="w-full border-0 shadow-md bg-white overflow-hidden mb-6">
          <div className="bg-primary px-4 py-3 flex items-center justify-between text-white">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Receipt className="w-4 h-4" />
              <span>หลักฐานการลงคะแนน (e-Receipt)</span>
            </div>
          </div>
          <CardContent className="p-0 text-sm">
            <div className="p-4 border-b border-dashed">
              <div className="flex justify-between mb-2">
                <span className="text-gray-500">วันที่-เวลา:</span>
                <span className="font-semibold text-gray-800">{timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">ปีการเลือกตั้ง:</span>
                <span className="font-semibold text-gray-800">{year}</span>
              </div>
            </div>

            {/* สรุปรายการที่เลือก */}
            {/*  <div className="p-4 bg-gray-50">
              <p className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">
                รายการที่ท่านเลือก
              </p>

              {state.isAbstain ? (
                <div className="flex items-center gap-3 bg-white p-3 rounded-lg border">
                  <div className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-full text-red-600 font-bold">
                    <X className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-red-600">
                    ไม่ประสงค์ลงคะแนน
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  {state.selectedCandidates.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-3 bg-white p-2 rounded-lg border"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden relative border">
                        <Image
                          src={c.imageUrl}
                          alt={c.firstName}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <span className="font-bold text-primary w-6 text-center">
                        {c.candidateNumber}
                      </span>
                      <span className="font-medium text-gray-800">
                        {c.firstName} {c.lastName}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div> */}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="w-full space-y-3 mt-auto">
          {/* 1. ปุ่มดูผลคะแนน (Link ไปหน้า /results) */}
          <Link href={`/${year}/results`} className="w-full block">
            <Button
              variant="outline"
              className="w-full h-12 font-bold text-primary border-primary/30"
            >
              <BarChart3 className="w-5 h-5 mr-2" />
              สรุปผลการลงคะแนน
            </Button>
          </Link>
          <p className="text-center text-xs text-gray-400 -mt-1 mb-2">
            *สามารถติดตามผลได้หลังจากปิดการลงคะแนนในเวลา 13.00 น.
          </p>

          {/* 2. ปุ่มทำแบบสอบถาม (Link ออกไปภายนอก) */}
          <Link
            href="https://forms.gle/YOUR_FORM_LINK"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full block"
          >
            <Button
              variant="secondary"
              className="w-full h-12 font-bold bg-amber-100 text-amber-700 hover:bg-amber-200"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              ร่วมทำแบบสอบถาม
            </Button>
          </Link>

          {/* 3. ปุ่มปิดหน้าต่าง */}
          <Button
            onClick={handleClose}
            className="w-full h-12 font-bold bg-gray-800 text-white hover:bg-black"
          >
            <X className="w-5 h-5 mr-2" />
            ปิดหน้านี้
          </Button>
        </div>
      </div>
    </div>
  );
}
