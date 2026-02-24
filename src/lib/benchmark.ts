import {
  ProviderName,
  ProviderBenchmarkResult,
  TokenBalance,
  COMPLETENESS_FIELDS,
  PROVIDER_META,
  LatencyStats,
} from "./types";
import { providerFunctions } from "./providers";

function calculateLatencyStats(samples: number[]): LatencyStats {
  const sorted = [...samples].sort((a, b) => a - b);
  const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
  const p95Index = Math.floor(sorted.length * 0.95);
  return {
    avg: Math.round(avg),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    p95: sorted[Math.min(p95Index, sorted.length - 1)],
    samples,
  };
}

function isFieldPresent(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string" && value === "") return false;
  return true;
}

function scoreCompleteness(tokens: TokenBalance[]) {
  if (tokens.length === 0) {
    return {
      score: 0,
      totalFields: COMPLETENESS_FIELDS.length,
      presentFields: 0,
      fieldBreakdown: Object.fromEntries(COMPLETENESS_FIELDS.map((f) => [f, false])),
      tokensReturned: 0,
    };
  }

  // Prefer tokens that have a name/symbol — these are non-dust tokens where
  // we'd actually expect providers to return full metadata.
  const meaningful = tokens.filter((t) => t.symbol || t.name);
  const pool = meaningful.length >= 5 ? meaningful : tokens;
  const sampleSize = Math.min(pool.length, 20);
  const sample = pool.slice(0, sampleSize);

  const fieldPresence: Record<string, number> = {};
  COMPLETENESS_FIELDS.forEach((field) => {
    fieldPresence[field] = 0;
  });

  sample.forEach((token) => {
    COMPLETENESS_FIELDS.forEach((field) => {
      if (isFieldPresent(token[field])) {
        fieldPresence[field]++;
      }
    });
  });

  const fieldBreakdown: Record<string, boolean> = {};
  let presentFields = 0;

  COMPLETENESS_FIELDS.forEach((field) => {
    const present = fieldPresence[field] > sampleSize * 0.3;
    fieldBreakdown[field] = present;
    if (present) presentFields++;
  });

  return {
    score: Math.round((presentFields / COMPLETENESS_FIELDS.length) * 100),
    totalFields: COMPLETENESS_FIELDS.length,
    presentFields,
    fieldBreakdown,
    tokensReturned: tokens.length,
  };
}

export async function benchmarkProvider(
  provider: ProviderName,
  walletAddress: string,
  chain: string,
  apiKey: string,
  iterations: number,
  concurrency: number
): Promise<ProviderBenchmarkResult> {
  const fetchFn = providerFunctions[provider];
  const meta = PROVIDER_META[provider];

  const latencySamples: number[] = [];
  let successCount = 0;
  let failCount = 0;
  const errors: string[] = [];
  let lastSuccessfulResult: TokenBalance[] = [];

  // Sequential requests for latency measurement
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    try {
      const result = await fetchFn(walletAddress, chain, apiKey);
      const elapsed = Math.round(performance.now() - start);
      latencySamples.push(elapsed);
      successCount++;
      lastSuccessfulResult = result;
    } catch (err) {
      failCount++;
      const elapsed = Math.round(performance.now() - start);
      latencySamples.push(elapsed);
      errors.push(err instanceof Error ? err.message : String(err));
    }
  }

  // Concurrent burst for throughput
  const burstStart = performance.now();
  const burstPromises = Array.from({ length: concurrency }, () =>
    fetchFn(walletAddress, chain, apiKey)
      .then(() => true)
      .catch(() => false)
  );
  const burstResults = await Promise.all(burstPromises);
  const burstElapsed = performance.now() - burstStart;
  const burstSuccesses = burstResults.filter(Boolean).length;

  return {
    provider,
    displayName: meta.displayName,
    color: meta.color,
    latency: calculateLatencyStats(
      latencySamples.length > 0 ? latencySamples : [0]
    ),
    completeness: scoreCompleteness(lastSuccessfulResult),
    reliability: {
      successRate:
        successCount + failCount > 0
          ? Math.round((successCount / (successCount + failCount)) * 100)
          : 0,
      totalRequests: successCount + failCount,
      successfulRequests: successCount,
      failedRequests: failCount,
      errors: errors.slice(0, 5),
    },
    throughput: {
      requestsPerSecond:
        burstElapsed > 0
          ? Math.round((burstSuccesses / (burstElapsed / 1000)) * 100) / 100
          : 0,
      concurrentRequests: concurrency,
      completedInWindow: burstSuccesses,
      windowMs: Math.round(burstElapsed),
    },
    rawDataSample: lastSuccessfulResult.slice(0, 5),
  };
}
