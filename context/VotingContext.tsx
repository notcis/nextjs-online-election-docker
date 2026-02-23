"use partial";
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

// 1. กำหนด Type สำหรับข้อมูลผู้สมัครที่ถูกเลือก
export type SelectedCandidate = {
  id: string;
  candidateNumber: number;
  firstName: string;
  lastName: string;
  imageUrl: string;
};

// 2. กำหนด Type สำหรับ State ทั้งหมดใน Context
interface VotingState {
  memberId: string | null; // เลขทะเบียน 6 หลัก (หลังจากยืนยันตัวตนแล้ว)
  electionId: string | null; // ID ของการเลือกตั้งปีปัจจุบัน
  maxVotes: number; // จำนวนที่เลือกได้สูงสุดของปีนี้
  selectedCandidates: SelectedCandidate[]; // รายชื่อผู้สมัครที่เลือก
  isAbstain: boolean; // สถานะ "ไม่ประสงค์ลงคะแนน"
}

// 3. กำหนด Type สำหรับฟังก์ชันการทำงานต่างๆ
interface VotingContextType {
  state: VotingState;
  setElectionInfo: (electionId: string, maxVotes: number) => void;
  setMemberId: (memberId: string) => void;
  toggleCandidate: (candidate: SelectedCandidate) => void;
  toggleAbstain: (checked: boolean) => void;
  clearVotingData: () => void;
}

// Helper function สำหรับดึงค่าจาก Cookie (ใช้ได้เฉพาะฝั่ง Client)
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const defaultState: VotingState = {
  memberId: getCookie("voter_session"),
  electionId: null,
  maxVotes: 0,
  selectedCandidates: [],
  isAbstain: false,
};

// 4. สร้าง Context
const VotingContext = createContext<VotingContextType | undefined>(undefined);

// 5. Provider Component สำหรับครอบ App
export function VotingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<VotingState>(defaultState);

  // ฟังก์ชันเซ็ตข้อมูลการเลือกตั้งตั้งต้น (เรียกตอนหน้า Landing โหลดเสร็จ)
  const setElectionInfo = useCallback(
    (electionId: string, maxVotes: number) => {
      setState((prev) => ({ ...prev, electionId, maxVotes }));
    },
    [],
  );

  const setMemberId = useCallback((memberId: string) => {
    setState((prev) => ({ ...prev, memberId }));
  }, []);

  // ฟังก์ชันหลัก: เลือก/ยกเลิก ผู้สมัคร
  const toggleCandidate = useCallback((candidate: SelectedCandidate) => {
    setState((prev) => {
      const isAlreadySelected = prev.selectedCandidates.some(
        (c) => c.id === candidate.id,
      );

      if (isAlreadySelected) {
        // กรณี: กดซ้ำเพื่อ "เอาออก"
        return {
          ...prev,
          selectedCandidates: prev.selectedCandidates.filter(
            (c) => c.id !== candidate.id,
          ),
        };
      } else {
        // กรณี: กดเพื่อ "เพิ่ม"
        // เช็คก่อนว่าเลือกครบ maxVotes หรือยัง?
        if (prev.selectedCandidates.length >= prev.maxVotes) {
          // แจ้งเตือน: เลือกเกินจำนวนที่กำหนด (เราจะไป Handle Toast ในหน้า UI)
          return prev;
        }

        return {
          ...prev,
          selectedCandidates: [...prev.selectedCandidates, candidate],
          isAbstain: false, // ยกเลิกสถานะไม่ประสงค์ลงคะแนนอัตโนมัติ
        };
      }
    });
  }, []);

  // ฟังก์ชัน: กดเลือก/ยกเลิก "ไม่ประสงค์ลงคะแนน"
  const toggleAbstain = useCallback((checked: boolean) => {
    setState((prev) => ({
      ...prev,
      isAbstain: checked,
      // ถ้าเลือก "ไม่ประสงค์ลงคะแนน" ให้ล้างรายชื่อคนที่เลือกไว้ทั้งหมดทันที
      selectedCandidates: checked ? [] : prev.selectedCandidates,
    }));
  }, []);

  // ฟังก์ชัน: ล้างข้อมูลเมื่อทำรายการเสร็จ
  const clearVotingData = useCallback(() => {
    setState((prev) => ({
      ...prev,
      // เคลียร์รายชื่อผู้สมัครที่เลือก
      selectedCandidates: [],
      // ตั้งค่าสถานะ "ไม่ประสงค์ลงคะแนน" เป็น false
      isAbstain: false,
    }));
  }, []);

  // ใช้ useMemo เพื่อป้องกัน Re-render โดยไม่จำเป็น
  const contextValue = useMemo(
    () => ({
      state,
      setElectionInfo,
      setMemberId,
      toggleCandidate,
      toggleAbstain,
      clearVotingData,
    }),
    [
      state,
      setElectionInfo,
      setMemberId,
      toggleCandidate,
      toggleAbstain,
      clearVotingData,
    ],
  );

  return (
    <VotingContext.Provider value={contextValue}>
      {children}
    </VotingContext.Provider>
  );
}

// 6. Custom Hook สำหรับเรียกใช้งานใน Component อื่นๆ (พิมพ์ useVoting() ได้เลย)
export function useVoting() {
  const context = useContext(VotingContext);
  if (!context) {
    throw new Error("useVoting must be used within a VotingProvider");
  }
  return context;
}
