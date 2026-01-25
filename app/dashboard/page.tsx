"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Users,
  Vote,
  CheckCircle2,
  Clock,
  Crown,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import VoterTrafficChart from "./_components/VoterTrafficChart";
import RegionPieChart from "./_components/RegionPieChart";
import AgeBarChart from "./_components/AgeBarChart";
import { getDashboardData } from "@/actions/dashboard.action";

// --------------------------------------------------------------------
// ข้อมูลจำลอง (Mock Data) - ของจริงจะดึงผ่าน SWR หรือ Server Action
// --------------------------------------------------------------------
const trafficData = [
  { time: "07:00", votes: 120 },
  { time: "08:00", votes: 450 },
  { time: "09:00", votes: 980 },
  { time: "10:00", votes: 1200 },
  { time: "11:00", votes: 800 },
  { time: "12:00", votes: 650 },
];

const regionData = [
  { name: "ภาคกลาง", value: 45 },
  { name: "ภาคเหนือ", value: 25 },
  { name: "ภาคอีสาน", value: 20 },
  { name: "ภาคใต้", value: 10 },
];
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const ageData = [
  { age: "20-30 ปี", votes: 350 },
  { age: "31-45 ปี", votes: 1250 },
  { age: "46-60 ปี", votes: 980 },
  { age: "60+ ปี", votes: 420 },
];

const liveResults = [
  {
    id: 1,
    name: "สมชาย รักสหกรณ์",
    no: 1,
    votes: 2150,
    img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Somchai",
  },
  {
    id: 2,
    name: "สมหญิง ออมทรัพย์",
    no: 2,
    votes: 1850,
    img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Somying",
  },
  {
    id: 3,
    name: "ประเสริฐ พัฒนา",
    no: 3,
    votes: 1650,
    img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Prasert",
  },
  {
    id: 4,
    name: "วันดี มั่นคง",
    no: 4,
    votes: 1200,
    img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Wandee",
  },
];
const abstainResult = { votes: 150 };
const totalVotes = 3000;

// --------------------------------------------------------------------

