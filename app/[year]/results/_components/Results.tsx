"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getElectionResults } from "@/actions/results.action";

// Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, BarChart3, Users, Crown } from "lucide-react";
import CountdownTimer from "../../vote/_components/CountdownTimer";

export default function Results({ year }: { year: string }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const yearInt = parseInt(year);
      const res = await getElectionResults(yearInt);
      setData(res);
      setIsLoading(false);
    };

    fetchData();
  }, [year]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <BarChart3 className="w-12 h-12 text-primary animate-pulse" />
        <p className="text-gray-500 font-medium">กำลังโหลดผลคะแนน...</p>
      </div>
    );
  }

  // --- กรณี 1: ยังไม่ปิดหีบ (ไม่ให้ดูผล) ---
  if (!data.isClosed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <Card className="w-full max-w-sm text-center border-0 shadow-lg p-6">
          <div className="mx-auto bg-amber-100 w-16 h-16 flex items-center justify-center rounded-full mb-4">
            <Clock className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">
            กำลังเปิดรับลงคะแนน
          </h2>
          <p className="text-sm text-gray-500 mt-2 mb-6">
            ผลการนับคะแนนจะแสดงอัตโนมัติ
            <br />
            หลังจากปิดการลงคะแนนในเวลา{" "}
            {data.endTime.toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "UTC",
            })}{" "}
            น.
          </p>
          <div className="bg-gray-100 rounded-lg p-3">
            <CountdownTimer endTime={data.endTime} />
          </div>
        </Card>
      </div>
    );
  }

  // --- กรณี 2: ปิดหีบแล้ว (แสดงผลคะแนน) ---
  return (
    <div className="max-w-7xl mx-auto flex-1 flex flex-col -mx-4 -mt-4 bg-gray-50 min-h-screen pb-10">
      {/* Header สรุปภาพรวม */}
      <div className="bg-primary text-white pt-10 pb-16 px-6 text-center shadow-md">
        <Trophy className="w-10 h-10 mx-auto text-yellow-300 mb-2" />
        <h1 className="text-2xl font-black">สรุปผลการลงคะแนน</h1>
        <p className="text-sm text-primary-foreground/80 mt-1">
          {data.electionTitle}
        </p>

        <div className="mt-4 inline-flex items-center bg-white/10 px-4 py-2 rounded-full border border-white/20">
          <Users className="w-4 h-4 mr-2 text-yellow-300" />
          <span className="font-semibold text-sm">
            จำนวนคะแนนเสียงรวม: {data.totalVotes.toLocaleString()} คะแนน
          </span>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="px-4 -mt-10 space-y-3">
        {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data.results.map((candidate: any) => {
            const isTop3 = candidate.rank <= 3;

            return (
              <Card
                key={candidate.candidateId}
                className={`border-0 shadow-sm ${candidate.rank === 1 ? "ring-2 ring-yellow-400" : ""}`}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  {/* หมายเลข & อันดับ */}
                  <div className="flex flex-col items-center justify-center w-10">
                    {candidate.rank === 1 && (
                      <Crown className="w-6 h-6 text-yellow-500 mb-1" />
                    )}
                    {candidate.rank === 2 && (
                      <Crown className="w-5 h-5 text-gray-400 mb-1" />
                    )}
                    {candidate.rank === 3 && (
                      <Crown className="w-5 h-5 text-amber-600 mb-1" />
                    )}
                    <span
                      className={`text-xl font-black ${isTop3 ? "text-gray-900" : "text-gray-400"}`}
                    >
                      #{candidate.rank}
                    </span>
                  </div>

                  {/* รูปโปรไฟล์ */}
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border">
                    <Image
                      src={candidate.imageUrl}
                      alt={candidate.firstName}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  {/* ชื่อ & หลอดคะแนน */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-gray-800 text-sm truncate">
                        {candidate.candidateNumber}. {candidate.firstName}{" "}
                        {candidate.lastName}
                      </span>
                      <span className="font-black text-primary text-sm">
                        {candidate.votes.toLocaleString()}{" "}
                        <span className="text-xs text-gray-400 font-normal">
                          โหวต
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={candidate.percentage}
                        className={`h-2 ${candidate.rank === 1 ? "bg-yellow-100 [&>div]:bg-yellow-500" : ""}`}
                      />
                      <span className="text-xs font-semibold text-gray-500 min-w-[32px] text-right">
                        {candidate.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        }
        {/* เส้นคั่นก่อน ไม่ประสงค์ลงคะแนน */}
        <div className="h-4" />
        {/* ไม่ประสงค์ลงคะแนน (อยู่ล่างสุดเสมอ) */}
        {data.abstainResult && (
          <Card className="border-0 shadow-sm bg-gray-100">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-10 flex justify-center">
                <Badge
                  variant="secondary"
                  className="bg-gray-300 text-gray-600 border-0"
                >
                  N/A
                </Badge>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-gray-600 text-sm">
                    ไม่ประสงค์ลงคะแนน
                  </span>
                  <span className="font-black text-gray-600 text-sm">
                    {data.abstainResult.votes.toLocaleString()}{" "}
                    <span className="text-xs font-normal">โหวต</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Progress
                    value={data.abstainResult.percentage}
                    className="h-2 bg-gray-200 [&>div]:bg-gray-400"
                  />
                  <span className="text-xs font-semibold text-gray-500 min-w-[32px] text-right">
                    {data.abstainResult.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
