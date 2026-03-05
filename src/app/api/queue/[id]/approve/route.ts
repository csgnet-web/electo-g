import { NextRequest, NextResponse } from "next/server";
import { approveScript } from "@/pipeline/approvalWorkflow";

/**
 * POST /api/queue/:id/approve — Approve a script (optionally with edits).
 * Body: { editedScript?: string, operatorNotes?: string }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const updated = await approveScript(id, body.editedScript, body.operatorNotes);
  return NextResponse.json(updated);
}
