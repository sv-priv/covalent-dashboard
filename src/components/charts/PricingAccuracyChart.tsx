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
import { PricingBenchmarkResult } from "@/lib/types";

export default function PricingAccuracyChart({ results }: { results: PricingBenchmarkResult[] }) {
  const coverageData = results.map((r) => ({
    name: r.displayName,
    coverage: r.coveragePercent,
    color: r.color,
  }));

  const best = [...results].sort((a, b) => b.coveragePercent - a.coveragePercent)[0];

  return (
    <div className="bg-white border border-[#E8E5E0] rounded-2xl p-6 hover:shadow-sm transition-shadow duration-200">
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-lg font-semibold text-[#1a1a1a]">Token Coverage</h3>
        {best && (
          <span className="text-xs bg-[#FFF5F4] text-[#FF4C3B] px-2.5 py-1 rounded-full border border-[#FF4C3B]/15 font-medium">
            Best coverage: {best.displayName}
          </span>
        )}
      </div>
      <p className="text-sm text-[#78716C] mb-2">
        Of the test tokens (Major, Stablecoins, DeFi, and Niche), how many does each API price?
      </p>
      <p className="text-xs text-[#A8A29E] mb-6">
        100% means the API priced every token we asked about.
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={coverageData} barCategoryGap="20%">
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
            unit="%"
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #E8E5E0",
              borderRadius: "12px",
              color: "#1a1a1a",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              padding: "10px 14px",
            }}
            formatter={(value) => [`${value}%`]}
          />
          <Legend wrapperStyle={{ color: "#78716C", fontSize: 12 }} />
          <Bar dataKey="coverage" name="Coverage %" radius={[6, 6, 0, 0]} animationDuration={800}>
            {coverageData.map((entry, index) => (
              <Cell key={index} fill={entry.color} fillOpacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
