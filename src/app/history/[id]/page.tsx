"use client";

import { useState, useEffect, use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ProviderBenchmarkResult, PricingBenchmarkResult, TokenPriceResult } from "@/lib/types";
import ProviderCard from "@/components/ProviderCard";
import SummaryTable from "@/components/SummaryTable";
import LatencyChart from "@/components/charts/LatencyChart";
import CompletenessChart from "@/components/charts/CompletenessChart";
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

  const [selectedTab, setSelectedTab] = useState<"overview" | "latency" | "completeness" | "reliability" | "throughput" | "pricing">(
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
      <div className="flex items-center gap-2 text-sm mb-6">
        <Link href="/history" className="text-[#A8A29E] hover:text-[#78716C] transition-colors">History</Link>
        <svg className="w-3.5 h-3.5 text-[#D6D3CE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-[#1a1a1a] font-medium">{isBenchmark ? "Balance Benchmark" : "Pricing Benchmark"}</span>
      </div>

      {/* Header */}
      {runMeta && (
        <div className="mb-6">
          <h1 className="text-xl font-bold text-[#1a1a1a]">
            {isBenchmark ? "Token Balance Benchmark" : "Pricing Accuracy Benchmark"}
          </h1>
          <p className="text-sm text-[#78716C] mt-0.5">
            {formatDate(runMeta.timestamp)} &middot; {runMeta.chain}
            {runMeta.walletAddress && (
              <> &middot; <span className="font-mono">{runMeta.walletAddress.slice(0, 6)}...{runMeta.walletAddress.slice(-4)}</span></>
            )}
            {" "}&middot; {runMeta.triggerType}
          </p>
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-[#E8E5E0] rounded-2xl p-6 shimmer h-32" />
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">{error}</div>
      )}

      {/* Balance Results */}
      {!loading && !error && isBenchmark && benchmarkResults.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex gap-1 mb-6 bg-[#F5F3F0] border border-[#E8E5E0] rounded-xl p-1 w-fit flex-wrap">
            {([
              { key: "overview" as const, label: "Overview" },
              { key: "latency" as const, label: "Speed" },
              { key: "completeness" as const, label: "Data Quality" },
              { key: "reliability" as const, label: "Uptime" },
              { key: "throughput" as const, label: "Capacity" },
            ]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedTab(key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
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
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {benchmarkResults.map((r) => <ProviderCard key={r.provider} result={r} />)}
              </div>
              <SummaryTable results={benchmarkResults} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LatencyChart results={benchmarkResults} />
                <CompletenessChart results={benchmarkResults} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ThroughputChart results={benchmarkResults} />
                <ReliabilityChart results={benchmarkResults} />
              </div>
            </div>
          )}

          {selectedTab === "latency" && <LatencyChart results={benchmarkResults} />}
          {selectedTab === "completeness" && <CompletenessChart results={benchmarkResults} />}
          {selectedTab === "reliability" && <ReliabilityChart results={benchmarkResults} />}
          {selectedTab === "throughput" && <ThroughputChart results={benchmarkResults} />}
        </motion.div>
      )}

      {/* Pricing Results */}
      {!loading && !error && !isBenchmark && pricingProviderResults.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <PricingAccuracyChart results={pricingProviderResults} />
          <PricingTable tokenResults={pricingTokenResults} providerResults={pricingProviderResults} />
        </motion.div>
      )}
    </div>
  );
}
