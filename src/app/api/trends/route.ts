import { NextRequest, NextResponse } from "next/server";
import { getLatencyTrends, getCoverageTrends } from "@/lib/db";
import { getSupabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  if (!getSupabase()) {
    return NextResponse.json({ latency: [], coverage: [] });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "30"), 100);

    const [latency, coverage] = await Promise.all([
      getLatencyTrends(limit),
      getCoverageTrends(limit),
    ]);

    return NextResponse.json({ latency, coverage });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
