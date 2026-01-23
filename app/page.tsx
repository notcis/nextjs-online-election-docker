import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Button asChild>
        <Link href="/login">เข้าสู่ระบบ</Link>
      </Button>
      <Button asChild>
        <Link href="/dashboard">หน้าหลัก</Link>
      </Button>
    </div>
  );
}
