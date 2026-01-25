import Success from "./_components/Success";

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;

  return <Success year={year} />;
}
