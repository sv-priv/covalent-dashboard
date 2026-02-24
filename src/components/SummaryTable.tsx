"use client";

import { ProviderBenchmarkResult, PROVIDER_META, ProviderName } from "@/lib/types";

function getRankBadge(rank: number) {
  if (rank === 0) return { label: "1st", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
  if (rank === 1) return { label: "2nd", bg: "bg-stone-50", text: "text-stone-600", border: "border-stone-200" };
  if (rank === 2) return { label: "3rd", bg: "bg-orange-50", text: "text-orange-600", border: "border-orange-200" };
  return { label: `${rank + 1}th`, bg: "bg-stone-50", text: "text-stone-400", border: "border-stone-200" };
}

export default function SummaryTable({ results }: { results: ProviderBenchmarkResult[] }) {
  const latencyRank = [...results].sort((a, b) => a.latency.avg - b.latency.avg);
  const reliabilityRank = [...results].sort((a, b) => b.reliability.successRate - a.reliability.successRate);
  const throughputRank = [...results].sort((a, b) => b.throughput.requestsPerSecond - a.throughput.requestsPerSecond);

  function getOverallScore(r: ProviderBenchmarkResult) {
    const latencyIdx = latencyRank.findIndex((x) => x.provider === r.provider);
    const reliabilityIdx = reliabilityRank.findIndex((x) => x.provider === r.provider);
    const throughputIdx = throughputRank.findIndex((x) => x.provider === r.provider);
    return latencyIdx + reliabilityIdx + throughputIdx;
  }

  const overallRanked = [...results].sort((a, b) => getOverallScore(a) - getOverallScore(b));
  const winner = overallRanked[0];

  function isBestIn(r: ProviderBenchmarkResult, metric: "latency" | "reliability" | "throughput") {
    if (metric === "latency") return latencyRank[0]?.provider === r.provider;
    if (metric === "reliability") return reliabilityRank[0]?.provider === r.provider;
    return throughputRank[0]?.provider === r.provider;
  }

  return (
    <div className="bg-white border border-[#E8E5E0] rounded-2xl p-6 overflow-x-auto shadow-sm">
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-lg font-semibold text-[#1a1a1a]">Overall Rankings</h3>
        {winner && (
          <span className="text-xs bg-[#FFF5F4] text-[#FF4C3B] px-2.5 py-1 rounded-full border border-[#FF4C3B]/15 font-medium flex items-center gap-1.5">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {winner.displayName}
          </span>
        )}
      </div>
      <p className="text-sm text-[#78716C] mb-6">
        Ranked across speed, uptime, and capacity. Best combined rank wins.
      </p>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[#78716C] border-b border-[#E8E5E0]">
            <th className="text-left py-3 px-4 font-medium">Rank</th>
            <th className="text-left py-3 px-4 font-medium">Provider</th>
            <th className="text-right py-3 px-4 font-medium">
              <div>Speed</div>
              <div className="text-[10px] text-[#A8A29E] font-normal">avg response</div>
            </th>
            <th className="text-right py-3 px-4 font-medium">
              <div>Uptime</div>
              <div className="text-[10px] text-[#A8A29E] font-normal">success rate</div>
            </th>
            <th className="text-right py-3 px-4 font-medium">
              <div>Capacity</div>
              <div className="text-[10px] text-[#A8A29E] font-normal">req/sec</div>
            </th>
            <th className="text-right py-3 px-4 font-medium">
              <div>Tokens</div>
              <div className="text-[10px] text-[#A8A29E] font-normal">found</div>
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
                className={`border-b border-[#F0EDE8] transition-colors duration-150 ${
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
                      className="w-3 h-3 rounded-full shrink-0 ring-2 ring-white shadow-sm"
                      style={{ backgroundColor: r.color }}
                    />
                    <div>
                      <span className="text-[#1a1a1a] font-medium">{r.displayName}</span>
                      <p className="text-[9px] font-mono text-[#A8A29E] truncate max-w-[200px]" title={PROVIDER_META[r.provider as ProviderName]?.endpoints?.balances}>
                        {PROVIDER_META[r.provider as ProviderName]?.endpoints?.balances}
                      </p>
                    </div>
                  </div>
                </td>
                <td className={`py-4 px-4 text-right font-mono ${isBestIn(r, "latency") ? "text-emerald-600 font-semibold" : "text-[#1a1a1a]"}`}>
                  {r.latency.avg}ms
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
