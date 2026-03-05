import { NextResponse } from "next/server";
import { generateStreamSchedule } from "@/stream/streamScheduler";

export const dynamic = "force-dynamic";

/**
 * GET /api/stream/schedule — Stream schedule JSON (Section 8.2).
 * OBS browser source reads this endpoint every 15 minutes.
 */
export async function GET() {
  const schedule = await generateStreamSchedule();
  return NextResponse.json(schedule, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}
