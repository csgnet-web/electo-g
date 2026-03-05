import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { recalculateRaceTier } from "@/stream/tierScorer";

/**
 * GET /api/races/:raceId — Get a single Race Object.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ raceId: string }> }
) {
  const { raceId } = await params;
  const race = await prisma.race.findUnique({ where: { raceId } });

  if (!race) {
    return NextResponse.json({ error: "Race not found" }, { status: 404 });
  }

  return NextResponse.json(race);
}

/**
 * PATCH /api/races/:raceId — Update a Race Object.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ raceId: string }> }
) {
  const { raceId } = await params;
  const body = await req.json();

  const race = await prisma.race.update({
    where: { raceId },
    data: body,
  });

  // Recalculate tier after update
  const tierData = recalculateRaceTier(race);
  const updated = await prisma.race.update({
    where: { raceId },
    data: {
      coverageTier: tierData.coverageTier,
      tierScoreRaw: tierData.tierScoreRaw,
      coverageFrequencyTarget: tierData.coverageFrequencyTarget as never,
    },
  });

  return NextResponse.json(updated);
}

/**
 * DELETE /api/races/:raceId — Delete a Race Object.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ raceId: string }> }
) {
  const { raceId } = await params;
  await prisma.race.delete({ where: { raceId } });
  return NextResponse.json({ deleted: true });
}
