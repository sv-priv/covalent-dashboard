"use client";

import { TokenPriceResult, PricingBenchmarkResult, ProviderName } from "@/lib/types";

const CATEGORY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  "blue-chip": { label: "Major Tokens", color: "text-[#5B8DEF]", bg: "bg-blue-50 border-blue-200" },
  stablecoin: { label: "Stablecoins", color: "text-[#57C5B6]", bg: "bg-emerald-50 border-emerald-200" },
  defi: { label: "DeFi", color: "text-[#A78BFA]", bg: "bg-purple-50 border-purple-200" },
  "long-tail": { label: "Niche Tokens", color: "text-[#E5A93D]", bg: "bg-amber-50 border-amber-200" },
};

function formatPrice(price: number | null): string {
  if (price === null) return "—";
  if (price >= 1000) return `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toFixed(8)}`;
}

function formatDeviation(dev: number | null): { text: string; className: string } {
  if (dev === null) return { text: "—", className: "text-[#A8A29E]" };
  if (dev < 0.5) return { text: `${dev.toFixed(2)}%`, className: "text-emerald-600" };
  if (dev < 2) return { text: `${dev.toFixed(2)}%`, className: "text-amber-600" };
  if (dev < 5) return { text: `${dev.toFixed(2)}%`, className: "text-orange-500" };
  return { text: `${dev.toFixed(2)}%`, className: "text-red-500 font-semibold" };
}

export default function PricingTable({
  tokenResults,
  providerResults,
}: {
  tokenResults: TokenPriceResult[];
  providerResults: PricingBenchmarkResult[];
}) {
  const providers = providerResults.map((p) => p.provider);

  return (
    <div className="space-y-6">
      {/* Provider summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {providerResults.map((pr) => (
          <div key={pr.provider} className="bg-white border border-[#E8E5E0] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pr.color }} />
              <span className="text-sm font-semibold text-[#1a1a1a]">{pr.displayName}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-[#A8A29E] uppercase tracking-wider">Coverage</p>
                <p className="text-xl font-bold font-mono" style={{ color: pr.color }}>
                  {pr.coveragePercent}%
                </p>
                <p className="text-[10px] text-[#D6D3CE]">{pr.tokensCovered}/{pr.totalTokens} tokens</p>
              </div>
              <div>
                <p className="text-[10px] text-[#A8A29E] uppercase tracking-wider">Avg Deviation</p>
                <p className={`text-xl font-bold font-mono ${pr.avgDeviation !== null && pr.avgDeviation < 1 ? "text-emerald-600" : pr.avgDeviation !== null && pr.avgDeviation < 5 ? "text-amber-600" : "text-red-500"}`}>
                  {pr.avgDeviation !== null ? `${pr.avgDeviation}%` : "N/A"}
                </p>
                <p className="text-[10px] text-[#D6D3CE]">from consensus</p>
              </div>
            </div>
            {/* Category breakdown */}
            <div className="mt-3 pt-3 border-t border-[#F0EDE8] space-y-1.5">
              {Object.entries(pr.categoryBreakdown).map(([cat, data]) => {
                const catMeta = CATEGORY_LABELS[cat];
                return (
                  <div key={cat} className="flex items-center justify-between text-[11px]">
                    <span className={catMeta?.color || "text-[#78716C]"}>{catMeta?.label || cat}</span>
                    <span className="text-[#78716C] font-mono">
                      {data.covered}/{data.total}
                      {data.avgDev !== null && (
                        <span className="ml-1.5 text-[#A8A29E]">({data.avgDev}% dev)</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Full token-by-token table */}
      <div className="bg-white border border-[#E8E5E0] rounded-2xl p-6 overflow-x-auto">
        <h3 className="text-lg font-semibold text-[#1a1a1a] mb-1">Token-by-Token Comparison</h3>
        <p className="text-sm text-[#78716C] mb-4">
          Each cell shows the price returned. Deviation from the median consensus price is shown in color.
          Red = far from consensus, green = close.
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[#78716C] border-b border-[#E8E5E0]">
              <th className="text-left py-3 px-3 font-medium">Token</th>
              <th className="text-left py-3 px-3 font-medium">Category</th>
              <th className="text-right py-3 px-3 font-medium">Consensus</th>
              {providerResults.map((pr) => (
                <th key={pr.provider} className="text-right py-3 px-3 font-medium">
                  <span style={{ color: pr.color }}>{pr.displayName}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tokenResults.map((tr) => {
              const catMeta = CATEGORY_LABELS[tr.token.category];
              return (
                <tr key={tr.token.address} className="border-b border-[#F0EDE8] hover:bg-[#FAFAF8]">
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[#1a1a1a]">{tr.token.symbol}</span>
                      <span className="text-[10px] text-[#A8A29E]">{tr.token.name}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${catMeta?.bg || ""} ${catMeta?.color || ""}`}>
                      {catMeta?.label || tr.token.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-xs text-[#78716C]">
                    {formatPrice(tr.consensusPrice)}
                  </td>
                  {providers.map((provider) => {
                    const price = tr.prices[provider as ProviderName];
                    const dev = tr.deviations[provider as ProviderName];
                    const devFmt = formatDeviation(dev);
                    return (
                      <td key={provider} className="py-2.5 px-3 text-right">
                        {price !== null ? (
                          <div>
                            <span className="font-mono text-xs text-[#1a1a1a]">{formatPrice(price)}</span>
                            <span className={`block text-[10px] ${devFmt.className}`}>
                              {devFmt.text}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#D6D3CE]">No price</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
