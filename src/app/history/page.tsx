"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PROVIDER_META, ProviderName } from "@/lib/types";

interface RunSummary {
  id: string;
  timestamp: number;
  chain: string;
  walletAddress?: string;
  triggerType: string;
  status: string;
  results: {
    provider: string;
    displayName: string;
    color: string;
    latency: { avg: number };
    reliability: { successRate: number };
  }[];
}

interface PricingRunSummary {
  id: string;
  timestamp: number;
  chain: string;
  triggerType: string;
  status: string;
  providerResults: {
    provider: string;
    displayName: string;
    color: string;
    coveragePercent: number;
  }[];
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function formatRelativeTime(ts: number) {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(ts);
}

export default function HistoryPage() {
  const [benchmarkRuns, setBenchmarkRuns] = useState<RunSummary[]>([]);
  const [pricingRuns, setPricingRuns] = useState<PricingRunSummary[]>([]);
  const [totalBenchmarkRuns, setTotalBenchmarkRuns] = useState(0);
  const [totalPricingRuns, setTotalPricingRuns] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"balances" | "pricing">("balances");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/history?type=all&limit=50");
        if (res.ok) {
          const data = await res.json();
          setBenchmarkRuns(data.benchmarkRuns || []);
          setPricingRuns(data.pricingRuns || []);
          setTotalBenchmarkRuns(data.totalBenchmarkRuns ?? 0);
          setTotalPricingRuns(data.totalPricingRuns ?? 0);
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-8">
        <h1 className="text-xl font-bold text-[#1a1a1a]">History</h1>
        <p className="text-sm text-[#78716C] mt-0.5">
          Showing latest 50 of each · Dashboard analysis uses all runs
        </p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#F5F3F0] border border-[#E8E5E0] rounded-xl p-1 w-fit">
        {([
          { key: "balances" as const, label: "Token Balances", count: totalBenchmarkRuns },
          { key: "pricing" as const, label: "Pricing Accuracy", count: totalPricingRuns },
        ]).map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-2 ${
              tab === key
                ? "bg-white text-[#1a1a1a] shadow-sm border border-[#E8E5E0]"
                : "text-[#78716C] hover:text-[#1a1a1a]"
            }`}
          >
            {label}
            {!loading && count > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${tab === key ? "bg-[#F5F3F0] text-[#78716C]" : "bg-transparent text-[#A8A29E]"}`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white border border-[#E8E5E0] rounded-xl p-4 shimmer h-20" />
          ))}
        </div>
      )}

      {!loading && tab === "balances" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          {benchmarkRuns.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-14 h-14 rounded-2xl bg-[#F5F3F0] flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg className="w-7 h-7 text-[#A8A29E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[#1a1a1a] mb-1">No balance benchmark runs yet</p>
              <p className="text-xs text-[#A8A29E] mb-4">Run your first benchmark to start tracking results.</p>
              <Link href="/benchmark" className="text-sm text-[#FF4C3B] hover:text-[#E0392A] font-medium transition-colors">
                Run first benchmark
                <svg className="w-3.5 h-3.5 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ) : (
            benchmarkRuns.map((run, i) => (
              <motion.div key={run.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Link
                  href={`/history/${run.id}?type=balances`}
                  className="block bg-white border border-[#E8E5E0] rounded-xl p-4 hover:border-[#FF4C3B]/20 hover:shadow-sm transition-all duration-150 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex gap-1">
                        {run.results.map((r) => (
                          <div key={r.provider} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                        ))}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1a1a1a]">{formatDate(run.timestamp)}</p>
                        <div className="flex items-center gap-1.5 text-xs text-[#A8A29E] mt-0.5">
                          {run.walletAddress && (
                            <>
                              <span className="font-mono">{run.walletAddress.slice(0, 6)}...{run.walletAddress.slice(-4)}</span>
                              <span className="w-1 h-1 rounded-full bg-[#D6D3CE]" />
                            </>
                          )}
                          <span>{run.chain}</span>
                          <span className="w-1 h-1 rounded-full bg-[#D6D3CE]" />
                          <span>{run.results.length} providers</span>
                          <span className="w-1 h-1 rounded-full bg-[#D6D3CE]" />
                          <span className="capitalize">{run.triggerType}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {run.results.slice(0, 3).map((r) => (
                        <div key={r.provider} className="text-right hidden sm:block">
                          <p className="text-[10px] text-[#A8A29E]">{r.displayName}</p>
                          <p className="text-xs font-mono text-[#1a1a1a]">{r.latency.avg}ms</p>
                        </div>
                      ))}
                      <svg className="w-4 h-4 text-[#D6D3CE] group-hover:text-[#FF4C3B] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {!loading && tab === "pricing" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          {pricingRuns.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-14 h-14 rounded-2xl bg-[#F5F3F0] flex items-center justify-center mx-auto mb-4 shadow-sm">
                <svg className="w-7 h-7 text-[#A8A29E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[#1a1a1a] mb-1">No pricing benchmark runs yet</p>
              <p className="text-xs text-[#A8A29E] mb-4">Run a pricing benchmark to compare token price coverage.</p>
              <Link href="/benchmark" className="text-sm text-[#FF4C3B] hover:text-[#E0392A] font-medium transition-colors">
                Run first benchmark
                <svg className="w-3.5 h-3.5 inline ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ) : (
            pricingRuns.map((run, i) => (
              <motion.div key={run.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Link
                  href={`/history/${run.id}?type=pricing`}
                  className="block bg-white border border-[#E8E5E0] rounded-xl p-4 hover:border-[#FF4C3B]/20 hover:shadow-sm transition-all duration-150 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex gap-1">
                        {run.providerResults.map((r) => (
                          <div key={r.provider} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                        ))}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-[#1a1a1a]">{formatDate(run.timestamp)}</p>
                          <span className="text-[10px] text-[#A8A29E]">{formatRelativeTime(run.timestamp)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#A8A29E] mt-0.5">
                          <span>{run.chain}</span>
                          <span className="w-1 h-1 rounded-full bg-[#D6D3CE]" />
                          <span>{run.providerResults.length} providers</span>
                          <span className="w-1 h-1 rounded-full bg-[#D6D3CE]" />
                          <span className="capitalize">{run.triggerType}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {run.providerResults.slice(0, 3).map((r) => (
                        <div key={r.provider} className="text-right hidden sm:block">
                          <p className="text-[10px] text-[#A8A29E]">{r.displayName}</p>
                          <p className="text-xs font-mono text-[#1a1a1a]">{r.coveragePercent}%</p>
                        </div>
                      ))}
                      <svg className="w-4 h-4 text-[#D6D3CE] group-hover:text-[#FF4C3B] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
}
