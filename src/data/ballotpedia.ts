import type { Candidate } from "../lib/types";

// ─── Ballotpedia API Client (Section 2.3) ────────────────────────────────────
// Candidate data, race metadata, election dates, district information.

const API_KEY = process.env.BALLOTPEDIA_API_KEY ?? "";

/**
 * Fetch candidates for a specific race from Ballotpedia.
 * Stub: Returns empty array. Full implementation calls Ballotpedia API.
 */
export async function fetchCandidates(
  state: string,
  raceType: string,
  district?: string
): Promise<Candidate[]> {
  if (!API_KEY) {
    console.warn("[ballotpedia] No API key configured — returning empty data");
    return [];
  }

  // TODO: Implement Ballotpedia API integration
  // Their API requires a commercial agreement for programmatic access
  console.log(`[ballotpedia] Stub: fetchCandidates(${state}, ${raceType}, ${district})`);
  return [];
}

/**
 * Fetch election date information for a state.
 */
export async function fetchElectionDates(
  state: string,
  cycleYear: number
): Promise<{ demPrimary: string; repPrimary: string; general: string } | null> {
  if (!API_KEY) return null;

  // TODO: Implement
  console.log(`[ballotpedia] Stub: fetchElectionDates(${state}, ${cycleYear})`);
  return null;
}
