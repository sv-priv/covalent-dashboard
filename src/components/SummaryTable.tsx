"use client";

import { ProviderBenchmarkResult } from "@/lib/types";

function getRankBadge(rank: number) {
  if (rank === 0) return { label: "1st", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
  if (rank === 1) return { label: "2nd", bg: "bg-stone-100", text: "text-stone-600", border: "border-stone-200" };
  if (rank === 2) return { label: "3rd", bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" };
  return { label: `${rank + 1}th`, bg: "bg-stone-50", text: "text-stone-400", border: "border-stone-200" };
}

export default function SummaryTable({ results }: { results: ProviderBenchmarkResult[] }) {
  const latencyRank = [...results].sort((a, b) => a.latency.avg - b.latency.avg);
  const completenessRank = [...results].sort((a, b) => b.completeness.score - a.completeness.score);
  const reliabilityRank = [...results].sort((a, b) => b.reliability.successRate - a.reliability.successRate);
  const throughputRank = [...results].sort((a, b) => b.throughput.requestsPerSecond - a.throughput.requestsPerSecond);

  function getOverallScore(r: ProviderBenchmarkResult) {
    const latencyIdx = latencyRank.findIndex((x) => x.provider === r.provider);
    const completenessIdx = completenessRank.findIndex((x) => x.provider === r.provider);
    const reliabilityIdx = reliabilityRank.findIndex((x) => x.provider === r.provider);
    const throughputIdx = throughputRank.findIndex((x) => x.provider === r.provider);
    return latencyIdx + completenessIdx + reliabilityIdx + throughputIdx;
  }

  const overallRanked = [...results].sort((a, b) => getOverallScore(a) - getOverallScore(b));
  const winner = overallRanked[0];

  function isBestIn(r: ProviderBenchmarkResult, metric: "latency" | "completeness" | "reliability" | "throughput") {
    if (metric === "latency") return latencyRank[0]?.provider === r.provider;
    if (metric === "completeness") return completenessRank[0]?.provider === r.provider;
    if (metric === "reliability") return reliabilityRank[0]?.provider === r.provider;
    return throughputRank[0]?.provider === r.provider;
  }

  return (
    <div className="bg-white border border-[#E8E5E0] rounded-2xl p-6 overflow-x-auto">
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-lg font-semibold text-[#1a1a1a]">Overall Rankings</h3>
        {winner && (
          <span className="text-xs bg-[#FFF5F4] text-[#FF4C3B] px-2.5 py-1 rounded-full border border-[#FF4C3B]/15">
            Overall winner: {winner.displayName}
          </span>
        )}
      </div>
      <p className="text-sm text-[#78716C] mb-6">
        Each provider is ranked across all 4 metrics. The provider with the best combined rank wins.
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[#78716C] border-b border-[#E8E5E0]">
            <th className="text-left py-3 px-4 font-medium">Rank</th>
            <th className="text-left py-3 px-4 font-medium">Provider</th>
            <th className="text-right py-3 px-4 font-medium">
              <div>Speed</div>
              <div className="text-[10px] text-[#A8A29E] font-normal">avg response time</div>
            </th>
            <th className="text-right py-3 px-4 font-medium">
              <div>Data Quality</div>
              <div className="text-[10px] text-[#A8A29E] font-normal">fields returned</div>
            </th>
            <th className="text-right py-3 px-4 font-medium">
              <div>Uptime</div>
              <div className="text-[10px] text-[#A8A29E] font-normal">success rate</div>
            </th>
            <th className="text-right py-3 px-4 font-medium">
              <div>Capacity</div>
              <div className="text-[10px] text-[#A8A29E] font-normal">req/sec under load</div>
            </th>
            <th className="text-right py-3 px-4 font-medium">
              <div>Tokens</div>
              <div className="text-[10px] text-[#A8A29E] font-normal">found in wallet</div>
            </th>
          </tr>
        </thead>
        <tbody>
          {overallRanked.map((r, i) => {
            const badge = getRankBadge(i);
            const isWinner = i === 0;
            return (
              <tr
                key={r.provider}
                className={`border-b border-[#F0EDE8] transition-colors ${
                  isWinner ? "bg-[#FFF5F4]/50" : "hover:bg-[#FAFAF8]"
                }`}
              >
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center justify-center w-10 h-7 rounded-lg text-xs font-bold border ${badge.bg} ${badge.text} ${badge.border}`}>
                    {badge.label}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: r.color }}
                    />
                    <span className="text-[#1a1a1a] font-medium">{r.displayName}</span>
                  </div>
                </td>
                <td className={`py-4 px-4 text-right font-mono ${isBestIn(r, "latency") ? "text-emerald-600 font-semibold" : "text-[#1a1a1a]"}`}>
                  {r.latency.avg}ms
                </td>
                <td className="py-4 px-4 text-right">
                  <span
                    className={`font-mono font-bold ${isBestIn(r, "completeness") ? "text-emerald-600" : ""}`}
                    style={isBestIn(r, "completeness") ? {} : { color: r.color }}
                  >
                    {r.completeness.score}%
                  </span>
                  <span className="text-[#A8A29E] ml-1 text-xs">
                    ({r.completeness.presentFields}/{r.completeness.totalFields})
                  </span>
                </td>
                <td className={`py-4 px-4 text-right font-mono ${isBestIn(r, "reliability") ? "text-emerald-600 font-semibold" : "text-[#1a1a1a]"}`}>
                  {r.reliability.successRate}%
                </td>
                <td className={`py-4 px-4 text-right font-mono ${isBestIn(r, "throughput") ? "text-emerald-600 font-semibold" : "text-[#1a1a1a]"}`}>
                  {r.throughput.requestsPerSecond} rps
                </td>
                <td className="py-4 px-4 text-right font-mono text-[#78716C]">
                  {r.completeness.tokensReturned}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
