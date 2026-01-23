import { VotingProvider } from "@/context/VotingContext";

export default function YearLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <VotingProvider>
      {/* ส่วนอื่นๆ เช่น Header, Container */}
      {children}
    </VotingProvider>
  );
}
