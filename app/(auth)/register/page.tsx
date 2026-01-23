"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client"; // path ที่คุณ config ไว้
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleRegister = async () => {
    await authClient.signUp.email(
      {
        email,
        password,
        name,
      },
      {
        onSuccess: () => {
          alert("สร้างบัญชีสำเร็จ! กรุณาเข้าสู่ระบบ");
          router.push("/login");
        },
        onError: (ctx) => {
          alert(ctx.error.message);
        },
      },
    );
  };

  return (
    <div className="p-10 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">สร้าง Admin คนแรก (ชั่วคราว)</h1>
      <input
        className="border p-2 w-full rounded"
        placeholder="Name"
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="border p-2 w-full rounded"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2 w-full rounded"
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button
        className="bg-black text-white p-2 w-full rounded"
        onClick={handleRegister}
      >
        สร้างบัญชี
      </button>
    </div>
  );
}
