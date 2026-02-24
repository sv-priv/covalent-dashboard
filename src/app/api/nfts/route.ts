import { NextRequest, NextResponse } from "next/server";
import { ProviderName, PROVIDER_META, NftBenchmarkResult } from "@/lib/types";
import { nftProviderFunctions } from "@/lib/providers/nfts";
import { resolveApiKey } from "@/lib/env-keys";

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { walletAddress, chain, providers: clientProviders } = body as {
      walletAddress: string;
      chain: string;
      providers: { name: ProviderName; apiKey: string }[];
    };

    if (!walletAddress || !clientProviders || clientProviders.length === 0) {
      return NextResponse.json(
        { error: "walletAddress and at least one provider are required" },
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

    const results: NftBenchmarkResult[] = await Promise.all(
      resolvedProviders.map(async ({ name, apiKey }) => {
        const meta = PROVIDER_META[name];
        const fetchFn = nftProviderFunctions[name];
        const start = performance.now();

        try {
          const count = await fetchFn(walletAddress, chain || "eth-mainnet", apiKey);
          const latencyMs = Math.round(performance.now() - start);
          return {
            provider: name,
            displayName: meta.displayName,
            color: meta.color,
            nftCount: count,
            latencyMs,
            success: true,
          };
        } catch (err) {
          const latencyMs = Math.round(performance.now() - start);
          return {
            provider: name,
            displayName: meta.displayName,
            color: meta.color,
            nftCount: 0,
            latencyMs,
            success: false,
            error: err instanceof Error ? err.message : String(err),
          };
        }
      })
    );

    const run = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      walletAddress,
      chain: chain || "eth-mainnet",
      results,
      status: "completed" as const,
    };

    return NextResponse.json(run);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
