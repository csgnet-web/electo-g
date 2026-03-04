import { NextResponse } from "next/server";
import { AI_COMMENTARY, SOCIAL_SIGNALS } from "@/lib/mockData";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { commentary: AI_COMMENTARY, socialSignals: SOCIAL_SIGNALS },
    { headers: { "Cache-Control": "no-store" } }
  );
}
