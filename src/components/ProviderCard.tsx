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
      className="bg-white border border-[#E8E5E0] rounded-2xl p-5 hover:shadow-md hover:border-[#D6D3CE] transition-all duration-200"
    >
      <div className="flex items-center gap-3 mb-1">
        <div
          className="w-4 h-4 rounded-full shrink-0 ring-2 ring-white shadow-sm"
          style={{ backgroundColor: result.color }}
        />
        <h3 className="text-[#1a1a1a] font-semibold">{result.displayName}</h3>
      </div>
      {meta?.endpoints?.balances && (
        <p className="text-[10px] font-mono text-[#A8A29E] mb-4 pl-7 truncate" title={meta.endpoints.balances}>
          {meta.endpoints.balances}
        </p>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs text-[#A8A29E] uppercase tracking-wider font-medium">Speed</p>
          <p className="text-2xl font-bold text-[#1a1a1a] font-mono mt-1 leading-tight">
            {result.latency.avg}<span className="text-sm text-[#A8A29E] ml-0.5">ms</span>
          </p>
          <p className="text-[10px] text-[#A8A29E] mt-0.5">avg response</p>
        </div>
        <div>
          <p className="text-xs text-[#A8A29E] uppercase tracking-wider font-medium">Uptime</p>
          <p className="text-2xl font-bold text-[#1a1a1a] font-mono mt-1 leading-tight">
            {result.reliability.successRate}<span className="text-sm text-[#A8A29E] ml-0.5">%</span>
          </p>
          <p className="text-[10px] text-[#A8A29E] mt-0.5">{result.reliability.successfulRequests}/{result.reliability.totalRequests} ok</p>
        </div>
        <div>
          <p className="text-xs text-[#A8A29E] uppercase tracking-wider font-medium">Capacity</p>
          <p className="text-2xl font-bold text-[#1a1a1a] font-mono mt-1 leading-tight">
            {result.throughput.requestsPerSecond}<span className="text-sm text-[#A8A29E] ml-0.5">rps</span>
          </p>
          <p className="text-[10px] text-[#A8A29E] mt-0.5">req/sec</p>
        </div>
      </div>

      {result.reliability.errors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-center gap-1.5 mb-1">
            <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.07 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-xs text-red-600 font-medium">Some requests failed</p>
          </div>
          {result.reliability.errors.slice(0, 2).map((err, i) => (
            <p key={i} className="text-xs text-red-400 truncate font-mono">{err}</p>
          ))}
        </div>
      )}
    </motion.div>
  );
}
