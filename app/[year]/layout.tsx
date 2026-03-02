import { cookies } from "next/headers";
import { VotingProvider } from "@/context/VotingContext";

export default async function YearLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionCookie = (await cookies()).get("voter_session")?.value;

  let memberId = null;
  let memberCode = null;

  if (sessionCookie) {
    // แปลง String กลับเป็น Object
    const sessionData = JSON.parse(sessionCookie);

    memberId = sessionData.memberId;
    memberCode = sessionData.memberCode;
  }
  return (
    <VotingProvider initialMemberId={memberId} initialMemberCode={memberCode}>
      {/* ส่วนอื่นๆ เช่น Header, Container */}
      {children}
    </VotingProvider>
  );
}
