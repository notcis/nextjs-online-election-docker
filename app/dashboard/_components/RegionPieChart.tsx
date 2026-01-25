import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export default function RegionPieChart({
  regionData,
  COLORS,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  regionData: any[];
  COLORS: string[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={regionData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          {regionData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
