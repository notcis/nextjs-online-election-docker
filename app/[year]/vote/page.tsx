import Vote from "./_components/vote";

export default async function VotePage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  return <Vote year={year} />;
}
