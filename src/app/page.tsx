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
    reliability: { successRate: number };
    throughput: { requestsPerSecond: number };
  }[];
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function StatCard({ label, value, sub, color, delay = 0 }: { label: string; value: string; sub?: string; color?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white border border-[#E8E5E0] rounded-xl p-4 hover:shadow-sm transition-shadow duration-200"
    >
      <p className="text-xs text-[#A8A29E] uppercase tracking-wider mb-1.5 font-medium">{label}</p>
      <p className="text-2xl font-bold font-mono leading-tight" style={{ color: color || "#1a1a1a" }}>{value}</p>
      {sub && <p className="text-xs text-[#A8A29E] mt-1">{sub}</p>}
    </motion.div>
  );
}

const stagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardHome() {
  const [latencyTrends, setLatencyTrends] = useState<TrendPoint[]>([]);
  const [totalRuns, setTotalRuns] = useState<number>(0);
  const [aggregatedStats, setAggregatedStats] = useState<{ provider: string; displayName: string; color: string; avgLatency: number; avgUptime: number }[]>([]);
  const [latestRun, setLatestRun] = useState<LatestRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [trendsRes, historyRes] = await Promise.all([
          fetch("/api/trends?limit=100"),
          fetch("/api/history?type=balances&limit=1"),
        ]);

        if (trendsRes.ok) {
          const trends = await trendsRes.json();
          setLatencyTrends(trends.latency || []);
          setTotalRuns(trends.totalRuns ?? 0);
          setAggregatedStats(trends.aggregatedStats || []);
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

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a]">Dashboard</h1>
          <p className="text-sm text-[#78716C] mt-0.5">Overview of API provider performance</p>
        </div>
        <Link
          href="/benchmark"
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#1a1a1a] text-white hover:bg-[#333] active:scale-[0.97] transition-all flex items-center gap-2 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          </svg>
          New Benchmark
        </Link>
      </motion.div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border border-[#E8E5E0] rounded-2xl p-6 shimmer h-32" />
          ))}
        </div>
      )}

      {!loading && error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
          <svg className="w-5 h-5 text-red-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <div>
            <p className="text-sm font-medium text-red-700">Failed to load dashboard data</p>
            <p className="text-sm text-red-600 mt-0.5">{error}</p>
          </div>
        </motion.div>
      )}

      {!loading && !error && latencyTrends.length === 0 && !latestRun && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-[#F5F3F0] flex items-center justify-center mx-auto mb-5 shadow-sm">
            <svg className="w-8 h-8 text-[#A8A29E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-[#1a1a1a] mb-2">No benchmark data yet</h2>
          <p className="text-sm text-[#78716C] mb-6 max-w-md mx-auto leading-relaxed">
            Run your first benchmark to start tracking API provider performance over time.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/benchmark"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#1a1a1a] text-white hover:bg-[#333] active:scale-[0.97] transition-all shadow-sm"
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
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
          {/* Latest Run Stats */}
          {latestRun && (
            <>
              <motion.div variants={fadeUp} className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#1a1a1a]">Latest Benchmark</h2>
                <div className="flex items-center gap-2 text-xs text-[#A8A29E]">
                  <span>{formatDate(latestRun.timestamp)}</span>
                  <span className="w-1 h-1 rounded-full bg-[#D6D3CE]" />
                  <span className="capitalize">{latestRun.triggerType}</span>
                  <span className="w-1 h-1 rounded-full bg-[#D6D3CE]" />
                  <span>{latestRun.chain}</span>
                </div>
              </motion.div>
              <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {latestRun.results.map((r) => (
                  <div key={r.provider} className="bg-white border border-[#E8E5E0] rounded-xl p-4 hover:shadow-sm transition-shadow duration-200">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                      <span className="text-xs font-medium text-[#1a1a1a]">{r.displayName}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-[10px] text-[#A8A29E] uppercase tracking-wider">Latency</p>
                        <p className="text-sm font-bold font-mono text-[#1a1a1a]">{r.latency.avg}ms</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#A8A29E] uppercase tracking-wider">Uptime</p>
                        <p className="text-sm font-bold font-mono text-[#1a1a1a]">{r.reliability.successRate}%</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-[#A8A29E] uppercase tracking-wider">Throughput</p>
                        <p className="text-sm font-bold font-mono text-[#1a1a1a]">{r.throughput.requestsPerSecond} rps</p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            </>
          )}

          {/* Latency Trend */}
          {latencyChartData.length > 1 && (
            <motion.div variants={fadeUp} className="bg-white border border-[#E8E5E0] rounded-2xl p-6 hover:shadow-sm transition-shadow duration-200">
              <h3 className="text-sm font-semibold text-[#1a1a1a] mb-1">Latency Over Time</h3>
              <p className="text-xs text-[#A8A29E] mb-5">Average response time (ms) per provider</p>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={latencyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#A8A29E" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#A8A29E" }} tickLine={false} axisLine={false} width={50} />
                    <Tooltip
                      contentStyle={{ background: "#fff", border: "1px solid #E8E5E0", borderRadius: 12, fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                      labelStyle={{ color: "#78716C", fontSize: 11 }}
                    />
                    {providers.map((p) => (
                      <Line key={p} type="monotone" dataKey={p} stroke={PROVIDER_META[p].color} strokeWidth={2} dot={false} name={PROVIDER_META[p].displayName} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Quick Stats - uses aggregated data from all runs when available */}
          {(latestRun || aggregatedStats.length > 0 || totalRuns > 0) && (
            <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Total Runs"
                value={String(totalRuns || 0)}
                sub="benchmark executions"
                delay={0}
              />
              <StatCard
                label="Fastest Provider"
                value={
                  aggregatedStats.length > 0
                    ? aggregatedStats.reduce((a, b) => a.avgLatency < b.avgLatency ? a : b).displayName
                    : latestRun?.results.reduce((a, b) => a.latency.avg < b.latency.avg ? a : b).displayName ?? "—"
                }
                sub={
                  aggregatedStats.length > 0
                    ? `${aggregatedStats.reduce((a, b) => a.avgLatency < b.avgLatency ? a : b).avgLatency}ms avg (all runs)`
                    : latestRun
                      ? `${latestRun.results.reduce((a, b) => a.latency.avg < b.latency.avg ? a : b).latency.avg}ms avg`
                      : "—"
                }
                color="#FF4C3B"
                delay={0.05}
              />
              <StatCard
                label="Best Uptime"
                value={
                  aggregatedStats.length > 0
                    ? `${Math.max(...aggregatedStats.map((r) => r.avgUptime))}%`
                    : latestRun
                      ? `${Math.max(...latestRun.results.map((r) => r.reliability.successRate))}%`
                      : "—"
                }
                sub={aggregatedStats.length > 0 ? "success rate (all runs)" : "success rate"}
                delay={0.1}
              />
              <StatCard
                label="Providers"
                value={String(aggregatedStats.length || latestRun?.results.length || 0)}
                sub="actively benchmarked"
                delay={0.15}
              />
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
