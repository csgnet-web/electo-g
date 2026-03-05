import { NextResponse } from "next/server";
import { getQueueOverview } from "@/pipeline/approvalWorkflow";

export const dynamic = "force-dynamic";

/**
 * GET /api/queue — Production queue overview grouped by urgency.
 */
export async function GET() {
  const overview = await getQueueOverview();
  return NextResponse.json(overview);
}
