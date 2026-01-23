"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { SelectedCandidate } from "@/context/VotingContext";

interface CandidateCardProps {
  candidate: SelectedCandidate & { isAbstain?: boolean };
  isSelected: boolean;
  onToggle: (candidate: SelectedCandidate) => void;
  disabled?: boolean;
}

export default function CandidateCard({
  candidate,
  isSelected,
  onToggle,
  disabled,
}: CandidateCardProps) {
  // กรณี: ไม่ประสงค์ลงคะแนน
  if (candidate.isAbstain) {
    return (
      <Card
        onClick={() => !disabled && onToggle(candidate)}
        className={cn(
          "flex items-center justify-between p-4 cursor-pointer transition-all border-2",
          isSelected
            ? "border-red-500 bg-red-50"
            : "border-gray-200 bg-gray-50 hover:bg-red-50/50",
          disabled && !isSelected ? "opacity-50 cursor-not-allowed" : "",
        )}
      >
        <span
          className={cn(
            "font-bold text-lg",
            isSelected ? "text-red-600" : "text-gray-600",
          )}
        >
          {candidate.firstName}
        </span>
        <Checkbox
          checked={isSelected}
          className={cn(
            "h-6 w-6 rounded-full border-2",
            isSelected
              ? "data-[state=checked]:bg-red-600 data-[state=checked]:border-red-600"
              : "",
          )}
        />
      </Card>
    );
  }

  // กรณี: ผู้สมัครปกติ
  return (
    <Card
      onClick={() => !disabled && onToggle(candidate)}
      className={cn(
        "flex items-center gap-4 p-3 cursor-pointer transition-all border-2",
        isSelected
          ? "border-primary bg-primary/5 shadow-md"
          : "border-gray-100 hover:border-primary/50",
        disabled && !isSelected ? "opacity-50 cursor-not-allowed" : "",
      )}
    >
      {/* หมายเลขผู้สมัคร */}
      <div
        className={cn(
          "flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full text-xl font-black",
          isSelected ? "bg-primary text-white" : "bg-gray-100 text-gray-500",
        )}
      >
        {candidate.candidateNumber}
      </div>

      {/* รูปภาพผู้สมัคร */}
      <div className="relative w-14 h-14 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
        <Image
          src={candidate.imageUrl || "/images/default-avatar.png"}
          alt={`${candidate.firstName} ${candidate.lastName}`}
          fill
          className="object-cover"
          unoptimized
        />
      </div>

      {/* ชื่อ-นามสกุล */}
      <div className="flex-1">
        <h3
          className={cn(
            "font-bold leading-tight",
            isSelected ? "text-primary" : "text-gray-900",
          )}
        >
          {candidate.firstName}
        </h3>
        <p className="text-sm text-gray-500">{candidate.lastName}</p>
      </div>

      {/* Checkbox (ปรับขนาดให้ใหญ่ขึ้นสำหรับมือถือ) */}
      <div className="flex-shrink-0 pr-2">
        <Checkbox
          checked={isSelected}
          className="h-6 w-6 rounded-full border-2 border-gray-300 data-[state=checked]:border-primary"
        />
      </div>
    </Card>
  );
}
