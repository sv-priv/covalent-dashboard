"use client";

import { motion } from "framer-motion";
import { ProviderBenchmarkResult, PROVIDER_META, ProviderName } from "@/lib/types";

export default function ProviderCard({ result }: { result: ProviderBenchmarkResult }) {
  const meta = PROVIDER_META[result.provider as ProviderName];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-[#E8E5E0] rounded-2xl p-5 hover:border-[#D6D3CE] transition-all"
    >
      <div className="flex items-center gap-3 mb-1">
        <div
          className="w-4 h-4 rounded-full shrink-0"
          style={{ backgroundColor: result.color }}
        />
        <h3 className="text-[#1a1a1a] font-semibold">{result.displayName}</h3>
      </div>
      {meta?.endpoints?.balances && (
        <p className="text-[10px] font-mono text-[#A8A29E] mb-4 pl-7 truncate" title={meta.endpoints.balances}>
          {meta.endpoints.balances}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div title="How fast the API responds on average. Lower is better.">
          <p className="text-xs text-[#A8A29E] uppercase tracking-wider">Speed</p>
          <p className="text-2xl font-bold text-[#1a1a1a] font-mono mt-1">
            {result.latency.avg}<span className="text-sm text-[#A8A29E]">ms</span>
          </p>
          <p className="text-[10px] text-[#D6D3CE] mt-0.5">avg response time</p>
        </div>
        <div title="Percentage of useful data fields returned per token. Higher is better.">
          <p className="text-xs text-[#A8A29E] uppercase tracking-wider">Data Quality</p>
          <p className="text-2xl font-bold font-mono mt-1" style={{ color: result.color }}>
            {result.completeness.score}<span className="text-sm text-[#A8A29E]">%</span>
          </p>
          <p className="text-[10px] text-[#D6D3CE] mt-0.5">{result.completeness.presentFields}/{result.completeness.totalFields} fields</p>
        </div>
        <div title="How often requests succeed without errors. Higher is better.">
          <p className="text-xs text-[#A8A29E] uppercase tracking-wider">Uptime</p>
          <p className="text-2xl font-bold text-[#1a1a1a] font-mono mt-1">
            {result.reliability.successRate}<span className="text-sm text-[#A8A29E]">%</span>
          </p>
          <p className="text-[10px] text-[#D6D3CE] mt-0.5">{result.reliability.successfulRequests}/{result.reliability.totalRequests} succeeded</p>
        </div>
        <div title="How many requests the API handles per second under load. Higher is better.">
          <p className="text-xs text-[#A8A29E] uppercase tracking-wider">Capacity</p>
          <p className="text-2xl font-bold text-[#1a1a1a] font-mono mt-1">
            {result.throughput.requestsPerSecond}<span className="text-sm text-[#A8A29E]"> rps</span>
          </p>
          <p className="text-[10px] text-[#D6D3CE] mt-0.5">requests/sec</p>
        </div>
      </div>

      {result.reliability.errors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-xs text-red-600 font-medium mb-1">Some requests failed:</p>
          {result.reliability.errors.slice(0, 2).map((err, i) => (
            <p key={i} className="text-xs text-red-400 truncate">{err}</p>
          ))}
        </div>
      )}
    </motion.div>
  );
}
