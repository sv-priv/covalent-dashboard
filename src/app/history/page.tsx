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

export default function HistoryPage() {
  const [benchmarkRuns, setBenchmarkRuns] = useState<RunSummary[]>([]);
  const [pricingRuns, setPricingRuns] = useState<PricingRunSummary[]>([]);
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
        }
      } catch {} finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-[#1a1a1a]">History</h1>
        <p className="text-sm text-[#78716C] mt-0.5">All past benchmark runs stored in Supabase</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[#F5F3F0] border border-[#E8E5E0] rounded-xl p-1 w-fit">
        {([
          { key: "balances" as const, label: "Token Balances" },
          { key: "pricing" as const, label: "Pricing Accuracy" },
        ]).map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key
                ? "bg-white text-[#1a1a1a] shadow-sm border border-[#E8E5E0]"
                : "text-[#78716C] hover:text-[#1a1a1a]"
            }`}
          >
            {label}
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
            <div className="text-center py-16">
              <p className="text-sm text-[#A8A29E]">No balance benchmark runs yet.</p>
              <Link href="/benchmark" className="text-sm text-[#FF4C3B] hover:underline mt-2 inline-block">Run your first benchmark</Link>
            </div>
          ) : (
            benchmarkRuns.map((run) => (
              <Link
                key={run.id}
                href={`/history/${run.id}?type=balances`}
                className="block bg-white border border-[#E8E5E0] rounded-xl p-4 hover:border-[#FF4C3B]/20 hover:bg-[#FEFEFE] transition-all"
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
                      <p className="text-xs text-[#A8A29E]">
                        {run.chain} &middot; {run.results.length} providers &middot; {run.triggerType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {run.results.slice(0, 3).map((r) => (
                      <div key={r.provider} className="text-right hidden sm:block">
                        <p className="text-[10px] text-[#A8A29E]">{r.displayName}</p>
                        <p className="text-xs font-mono text-[#1a1a1a]">{r.latency.avg}ms</p>
                      </div>
                    ))}
                    <svg className="w-4 h-4 text-[#D6D3CE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))
          )}
        </motion.div>
      )}

      {!loading && tab === "pricing" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          {pricingRuns.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-sm text-[#A8A29E]">No pricing benchmark runs yet.</p>
              <Link href="/benchmark" className="text-sm text-[#FF4C3B] hover:underline mt-2 inline-block">Run your first benchmark</Link>
            </div>
          ) : (
            pricingRuns.map((run) => (
              <Link
                key={run.id}
                href={`/history/${run.id}?type=pricing`}
                className="block bg-white border border-[#E8E5E0] rounded-xl p-4 hover:border-[#FF4C3B]/20 hover:bg-[#FEFEFE] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1">
                      {run.providerResults.map((r) => (
                        <div key={r.provider} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                      ))}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1a1a1a]">{formatDate(run.timestamp)}</p>
                      <p className="text-xs text-[#A8A29E]">
                        {run.chain} &middot; {run.providerResults.length} providers &middot; {run.triggerType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {run.providerResults.slice(0, 3).map((r) => (
                      <div key={r.provider} className="text-right hidden sm:block">
                        <p className="text-[10px] text-[#A8A29E]">{r.displayName}</p>
                        <p className="text-xs font-mono text-[#1a1a1a]">{r.coveragePercent}%</p>
                      </div>
                    ))}
                    <svg className="w-4 h-4 text-[#D6D3CE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
}
