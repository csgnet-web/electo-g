import { NextRequest, NextResponse } from "next/server";
import { rejectScript, type RejectionReason } from "@/pipeline/approvalWorkflow";

/**
 * POST /api/queue/:id/reject — Reject a script with categorized reason.
 * Body: { reason: "factually_wrong"|"tone_off"|"timing_not_right"|"needs_more_context", notes?: string }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  if (!body.reason) {
    return NextResponse.json({ error: "reason is required" }, { status: 400 });
  }

  const updated = await rejectScript(id, body.reason as RejectionReason, body.notes);
  return NextResponse.json(updated);
}
