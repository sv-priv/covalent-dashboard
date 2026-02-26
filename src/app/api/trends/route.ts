import { NextRequest, NextResponse } from "next/server";
import { getLatencyTrends, getCoverageTrends, getBenchmarkRunsCount, getAggregatedProviderStats } from "@/lib/db";
import { getSupabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (!getSupabase()) {
    return NextResponse.json({ latency: [], coverage: [], totalRuns: 0, aggregatedStats: [] });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 500);

    const [latency, coverage, totalRuns, aggregatedStats] = await Promise.all([
      getLatencyTrends(limit),
      getCoverageTrends(limit),
      getBenchmarkRunsCount(),
      getAggregatedProviderStats(),
    ]);

    return NextResponse.json({ latency, coverage, totalRuns, aggregatedStats });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
