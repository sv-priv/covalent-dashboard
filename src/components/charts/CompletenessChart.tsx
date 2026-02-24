"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { ProviderBenchmarkResult, COMPLETENESS_FIELDS } from "@/lib/types";

export default function CompletenessChart({ results }: { results: ProviderBenchmarkResult[] }) {
  const fieldLabels: Record<string, string> = {
    token_address: "Address",
    name: "Name",
    symbol: "Symbol",
    decimals: "Decimals",
    logo_url: "Logo",
    balance: "Balance",
    balance_usd: "USD Value",
    price_usd: "Price",
    price_24h_change: "24h Change",
    contract_type: "Type",
    is_spam: "Spam Flag",
    last_transfer_date: "Last Transfer",
  };

  const data = COMPLETENESS_FIELDS.map((field) => {
    const entry: Record<string, unknown> = { field: fieldLabels[field] || field };
    results.forEach((r) => {
      entry[r.displayName] = r.completeness.fieldBreakdown[field] ? 1 : 0;
    });
    return entry;
  });

  const richest = [...results].sort((a, b) => b.completeness.score - a.completeness.score)[0];

  return (
    <div className="bg-white border border-[#E8E5E0] rounded-2xl p-6">
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-lg font-semibold text-[#1a1a1a]">Data Completeness</h3>
        {richest && (
          <span className="text-xs bg-[#FFF5F4] text-[#FF4C3B] px-2.5 py-1 rounded-full border border-[#FF4C3B]/15">
            Most complete: {richest.displayName}
          </span>
        )}
      </div>
      <p className="text-sm text-[#78716C] mb-2">
        How much useful information each API includes per token. We check for 12 data fields like name, price, logo, spam flag, etc.
      </p>
      <p className="text-xs text-[#A8A29E] mb-6">
        Bigger shape = more data fields returned. An API that fills in everything scores 100%.
      </p>
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="#E8E5E0" />
          <PolarAngleAxis
            dataKey="field"
            tick={{ fill: "#78716C", fontSize: 11 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #E8E5E0",
              borderRadius: "12px",
              color: "#1a1a1a",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
          />
          {results.map((r) => (
            <Radar
              key={r.provider}
              name={r.displayName}
              dataKey={r.displayName}
              stroke={r.color}
              fill={r.color}
              fillOpacity={0.12}
              strokeWidth={2}
            />
          ))}
        </RadarChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-4 mt-4 justify-center">
        {results.map((r) => (
          <div key={r.provider} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
            <span className="text-sm text-[#78716C]">{r.displayName}</span>
            <span className="text-sm font-mono font-bold" style={{ color: r.color }}>
              {r.completeness.score}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
