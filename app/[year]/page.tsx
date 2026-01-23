import Verification from "./_components/verification";

export default async function VerificationPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;

  return <Verification year={year} />;
}
