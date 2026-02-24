"use client";

import { useState, useEffect, use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ProviderBenchmarkResult, PricingBenchmarkResult, TokenPriceResult } from "@/lib/types";
import ProviderCard from "@/components/ProviderCard";
import SummaryTable from "@/components/SummaryTable";
import LatencyChart from "@/components/charts/LatencyChart";
import ThroughputChart from "@/components/charts/ThroughputChart";
import ReliabilityChart from "@/components/charts/ReliabilityChart";
import PricingAccuracyChart from "@/components/charts/PricingAccuracyChart";
import PricingTable from "@/components/PricingTable";

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function RunDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const type = searchParams.get("type") || "balances";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [benchmarkResults, setBenchmarkResults] = useState<ProviderBenchmarkResult[]>([]);
  const [pricingProviderResults, setPricingProviderResults] = useState<PricingBenchmarkResult[]>([]);
  const [pricingTokenResults, setPricingTokenResults] = useState<TokenPriceResult[]>([]);
  const [runMeta, setRunMeta] = useState<{ timestamp: number; chain: string; triggerType: string; walletAddress?: string } | null>(null);

  const [selectedTab, setSelectedTab] = useState<"overview" | "latency" | "reliability" | "throughput" | "pricing">(
    type === "pricing" ? "pricing" : "overview"
  );

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/history/${id}?type=${type}`);
        if (!res.ok) throw new Error("Run not found");
        const data = await res.json();

        if (data.type === "balances" && data.run) {
          setBenchmarkResults(data.run.results || []);
          setRunMeta({ timestamp: data.run.timestamp, chain: data.run.chain, triggerType: data.run.triggerType, walletAddress: data.run.walletAddress });
        } else if (data.type === "pricing" && data.run) {
          setPricingProviderResults(data.run.providerResults || []);
          setPricingTokenResults(data.run.tokenResults || []);
          setRunMeta({ timestamp: data.run.timestamp, chain: data.run.chain, triggerType: data.run.triggerType });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load run");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, type]);

  const isBenchmark = type === "balances";

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      {/* Breadcrumb */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm mb-6">
        <Link href="/history" className="text-[#A8A29E] hover:text-[#78716C] transition-colors">History</Link>
        <svg className="w-3.5 h-3.5 text-[#D6D3CE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-[#1a1a1a] font-medium">{isBenchmark ? "Balance Benchmark" : "Pricing Benchmark"}</span>
      </motion.div>

      {/* Header */}
      {runMeta && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6">
          <h1 className="text-xl font-bold text-[#1a1a1a]">
            {isBenchmark ? "Token Balance Benchmark" : "Pricing Accuracy Benchmark"}
          </h1>
          <div className="flex items-center gap-1.5 text-sm text-[#78716C] mt-1">
            <span>{formatDate(runMeta.timestamp)}</span>
            <span className="w-1 h-1 rounded-full bg-[#D6D3CE]" />
            <span>{runMeta.chain}</span>
            {runMeta.walletAddress && (
              <>
                <span className="w-1 h-1 rounded-full bg-[#D6D3CE]" />
                <span className="font-mono text-xs">{runMeta.walletAddress.slice(0, 6)}...{runMeta.walletAddress.slice(-4)}</span>
              </>
            )}
            <span className="w-1 h-1 rounded-full bg-[#D6D3CE]" />
            <span className="capitalize">{runMeta.triggerType}</span>
          </div>
        </motion.div>
      )}

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-[#E8E5E0] rounded-2xl p-6 shimmer h-32" />
          ))}
        </div>
      )}

      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-red-700">Failed to load benchmark run</p>
            <p className="text-sm text-red-600 mt-0.5">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Balance Results */}
      {!loading && !error && isBenchmark && benchmarkResults.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex gap-1 mb-6 bg-[#F5F3F0] border border-[#E8E5E0] rounded-xl p-1 w-fit flex-wrap">
            {([
              { key: "overview" as const, label: "Overview" },
              { key: "latency" as const, label: "Speed" },
              { key: "reliability" as const, label: "Uptime" },
              { key: "throughput" as const, label: "Capacity" },
            ]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedTab(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  selectedTab === key
                    ? "bg-white text-[#1a1a1a] shadow-sm border border-[#E8E5E0]"
                    : "text-[#78716C] hover:text-[#1a1a1a]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {selectedTab === "overview" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {benchmarkResults.map((r) => <ProviderCard key={r.provider} result={r} />)}
              </div>
              <SummaryTable results={benchmarkResults} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LatencyChart results={benchmarkResults} />
                <ReliabilityChart results={benchmarkResults} />
              </div>
              <ThroughputChart results={benchmarkResults} />
            </motion.div>
          )}

          {selectedTab === "latency" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <LatencyChart results={benchmarkResults} />
            </motion.div>
          )}
          {selectedTab === "reliability" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <ReliabilityChart results={benchmarkResults} />
            </motion.div>
          )}
          {selectedTab === "throughput" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <ThroughputChart results={benchmarkResults} />
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Pricing Results */}
      {!loading && !error && !isBenchmark && pricingProviderResults.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <PricingAccuracyChart results={pricingProviderResults} />
          <PricingTable tokenResults={pricingTokenResults} providerResults={pricingProviderResults} />
        </motion.div>
      )}
    </div>
  );
}
