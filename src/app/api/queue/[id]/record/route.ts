import { NextRequest, NextResponse } from "next/server";
import { markRecorded } from "@/pipeline/approvalWorkflow";

/**
 * POST /api/queue/:id/record — Mark a script as recorded with audio URL.
 * Body: { audioUrl: string }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  if (!body.audioUrl) {
    return NextResponse.json({ error: "audioUrl is required" }, { status: 400 });
  }

  const updated = await markRecorded(id, body.audioUrl);
  return NextResponse.json(updated);
}
