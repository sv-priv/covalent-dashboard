import { NextRequest, NextResponse } from "next/server";
import { ProviderName, PRICING_TEST_TOKENS } from "@/lib/types";
import { runPricingBenchmark } from "@/lib/pricing-benchmark";
import { resolveApiKey } from "@/lib/env-keys";
import { savePricingRun } from "@/lib/db";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { chain, providers: clientProviders } = body as {
      chain: string;
      providers: { name: ProviderName; apiKey: string }[];
    };

    if (!clientProviders || clientProviders.length === 0) {
      return NextResponse.json(
        { error: "At least one provider is required" },
        { status: 400 }
      );
    }

    const resolvedProviders = clientProviders
      .map((p) => ({
        name: p.name,
        apiKey: resolveApiKey(p.name, p.apiKey) || "",
      }))
      .filter((p) => p.apiKey.length > 0);

    if (resolvedProviders.length === 0) {
      return NextResponse.json(
        { error: "No valid API keys found for the selected providers" },
        { status: 400 }
      );
    }

    const { tokenResults, providerResults } = await runPricingBenchmark(
      PRICING_TEST_TOKENS,
      chain || "eth-mainnet",
      resolvedProviders
    );

    const run = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      chain: chain || "eth-mainnet",
      tokenResults,
      providerResults,
      status: "completed" as const,
    };

    try {
      await savePricingRun(run, (body as unknown as Record<string, unknown>).triggerType === "scheduled" ? "scheduled" : "manual");
    } catch (dbErr) {
      console.error("Failed to save pricing run to Supabase:", dbErr);
    }

    return NextResponse.json(run);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
