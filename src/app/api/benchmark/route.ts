import { NextRequest, NextResponse } from "next/server";
import { BenchmarkRequest, ProviderBenchmarkResult, ProviderName, PROVIDER_META } from "@/lib/types";
import { benchmarkProvider } from "@/lib/benchmark";
import { resolveApiKey } from "@/lib/env-keys";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body: BenchmarkRequest = await req.json();

    if (!body.walletAddress || !body.providers || body.providers.length === 0) {
      return NextResponse.json(
        { error: "walletAddress and at least one provider are required" },
        { status: 400 }
      );
    }

    const iterations = body.iterations || 5;
    const concurrency = body.concurrency || 3;
    const chain = body.chain || "eth-mainnet";

    const results: ProviderBenchmarkResult[] = [];

    for (const provider of body.providers) {
      const apiKey = resolveApiKey(provider.name, provider.apiKey);
      if (!apiKey) {
        continue;
      }
      try {
        const result = await benchmarkProvider(
          provider.name,
          body.walletAddress,
          chain,
          apiKey,
          iterations,
          concurrency
        );
        results.push(result);
      } catch (err) {
        const meta = PROVIDER_META[provider.name as ProviderName] || { displayName: provider.name, color: "#666" };
        results.push({
          provider: provider.name,
          displayName: meta.displayName,
          color: meta.color,
          latency: { avg: 0, min: 0, max: 0, p95: 0, samples: [] },
          completeness: {
            score: 0,
            totalFields: 12,
            presentFields: 0,
            fieldBreakdown: {},
            tokensReturned: 0,
          },
          reliability: {
            successRate: 0,
            totalRequests: iterations,
            successfulRequests: 0,
            failedRequests: iterations,
            errors: [err instanceof Error ? err.message : String(err)],
          },
          throughput: {
            requestsPerSecond: 0,
            concurrentRequests: concurrency,
            completedInWindow: 0,
            windowMs: 0,
          },
          rawDataSample: [],
        });
      }
    }

    return NextResponse.json({
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      walletAddress: body.walletAddress,
      chain,
      results,
      status: "completed",
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
