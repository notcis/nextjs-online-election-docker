"use client";

import { Check, UserCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVoting } from "@/context/VotingContext"; // นำเข้า context

interface StepIndicatorProps {
  currentStep: number; // 1: Verify, 2: Vote, 3: Confirm, 4: Success
}

const STEPS = [
  { id: 1, label: "ยืนยันตัวตน" },
  { id: 2, label: "เลือกผู้สมัคร" },
  { id: 3, label: "ตรวจสอบ" },
  { id: 4, label: "เสร็จสิ้น" },
];

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  // ดึงค่า state จาก context
  const { state } = useVoting();

  return (
    <div className="w-full bg-white border-b shadow-sm z-40 sticky">
      {/* 🌟 เพิ่มแบนเนอร์แสดงเลขสมาชิก (แสดงเมื่อมี memberId และเลย Step 1 มาแล้ว) */}
      {state.memberId && currentStep > 1 && (
        <div className="bg-primary/5 px-4 py-2 flex items-center justify-between border-b border-primary/10">
          <div className="flex items-center text-primary font-medium text-xs sm:text-sm">
            <UserCircle2 className="w-4 h-4 mr-1.5" />
            ลงคะแนนในนาม:
          </div>
          <div className="font-bold text-primary tracking-wide text-sm">
            เลขทะเบียน {state.memberCode}
          </div>
        </div>
      )}

      {/* แถบสเต็ปเดิม (ปรับ padding เล็กน้อย) */}
      <div className="px-4 pt-4 pb-6">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;

            return (
              <div
                key={step.id}
                className="flex items-center flex-1 last:flex-none"
              >
                <div className="relative flex flex-col items-center flex-1">
                  {/* วงกลมสเต็ป */}
                  <div
                    className={cn(
                      "w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold z-10 transition-colors",
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isActive
                          ? "bg-primary text-white ring-4 ring-primary/20"
                          : "bg-gray-100 text-gray-400",
                    )}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  {/* ข้อความ Label ใต้วงกลม */}
                  <span
                    className={cn(
                      "absolute top-8 text-[10px] sm:text-xs text-center w-max",
                      isActive
                        ? "text-primary font-bold"
                        : "text-gray-400 font-medium",
                    )}
                  >
                    {step.label}
                  </span>
                </div>

                {/* เส้นเชื่อม (ยกเว้นอันสุดท้าย) */}
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-1 mx-2 -mt-4 transition-colors",
                      step.id < currentStep ? "bg-green-500" : "bg-gray-100",
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
