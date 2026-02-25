import { getSupabase } from "./supabase";
import {
  ProviderBenchmarkResult,
  BenchmarkRun,
  PricingBenchmarkResult,
  PricingBenchmarkRun,
  TokenPriceResult,
} from "./types";

function requireSupabase() {
  const sb = getSupabase();
  if (!sb) throw new Error("Supabase not configured");
  return sb;
}

// ─── Benchmark Runs ───

export async function saveBenchmarkRun(
  run: BenchmarkRun,
  triggerType: "manual" | "scheduled" = "manual"
) {
  const { data: runRow, error: runErr } = await requireSupabase()
    .from("benchmark_runs")
    .insert({
      id: run.id,
      chain: run.chain,
      wallet_address: run.walletAddress,
      trigger_type: triggerType,
      status: run.status,
    })
    .select()
    .single();

  if (runErr) throw runErr;

  if (run.results.length > 0) {
    const rows = run.results.map((r) => ({
      run_id: runRow.id,
      provider: r.provider,
      display_name: r.displayName,
      color: r.color,
      latency_avg: r.latency.avg,
      latency_min: r.latency.min,
      latency_max: r.latency.max,
      latency_p95: r.latency.p95,
      completeness_score: r.completeness.score,
      completeness_fields_total: r.completeness.totalFields,
      completeness_fields_present: r.completeness.presentFields,
      completeness_tokens_returned: r.completeness.tokensReturned,
      reliability_success_rate: r.reliability.successRate,
      reliability_total: r.reliability.totalRequests,
      reliability_successful: r.reliability.successfulRequests,
      reliability_failed: r.reliability.failedRequests,
      throughput_rps: r.throughput.requestsPerSecond,
      throughput_concurrent: r.throughput.concurrentRequests,
      throughput_completed: r.throughput.completedInWindow,
      throughput_window_ms: r.throughput.windowMs,
      errors: r.reliability.errors,
      raw_json: r as unknown,
    }));

    const { error: resErr } = await requireSupabase()
      .from("benchmark_results")
      .insert(rows);
    if (resErr) throw resErr;
  }

  return runRow.id;
}

export async function getBenchmarkRuns(limit = 50, offset = 0) {
  const { data, error } = await requireSupabase()
    .from("benchmark_runs")
    .select("*, benchmark_results(*)")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return (data || []).map(dbRunToBenchmarkRun);
}

/** Returns true if a scheduled run exists within the last `withinMinutes` minutes. */
export async function hasRecentScheduledRun(withinMinutes = 15): Promise<boolean> {
  const cutoff = new Date(Date.now() - withinMinutes * 60 * 1000).toISOString();
  const { data, error } = await requireSupabase()
    .from("benchmark_runs")
    .select("id")
    .eq("trigger_type", "scheduled")
    .eq("status", "completed")
    .gte("created_at", cutoff)
    .limit(1);

  if (error) throw error;
  return (data?.length ?? 0) > 0;
}

