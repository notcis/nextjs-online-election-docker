import { cookies } from "next/headers";
import { VotingProvider } from "@/context/VotingContext";

export default async function YearLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const memberId = cookieStore.get("voter_session")?.value || null;
  return (
    <VotingProvider initialMemberId={memberId}>
      {/* ส่วนอื่นๆ เช่น Header, Container */}
      {children}
    </VotingProvider>
  );
}
