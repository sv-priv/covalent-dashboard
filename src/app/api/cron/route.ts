import { NextRequest, NextResponse } from "next/server";
import { ProviderName, PROVIDER_META, getPricingTokensForChain } from "@/lib/types";
import { benchmarkProvider } from "@/lib/benchmark";
import { runPricingBenchmark } from "@/lib/pricing-benchmark";
import { getEnvKey } from "@/lib/env-keys";
import { saveBenchmarkRun, savePricingRun } from "@/lib/db";

export const maxDuration = 120;

const DEFAULT_WALLET = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045";
const DEFAULT_CHAIN = "eth-mainnet";
const DEFAULT_ITERATIONS = 5;
const DEFAULT_CONCURRENCY = 3;

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret") ||
    new URL(req.url).searchParams.get("secret");

  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providers = (Object.keys(PROVIDER_META) as ProviderName[])
    .map((name) => ({ name, apiKey: getEnvKey(name) || "" }))
    .filter((p) => p.apiKey.length > 0);

  if (providers.length === 0) {
    return NextResponse.json({ error: "No API keys configured" }, { status: 400 });
  }

  const summary: Record<string, unknown> = { timestamp: new Date().toISOString() };

  try {
    const benchmarkResults = [];
    for (const provider of providers) {
      try {
        const result = await benchmarkProvider(
          provider.name,
          DEFAULT_WALLET,
          DEFAULT_CHAIN,
          provider.apiKey,
          DEFAULT_ITERATIONS,
          DEFAULT_CONCURRENCY
        );
        benchmarkResults.push(result);
      } catch (err) {
        console.error(`Cron: benchmark failed for ${provider.name}:`, err);
      }
    }

    if (benchmarkResults.length > 0) {
      const run = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        walletAddress: DEFAULT_WALLET,
        chain: DEFAULT_CHAIN,
        results: benchmarkResults,
        status: "completed" as const,
      };
      await saveBenchmarkRun(run, "scheduled");
      summary.balances = { providers: benchmarkResults.length, status: "completed" };
    }

    const { tokenResults, providerResults } = await runPricingBenchmark(
      getPricingTokensForChain(DEFAULT_CHAIN),
      DEFAULT_CHAIN,
      providers
    );

    const pricingRun = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      chain: DEFAULT_CHAIN,
      tokenResults,
      providerResults,
      status: "completed" as const,
    };
    await savePricingRun(pricingRun, "scheduled");
    summary.pricing = { providers: providerResults.length, status: "completed" };
  } catch (err) {
    console.error("Cron: error:", err);
    summary.error = err instanceof Error ? err.message : "Unknown error";
  }

  return NextResponse.json(summary);
}
