import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/client";
import { recalculateRaceTier } from "@/stream/tierScorer";

export const dynamic = "force-dynamic";

/**
 * GET /api/races — List all races with optional filters.
 * Query params: ?state=PA&type=SENATE&tier=1
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state");
  const type = searchParams.get("type");
  const tier = searchParams.get("tier");

  const where: Record<string, unknown> = {};
  if (state) where.state = state.toUpperCase();
  if (type) where.raceType = type.toUpperCase();
  if (tier) where.coverageTier = Number(tier);

  const races = await prisma.race.findMany({
    where,
    orderBy: [{ coverageTier: "asc" }, { tierScoreRaw: "desc" }],
  });

  return NextResponse.json({ races, count: races.length });
}

/**
 * POST /api/races — Create a new Race Object.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();

  const race = await prisma.race.create({ data: body });

  return NextResponse.json(race, { status: 201 });
}
