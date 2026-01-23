import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  DoorOpen,
  Banknote,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

export default async function DashboardPage() {
  // TODO: Fetch real data from Prisma here
  // const totalRooms = await prisma.room.count()
  // ...

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">ภาพรวม</h2>
        {/* ปุ่ม Action เร่งด่วน (ถ้ามี) */}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              รายรับเดือนนี้
            </CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿124,500</div>
            <p className="text-xs text-muted-foreground">
              +20.1% จากเดือนที่แล้ว
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ห้องว่าง</CardTitle>
            <DoorOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4 / 40</div>
            <p className="text-xs text-muted-foreground">อัตราการเข้าพัก 90%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ยอดค้างชำระ</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">฿8,400</div>
            <p className="text-xs text-muted-foreground">จาก 3 ห้อง</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              สัญญาจะหมดอายุ
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">ภายใน 30 วันนี้</p>
          </CardContent>
        </Card>
      </div>

      {/* Section 2: Quick Actions & Recent Activity (Placeholder) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>รายการเก็บเงินล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-10">
              ยังไม่มีข้อมูลธุรกรรม (รอเชื่อมต่อ Database)
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>แจ้งซ่อม / ปัญหา</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                <p className="text-sm font-medium leading-none">
                  ห้อง 104 - แอร์ไม่เย็น
                </p>
                <span className="ml-auto text-xs text-muted-foreground">
                  วันนี้
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                <p className="text-sm font-medium leading-none">
                  ห้อง 201 - เปลี่ยนหลอดไฟ
                </p>
                <span className="ml-auto text-xs text-muted-foreground">
                  เมื่อวาน
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
