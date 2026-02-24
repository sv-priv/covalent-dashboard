"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { ProviderBenchmarkResult } from "@/lib/types";

export default function LatencyChart({ results }: { results: ProviderBenchmarkResult[] }) {
  const data = results.map((r) => ({
    name: r.displayName,
    avg: r.latency.avg,
    min: r.latency.min,
    max: r.latency.max,
    p95: r.latency.p95,
    color: r.color,
  }));

  const fastest = [...results].sort((a, b) => a.latency.avg - b.latency.avg)[0];

  return (
    <div className="bg-white border border-[#E8E5E0] rounded-2xl p-6">
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-lg font-semibold text-[#1a1a1a]">Response Time</h3>
        {fastest && (
          <span className="text-xs bg-[#FFF5F4] text-[#FF4C3B] px-2.5 py-1 rounded-full border border-[#FF4C3B]/15">
            Fastest: {fastest.displayName}
          </span>
        )}
      </div>
      <p className="text-sm text-[#78716C] mb-2">
        How quickly each API responds to the same request. Shorter bars = faster API.
      </p>
      <p className="text-xs text-[#A8A29E] mb-6">
        <strong className="text-[#78716C]">Avg</strong> = typical speed &nbsp;&middot;&nbsp;
        <strong className="text-[#78716C]">P95</strong> = worst-case speed (95th percentile)
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barCategoryGap="20%">
          <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#78716C", fontSize: 12 }}
            axisLine={{ stroke: "#E8E5E0" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#78716C", fontSize: 12 }}
            axisLine={{ stroke: "#E8E5E0" }}
            tickLine={false}
            unit="ms"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #E8E5E0",
              borderRadius: "12px",
              color: "#1a1a1a",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            formatter={(value) => [`${value}ms`]}
          />
          <Legend wrapperStyle={{ color: "#78716C" }} />
          <Bar dataKey="avg" name="Avg (typical)" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} fillOpacity={0.85} />
            ))}
          </Bar>
          <Bar dataKey="p95" name="P95 (worst case)" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} fillOpacity={0.35} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
