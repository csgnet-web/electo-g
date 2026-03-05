import type { CandidateFundraising, OutsideSpending } from "../lib/types";

// ─── FEC API Client (Section 2.3) ────────────────────────────────────────────
// Campaign finance data: receipts, disbursements, candidate filings.
// https://api.open.fec.gov/

const FEC_BASE_URL = "https://api.open.fec.gov/v1";
const API_KEY = process.env.FEC_API_KEY ?? "DEMO_KEY";

/**
 * Fetch candidate fundraising data from FEC.
 */
export async function fetchCandidateFundraising(
  fecCandidateId: string
): Promise<CandidateFundraising | null> {
  try {
    const res = await fetch(
      `${FEC_BASE_URL}/candidate/${fecCandidateId}/totals/?api_key=${API_KEY}&cycle=2026`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const totals = data.results?.[0];
    if (!totals) return null;

    return {
      candidate_id: fecCandidateId,
      total_raised: totals.receipts ?? 0,
      total_spent: totals.disbursements ?? 0,
      cash_on_hand: totals.cash_on_hand_end_period ?? 0,
      last_filing_date: totals.coverage_end_date ?? new Date().toISOString(),
    };
  } catch (error) {
    console.error(`[fec] Error fetching ${fecCandidateId}:`, error);
    return null;
  }
}

/**
 * Fetch outside spending (independent expenditures) for a race.
 */
export async function fetchOutsideSpending(
  state: string,
  district: string,
  office: "S" | "H"
): Promise<OutsideSpending> {
  const defaultSpending: OutsideSpending = {
    total_for_dem: 0,
    total_for_rep: 0,
    total_against_dem: 0,
    total_against_rep: 0,
    top_spenders: [],
  };

  try {
    const params = new URLSearchParams({
      api_key: API_KEY,
      cycle: "2026",
      state,
      office,
      ...(district && { district }),
    });

    const res = await fetch(
      `${FEC_BASE_URL}/schedules/schedule_e/totals/by_candidate/?${params}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) return defaultSpending;

    const data = await res.json();
    // Parse results into OutsideSpending structure
    // (simplified — full implementation maps candidates to parties)
    return defaultSpending;
  } catch (error) {
    console.error(`[fec] Error fetching outside spending:`, error);
    return defaultSpending;
  }
}
