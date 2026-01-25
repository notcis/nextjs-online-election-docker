import Confirm from "./_components/Confirm";

export default async function ConfirmPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year } = await params;
  return <Confirm year={year} />;
}
