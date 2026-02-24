import {
  ProviderName,
  PricingToken,
  TokenPriceResult,
  PricingBenchmarkResult,
  PROVIDER_META,
} from "./types";
import { pricingFunctions } from "./providers/pricing";

function computeConsensusPrice(prices: (number | null)[]): number | null {
  const valid = prices.filter((p): p is number => p !== null && p > 0);
  if (valid.length === 0) return null;
  if (valid.length === 1) return valid[0];

  // Use median for robustness against outliers
  const sorted = [...valid].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function computeDeviation(price: number | null, consensus: number | null): number | null {
  if (price === null || consensus === null || consensus === 0) return null;
  return Math.abs((price - consensus) / consensus) * 100;
}

export async function runPricingBenchmark(
  tokens: PricingToken[],
  chain: string,
  providers: { name: ProviderName; apiKey: string }[]
): Promise<{
  tokenResults: TokenPriceResult[];
  providerResults: PricingBenchmarkResult[];
}> {
  const providerPrices: Record<ProviderName, Map<string, number | null>> = {} as Record<ProviderName, Map<string, number | null>>;
  const providerLatencies: Record<ProviderName, number> = {} as Record<ProviderName, number>;

  // Fetch prices from all providers in parallel
  await Promise.all(
    providers.map(async ({ name, apiKey }) => {
      const fetchFn = pricingFunctions[name];
      const start = performance.now();
      try {
        providerPrices[name] = await fetchFn(tokens, chain, apiKey);
      } catch {
        providerPrices[name] = new Map(tokens.map((t) => [t.address, null]));
      }
      providerLatencies[name] = Math.round(performance.now() - start);
    })
  );

  // Build per-token results with consensus
  const tokenResults: TokenPriceResult[] = tokens.map((token) => {
    const prices: Record<ProviderName, number | null> = {} as Record<ProviderName, number | null>;
    const priceValues: (number | null)[] = [];

    for (const { name } of providers) {
      const p = providerPrices[name]?.get(token.address) ?? null;
      prices[name] = p;
      priceValues.push(p);
    }

    const consensusPrice = computeConsensusPrice(priceValues);

    const deviations: Record<ProviderName, number | null> = {} as Record<ProviderName, number | null>;
    for (const { name } of providers) {
      deviations[name] = computeDeviation(prices[name], consensusPrice);
    }

    return { token, prices, consensusPrice, deviations };
  });

  // Build per-provider summaries
  const categories = ["blue-chip", "stablecoin", "defi", "long-tail"];
  const providerResults: PricingBenchmarkResult[] = providers.map(({ name }) => {
    const meta = PROVIDER_META[name];
    let covered = 0;
    const devs: number[] = [];

    tokenResults.forEach((tr) => {
      if (tr.prices[name] !== null) {
        covered++;
        const dev = tr.deviations[name];
        if (dev !== null) devs.push(dev);
      }
    });

    const categoryBreakdown: Record<string, { covered: number; total: number; avgDev: number | null }> = {};
    for (const cat of categories) {
      const catTokens = tokenResults.filter((tr) => tr.token.category === cat);
      const catCovered = catTokens.filter((tr) => tr.prices[name] !== null).length;
      const catDevs = catTokens
        .map((tr) => tr.deviations[name])
        .filter((d): d is number => d !== null);

      categoryBreakdown[cat] = {
        covered: catCovered,
        total: catTokens.length,
        avgDev: catDevs.length > 0
          ? Math.round((catDevs.reduce((a, b) => a + b, 0) / catDevs.length) * 100) / 100
          : null,
      };
    }

    return {
      provider: name,
      displayName: meta.displayName,
      color: meta.color,
      tokensCovered: covered,
      totalTokens: tokens.length,
      coveragePercent: Math.round((covered / tokens.length) * 100),
      avgDeviation: devs.length > 0
        ? Math.round((devs.reduce((a, b) => a + b, 0) / devs.length) * 100) / 100
        : null,
      maxDeviation: devs.length > 0
        ? Math.round(Math.max(...devs) * 100) / 100
        : null,
      latencyMs: providerLatencies[name] || 0,
      categoryBreakdown,
    };
  });

  return { tokenResults, providerResults };
}
