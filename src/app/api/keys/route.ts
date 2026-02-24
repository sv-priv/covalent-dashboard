import { NextResponse } from "next/server";
import { getEnvKeyStatus } from "@/lib/env-keys";

export async function GET() {
  return NextResponse.json(getEnvKeyStatus());
}
