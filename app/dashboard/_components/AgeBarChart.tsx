import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function AgeBarChart({
  ageData,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ageData: any[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={ageData} layout="vertical" margin={{ left: 15 }}>
        <XAxis type="number" hide />
        <YAxis
          dataKey="age"
          type="category"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip cursor={{ fill: "#f1f5f9" }} />
        <Bar dataKey="votes" fill="#2563eb" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
