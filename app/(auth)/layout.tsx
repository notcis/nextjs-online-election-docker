export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center">
      {/* คุณอาจจะใส่ Background Image หรือ Logo จางๆ ตรงนี้ก็ได้ */}
      {children}
    </div>
  );
}
