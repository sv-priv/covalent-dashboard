import { NextRequest, NextResponse } from "next/server";
import { getBenchmarkRuns, getPricingRuns, getBenchmarkRunsCount, getPricingRunsCount } from "@/lib/db";
import { getSupabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (!getSupabase()) {
    return NextResponse.json({ benchmarkRuns: [], pricingRuns: [], totalBenchmarkRuns: 0, totalPricingRuns: 0 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all";
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    const result: Record<string, unknown> = {};

    if (type === "all" || type === "balances") {
      const [runs, total] = await Promise.all([getBenchmarkRuns(limit, offset), getBenchmarkRunsCount()]);
      result.benchmarkRuns = runs;
      result.totalBenchmarkRuns = total;
    }

    if (type === "all" || type === "pricing") {
      const [runs, total] = await Promise.all([getPricingRuns(limit, offset), getPricingRunsCount()]);
      result.pricingRuns = runs;
      result.totalPricingRuns = total;
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