export async function getBenchmarkRunById(id: string) {
  const { data, error } = await requireSupabase()
    .from("benchmark_runs")
    .select("*, benchmark_results(*)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data ? dbRunToBenchmarkRun(data) : null;
}

function dbRunToBenchmarkRun(row: Record<string, unknown>): BenchmarkRun & { triggerType: string } {
  const results = (row.benchmark_results as Record<string, unknown>[]) || [];
  return {
    id: row.id as string,
    timestamp: new Date(row.created_at as string).getTime(),
    walletAddress: row.wallet_address as string,
    chain: row.chain as string,
    status: row.status as BenchmarkRun["status"],
    triggerType: row.trigger_type as string,
    results: results.map((r) => {
      if (r.raw_json) return r.raw_json as ProviderBenchmarkResult;
      return {
        provider: r.provider,
        displayName: r.display_name,
        color: r.color,
        latency: {
          avg: r.latency_avg,
          min: r.latency_min,
          max: r.latency_max,
          p95: r.latency_p95,
          samples: [],
        },
        completeness: {
          score: r.completeness_score,
          totalFields: r.completeness_fields_total,
          presentFields: r.completeness_fields_present,
          fieldBreakdown: {},
          tokensReturned: r.completeness_tokens_returned,
        },
        reliability: {
          successRate: r.reliability_success_rate,
          totalRequests: r.reliability_total,
          successfulRequests: r.reliability_successful,
          failedRequests: r.reliability_failed,
          errors: (Array.isArray(r.errors) ? r.errors : []) as string[],
        },
        throughput: {
          requestsPerSecond: r.throughput_rps,
          concurrentRequests: r.throughput_concurrent,
          completedInWindow: r.throughput_completed,
          windowMs: r.throughput_window_ms,
        },
        rawDataSample: [],
      } as ProviderBenchmarkResult;
    }),
  };
}

// ─── Pricing Runs ───

export async function savePricingRun(
  run: PricingBenchmarkRun,
  triggerType: "manual" | "scheduled" = "manual"
) {
  const { data: runRow, error: runErr } = await requireSupabase()
    .from("pricing_runs")
    .insert({
      id: run.id,
      chain: run.chain,
      trigger_type: triggerType,
      status: run.status,
    })
    .select()
    .single();

  if (runErr) throw runErr;

  if (run.providerResults.length > 0) {
    const rows = run.providerResults.map((pr) => ({
      run_id: runRow.id,
      provider: pr.provider,
      display_name: pr.displayName,
      color: pr.color,
      coverage_pct: pr.coveragePercent,
      avg_deviation: pr.avgDeviation,
      max_deviation: pr.maxDeviation,
      latency_ms: pr.latencyMs,
      category_breakdown: pr.categoryBreakdown,
      token_results: run.tokenResults,
    }));

    const { error: resErr } = await requireSupabase()
      .from("pricing_results")
      .insert(rows);
    if (resErr) throw resErr;
  }

  return runRow.id;
}

export async function getPricingRuns(limit = 50, offset = 0) {
  const { data, error } = await requireSupabase()
    .from("pricing_runs")
    .select("*, pricing_results(*)")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return (data || []).map(dbPricingRunToRun);
}

export async function getPricingRunById(id: string) {
  const { data, error } = await requireSupabase()
    .from("pricing_runs")
    .select("*, pricing_results(*)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data ? dbPricingRunToRun(data) : null;
}

function dbPricingRunToRun(row: Record<string, unknown>): PricingBenchmarkRun & { triggerType: string } {
  const results = (row.pricing_results as Record<string, unknown>[]) || [];
  const firstTokenResults = results.length > 0
    ? (results[0].token_results as TokenPriceResult[]) || []
    : [];

  return {
    id: row.id as string,
    timestamp: new Date(row.created_at as string).getTime(),
    chain: row.chain as string,
    status: row.status as PricingBenchmarkRun["status"],
    triggerType: row.trigger_type as string,
    tokenResults: firstTokenResults,
    providerResults: results.map((r) => ({
      provider: r.provider as PricingBenchmarkResult["provider"],
      displayName: r.display_name as string,
      color: r.color as string,
      tokensCovered: 0,
      totalTokens: 0,
      coveragePercent: r.coverage_pct as number,
      avgDeviation: r.avg_deviation as number | null,
      maxDeviation: r.max_deviation as number | null,
      latencyMs: r.latency_ms as number,
      categoryBreakdown: r.category_breakdown as PricingBenchmarkResult["categoryBreakdown"],
    })),
  };
}

// ─── Trends ───

export async function getLatencyTrends(limit = 30) {
  const { data, error } = await requireSupabase()
    .from("benchmark_runs")
    .select("id, created_at, benchmark_results(provider, display_name, color, latency_avg, latency_p95, reliability_success_rate, throughput_rps, completeness_score)")
    .eq("status", "completed")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data || []).map((run) => ({
    id: run.id,
    timestamp: new Date(run.created_at).getTime(),
    providers: (run.benchmark_results || []).map((r: Record<string, unknown>) => ({
      provider: r.provider as string,
      displayName: r.display_name as string,
      color: r.color as string,
      latencyAvg: r.latency_avg as number,
      latencyP95: r.latency_p95 as number,
      reliabilityRate: r.reliability_success_rate as number,
      throughputRps: r.throughput_rps as number,
      completenessScore: r.completeness_score as number,
    })),
  }));
}

export async function getCoverageTrends(limit = 30) {
  const { data, error } = await requireSupabase()
    .from("pricing_runs")
    .select("id, created_at, pricing_results(provider, display_name, color, coverage_pct, avg_deviation)")
    .eq("status", "completed")
    .order("created_at", { ascending: true })
    .limit(limit);

  if (error) throw error;
  return (data || []).map((run) => ({
    id: run.id,
    timestamp: new Date(run.created_at).getTime(),
    providers: (run.pricing_results || []).map((r: Record<string, unknown>) => ({
      provider: r.provider as string,
      displayName: r.display_name as string,
      color: r.color as string,
      coveragePct: r.coverage_pct as number,
      avgDeviation: r.avg_deviation as number | null,
    })),
  }));
}

