import { NextRequest, NextResponse } from "next/server";
import { getBenchmarkRuns, getPricingRuns } from "@/lib/db";
import { getSupabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (!getSupabase()) {
    return NextResponse.json({ benchmarkRuns: [], pricingRuns: [] });
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all";
    const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    const result: Record<string, unknown> = {};

    if (type === "all" || type === "balances") {
      result.benchmarkRuns = await getBenchmarkRuns(limit, offset);
    }

    if (type === "all" || type === "pricing") {
      result.pricingRuns = await getPricingRuns(limit, offset);
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
