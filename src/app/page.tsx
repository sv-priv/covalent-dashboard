"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PROVIDER_META, ProviderName } from "@/lib/types";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface TrendPoint {
  id: string;
  timestamp: number;
  providers: {
    provider: string;
    displayName: string;
    color: string;
    latencyAvg: number;
    latencyP95: number;
    reliabilityRate: number;
    throughputRps: number;
    completenessScore: number;
  }[];
}

interface CoverageTrendPoint {
  id: string;
  timestamp: number;
  providers: {
    provider: string;
    displayName: string;
    color: string;
    coveragePct: number;
    avgDeviation: number | null;
  }[];
}

interface LatestRun {
  id: string;
  timestamp: number;
  chain: string;
  walletAddress: string;
  triggerType: string;
  results: {
    provider: string;
    displayName: string;
    color: string;
    latency: { avg: number };
    completeness: { score: number };
    reliability: { successRate: number };
    throughput: { requestsPerSecond: number };
  }[];
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-white border border-[#E8E5E0] rounded-xl p-4">
      <p className="text-[11px] text-[#A8A29E] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold font-mono" style={{ color: color || "#1a1a1a" }}>{value}</p>
      {sub && <p className="text-[11px] text-[#A8A29E] mt-0.5">{sub}</p>}
    </div>
  );
}

export default function DashboardHome() {
  const [latencyTrends, setLatencyTrends] = useState<TrendPoint[]>([]);
  const [coverageTrends, setCoverageTrends] = useState<CoverageTrendPoint[]>([]);
  const [latestRun, setLatestRun] = useState<LatestRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [trendsRes, historyRes] = await Promise.all([
          fetch("/api/trends?limit=30"),
          fetch("/api/history?type=balances&limit=1"),
        ]);

        if (trendsRes.ok) {
          const trends = await trendsRes.json();
          setLatencyTrends(trends.latency || []);
          setCoverageTrends(trends.coverage || []);
        }

        if (historyRes.ok) {
          const history = await historyRes.json();
          if (history.benchmarkRuns?.length > 0) {
            setLatestRun(history.benchmarkRuns[0]);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const providers = Object.keys(PROVIDER_META) as ProviderName[];

  const latencyChartData = latencyTrends.map((point) => {
    const row: Record<string, unknown> = { date: formatDate(point.timestamp) };
    point.providers.forEach((p) => { row[p.provider] = p.latencyAvg; });
    return row;
  });

  const coverageChartData = coverageTrends.map((point) => {
    const row: Record<string, unknown> = { date: formatDate(point.timestamp) };
    point.providers.forEach((p) => { row[p.provider] = p.coveragePct; });
    return row;
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a]">Dashboard</h1>
          <p className="text-sm text-[#78716C] mt-0.5">Overview of API provider performance</p>
        </div>
        <Link
          href="/benchmark"
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#1a1a1a] text-white hover:bg-[#333] transition-all flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          </svg>
          New Benchmark
        </Link>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-[#E8E5E0] rounded-2xl p-6 shimmer h-32" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && latencyTrends.length === 0 && !latestRun && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[#F5F3F0] flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-[#A8A29E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[#1a1a1a] mb-2">No benchmark data yet</h2>
          <p className="text-sm text-[#78716C] mb-6 max-w-md mx-auto">
            Run your first benchmark to start tracking API provider performance over time. Results are stored in Supabase for historical analysis.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/benchmark"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#1a1a1a] text-white hover:bg-[#333] transition-all"
            >
              Run First Benchmark
            </Link>
            <Link
              href="/settings"
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-[#78716C] hover:text-[#1a1a1a] hover:bg-[#F5F3F0] transition-all border border-[#E8E5E0]"
            >
              Configure Settings
            </Link>
          </div>
        </motion.div>
      )}

      {!loading && !error && (latestRun || latencyTrends.length > 0) && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Latest Run Stats */}
          {latestRun && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#1a1a1a]">Latest Benchmark</h2>
                <span className="text-[11px] text-[#A8A29E]">
                  {formatDate(latestRun.timestamp)} &middot; {latestRun.triggerType} &middot; {latestRun.chain}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {latestRun.results.map((r) => (
                  <div key={r.provider} className="bg-white border border-[#E8E5E0] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                      <span className="text-xs font-medium text-[#1a1a1a]">{r.displayName}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[10px] text-[#A8A29E] uppercase">Latency</p>
                        <p className="text-sm font-bold font-mono text-[#1a1a1a]">{r.latency.avg}ms</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#A8A29E] uppercase">Uptime</p>
                        <p className="text-sm font-bold font-mono text-[#1a1a1a]">{r.reliability.successRate}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#A8A29E] uppercase">Quality</p>
                        <p className="text-sm font-bold font-mono text-[#1a1a1a]">{r.completeness.score}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#A8A29E] uppercase">Throughput</p>
                        <p className="text-sm font-bold font-mono text-[#1a1a1a]">{r.throughput.requestsPerSecond} rps</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Latency Trend */}
          {latencyChartData.length > 1 && (
            <div className="bg-white border border-[#E8E5E0] rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-[#1a1a1a] mb-1">Latency Over Time</h3>
              <p className="text-xs text-[#A8A29E] mb-4">Average response time (ms) per provider</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={latencyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#A8A29E" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#A8A29E" }} tickLine={false} axisLine={false} width={50} />
                    <Tooltip
                      contentStyle={{ background: "#fff", border: "1px solid #E8E5E0", borderRadius: 12, fontSize: 12 }}
                      labelStyle={{ color: "#78716C", fontSize: 11 }}
                    />
                    {providers.map((p) => (
                      <Line key={p} type="monotone" dataKey={p} stroke={PROVIDER_META[p].color} strokeWidth={2} dot={false} name={PROVIDER_META[p].displayName} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Coverage Trend */}
          {coverageChartData.length > 1 && (
            <div className="bg-white border border-[#E8E5E0] rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-[#1a1a1a] mb-1">Pricing Coverage Over Time</h3>
              <p className="text-xs text-[#A8A29E] mb-4">Percentage of tokens priced per provider</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={coverageChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#A8A29E" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#A8A29E" }} tickLine={false} axisLine={false} width={50} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{ background: "#fff", border: "1px solid #E8E5E0", borderRadius: 12, fontSize: 12 }}
                      labelStyle={{ color: "#78716C", fontSize: 11 }}
                    />
                    {providers.map((p) => (
                      <Line key={p} type="monotone" dataKey={p} stroke={PROVIDER_META[p].color} strokeWidth={2} dot={false} name={PROVIDER_META[p].displayName} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Quick Stats */}
          {latestRun && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Total Runs"
                value={String(latencyTrends.length || 1)}
                sub="benchmark executions"
              />
              <StatCard
                label="Fastest Provider"
                value={latestRun.results.reduce((a, b) => a.latency.avg < b.latency.avg ? a : b).displayName}
                sub={`${latestRun.results.reduce((a, b) => a.latency.avg < b.latency.avg ? a : b).latency.avg}ms avg`}
                color="#FF4C3B"
              />
              <StatCard
                label="Best Uptime"
                value={`${Math.max(...latestRun.results.map((r) => r.reliability.successRate))}%`}
                sub="success rate"
              />
              <StatCard
                label="Providers"
                value={String(latestRun.results.length)}
                sub="actively benchmarked"
              />
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