export default function DashboardPage() {
  // Initialize mounted to true directly as this is a client component
  // and Recharts expects to be rendered on the client.

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null); // เปลี่ยน State ให้รองรับข้อมูลจริง
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูลจริงจาก Server
  useEffect(() => {
    const fetchRealtimeData = async () => {
      const year = 2026; // อาจจะดึงจาก URL Params หรือ Global Settings
      const result = await getDashboardData(year);
      if (result.success) {
        setData(result);
      }
      setLoading(false);
    };

    fetchRealtimeData();

    // ทำ Auto-Refresh ทุกๆ 30 วินาที เพื่อให้กราฟวิ่งเอง (Live Dashboard)
    const interval = setInterval(fetchRealtimeData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !data) return <div>กำลังโหลดข้อมูล...</div>;

  console.log(data.summary.totalMembers);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-800">
            ภาพรวมระบบ (Dashboard)
          </h1>
          <p className="text-slate-500 text-sm">
            การเลือกตั้งคณะกรรมการดำเนินการ ปี 2569
          </p>
        </div>
        <Badge
          variant="secondary"
          className="px-3 py-1 font-mono text-sm shadow-sm bg-white border border-slate-200"
        >
          <Clock className="w-4 h-4 mr-2 text-slate-400" />
          เหลือเวลา:{" "}
          <span className="text-primary font-bold ml-1">
            {data.summary.endTime.toLocaleString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </Badge>
      </div>

      {/* --- Row 1: Summary Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="ผู้มาใช้สิทธิ์ (คน)"
          value={data.summary.totalVoted}
          percent={data.summary.votePercentage.toFixed(1)}
          icon={Vote}
          color="text-green-600"
          bg="bg-green-100"
        />
        <StatCard
          title="ผู้มีสิทธิ์เลือกตั้ง"
          value={data.summary.totalEligible}
          icon={UserCheck}
          color="text-blue-600"
          bg="bg-blue-100"
        />
        <StatCard
          title="สมาชิกทั้งหมด"
          value={data.summary.totalMembers}
          icon={Users}
          color="text-purple-600"
          bg="bg-purple-100"
        />
        <StatCard
          title="สถานะเซิร์ฟเวอร์"
          value="ปกติ"
          subValue="โหลด: 12%"
          icon={CheckCircle2}
          color="text-amber-600"
          bg="bg-amber-100"
        />
      </div>

      {/* --- Row 2: Charts (Traffic & Region) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* กราฟเส้น: Traffic */}
        <Card className="lg:col-span-2 shadow-sm border-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-primary" />
              แนวโน้มผู้มาลงคะแนนรายชั่วโมง
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <VoterTrafficChart trafficData={data.charts.traffic} />
          </CardContent>
        </Card>

        {/* กราฟวงกลม: แยกตามภาค */}
        <Card className="shadow-sm border-slate-100">
          <CardHeader className="pb-0">
            <CardTitle className="text-base font-bold">
              สัดส่วนตามภูมิภาค
            </CardTitle>
            <CardDescription>การกระจายตัวของคะแนนเสียง</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px] flex items-center justify-center">
            <RegionPieChart regionData={data.charts.region} COLORS={COLORS} />
          </CardContent>
        </Card>
      </div>

      {/* --- Row 3: Age Chart & Leaderboard --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* กราฟแท่ง: ช่วงอายุ */}

        <Card className="shadow-sm border-slate-100">
          <CardHeader>
            <CardTitle className="text-base font-bold">
              การลงคะแนนแยกตามช่วงอายุ
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <AgeBarChart ageData={data.charts.age} />
          </CardContent>
        </Card>

        {/* ตาราง Leaderboard */}
        <Card className="lg:col-span-2 shadow-sm border-slate-100 overflow-hidden">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-base font-bold">
              ผลการลงคะแนน Real-time
            </CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead className="w-[80px] text-center">อันดับ</TableHead>
                <TableHead>ผู้สมัคร</TableHead>
                <TableHead className="text-right">คะแนน</TableHead>
                <TableHead className="w-[150px]">สัดส่วน (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.leaderboard.candidates.map((cand, index) => {
                const isTop3 = index < 3;
                const percent = (cand.votes / totalVotes) * 100;
                return (
                  <TableRow key={cand.id}>
                    <TableCell className="text-center font-black text-lg">
                      {index === 0 ? (
                        <Crown className="w-5 h-5 text-yellow-500 mx-auto" />
                      ) : (
                        `#${index + 1}`
                      )}
                    </TableCell>
                    <TableCell className="flex items-center gap-3">
                      <Image
                        src={cand.img}
                        alt={cand.name}
                        width={36}
                        height={36}
                        className="rounded-full border"
                        unoptimized
                      />
                      <div>
                        <span className="font-bold">
                          {cand.no}. {cand.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">
                      {cand.votes.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={percent} className="h-2" />
                        <span className="text-xs text-slate-500">
                          {percent.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {/* แถว: ไม่ประสงค์ลงคะแนน */}
              <TableRow className="bg-slate-50 text-slate-500">
                <TableCell className="text-center text-xs font-bold">
                  N/A
                </TableCell>
                <TableCell className="font-medium">ไม่ประสงค์ลงคะแนน</TableCell>
                <TableCell className="text-right font-bold">
                  {data.leaderboard.abstain.votes.toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={data.leaderboard.abstain.percent}
                      className="h-2 bg-slate-200 [&>div]:bg-slate-400"
                    />
                    <span className="text-xs">
                      {data.leaderboard.abstain.percent.toFixed(1)}%
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}

// Sub-component สำหรับการ์ดสรุปด้านบน
function StatCard({
  title,
  value,
  subValue,
  percent,
  icon: Icon,
  color,
  bg,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any) {
  return (
    <Card className="shadow-sm border-slate-100">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-3xl font-black text-slate-800">
              {typeof value === "number" ? value.toLocaleString() : value}
            </h3>
            {percent && (
              <span className="text-sm font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                +{percent}%
              </span>
            )}
          </div>
          {subValue && (
            <p className="text-xs text-slate-400 mt-1">{subValue}</p>
          )}
        </div>
        <div
          className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function UserCheck(props: any) {
  return <Users {...props} />;
}
