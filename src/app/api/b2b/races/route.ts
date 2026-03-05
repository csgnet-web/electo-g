import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db/client";

/**
 * GET /api/b2b/races — B2B API for campaigns, PACs, media, and research firms.
 * Requires API key authentication (checked by middleware in production).
 * Query params: ?state=PA&type=SENATE&tier=1
 */
export async function GET(req: NextRequest) {
  // TODO: Middleware checks $GRLA balance before allowing API calls
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) {
    return NextResponse.json(
      { error: "API key required. See /api/grla/b2b-access for access." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state");
  const type = searchParams.get("type");

  const where: Record<string, unknown> = {};
  if (state) where.state = state.toUpperCase();
  if (type) where.raceType = type.toUpperCase();

  const races = await prisma.race.findMany({
    where,
    orderBy: [{ coverageTier: "asc" }],
    select: {
      raceId: true,
      cycleYear: true,
      raceType: true,
      state: true,
      district: true,
      partisanLean: true,
      candidates: true,
      pollingAverages: true,
      pollingSpread: true,
      pollingTrend: true,
      fundraisingByCandidate: true,
      outsideSpending: true,
      coverageTier: true,
      enthusiasmIndex: true,
      earnedMediaVelocity: true,
      endorsements: true,
    },
  });

  return NextResponse.json({ races, count: races.length });
}
