import { NextRequest, NextResponse } from "next/server";
import { HOUSE_RACES, SENATE_RACES, NATIONAL_OVERVIEW } from "@/lib/mockData";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const chamber = searchParams.get("chamber");
  const state = searchParams.get("state");
  const status = searchParams.get("status");

  let houseRaces = HOUSE_RACES;
  let senateRaces = SENATE_RACES;

  if (state) {
    houseRaces = houseRaces.filter((r) => r.stateAbbr.toLowerCase() === state.toLowerCase());
    senateRaces = senateRaces.filter((r) => r.stateAbbr.toLowerCase() === state.toLowerCase());
  }

  if (status) {
    houseRaces = houseRaces.filter((r) => r.raceStatus === status);
    senateRaces = senateRaces.filter((r) => r.raceStatus === status);
  }

  const payload =
    chamber === "house"
      ? { races: houseRaces, overview: NATIONAL_OVERVIEW }
      : chamber === "senate"
      ? { races: senateRaces, overview: NATIONAL_OVERVIEW }
      : { houseRaces, senateRaces, overview: NATIONAL_OVERVIEW };

  return NextResponse.json(payload, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
