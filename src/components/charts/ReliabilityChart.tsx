"use client";

import { ProviderBenchmarkResult } from "@/lib/types";

function GaugeRing({ percentage, color, size = 100 }: { percentage: number; color: string; size?: number }) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#F0EDE8"
        strokeWidth={8}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={8}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
}

export default function ReliabilityChart({ results }: { results: ProviderBenchmarkResult[] }) {
  const allPerfect = results.every((r) => r.reliability.successRate === 100);

  return (
    <div className="bg-white border border-[#E8E5E0] rounded-2xl p-6">
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-lg font-semibold text-[#1a1a1a]">Reliability</h3>
        {allPerfect && (
          <span className="text-xs bg-[#FFF5F4] text-[#FF4C3B] px-2.5 py-1 rounded-full border border-[#FF4C3B]/15">
            All providers: 100%
          </span>
        )}
      </div>
      <p className="text-sm text-[#78716C] mb-2">
        Did the API actually work every time we called it? This shows the success rate.
      </p>
      <p className="text-xs text-[#A8A29E] mb-6">
        100% = every request worked. Lower numbers mean some requests failed or timed out.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {results.map((r) => (
          <div key={r.provider} className="flex flex-col items-center gap-3">
            <div className="relative">
              <GaugeRing percentage={r.reliability.successRate} color={r.color} size={90} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-[#1a1a1a] transform rotate-0">
                  {r.reliability.successRate}%
                </span>
              </div>
            </div>
            <span className="text-sm text-[#78716C] text-center">{r.displayName}</span>
            <span className="text-xs text-[#A8A29E]">
              {r.reliability.successfulRequests}/{r.reliability.totalRequests} requests worked
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
