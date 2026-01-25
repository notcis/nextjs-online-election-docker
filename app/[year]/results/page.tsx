import Results from "./_components/Results";

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  return <Results year={year} />;
}
