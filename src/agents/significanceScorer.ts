import type { Race } from "@prisma/client";
import { callClaudeJSON } from "../lib/claude";
import type { MonitorAgentFlag, ScoredFlag, SignificanceStatus } from "../lib/types";

// ─── Significance Scorer (Section 6.2) ───────────────────────────────────────
// Invoked immediately after Monitor Agent returns flags.
// Input: Monitor Agent output + Race Object's coverage_tier and last_covered_at.
// Output: Each flag promoted to BREAKING, QUEUE_NOW, or ARCHIVE.

const SYSTEM_PROMPT = `You are the Significance Scorer for ElectionGorilla.

Your role: evaluate flagged developments from the Monitor Agent and decide if each warrants content production.

For each flag, assign one of three statuses:
- BREAKING: Notify operator immediately. Target time-to-air: 3 hours. Reserved for race-changing events.
- QUEUE_NOW: Add to daily production batch. Significant enough to script and air.
- ARCHIVE: Enrich the race context but do NOT script. Background information only.

Consider:
- The race's current coverage tier (Tier 1 = top priority, Tier 5 = minimal)
- How recently the race was last covered
- Whether the development changes the trajectory or narrative of the race
- Whether the audience would expect coverage of this development

Return a JSON array of objects, each with all original fields plus a "status" field (BREAKING, QUEUE_NOW, or ARCHIVE).`;

export interface SignificanceScorerInput {
  flags: MonitorAgentFlag[];
  race: Race;
}

/**
 * Score each Monitor Agent flag for significance and assign a status.
 * Combines Claude reasoning with rule-based overrides per spec Section 6.2.
 */
export async function runSignificanceScorer(
  input: SignificanceScorerInput
): Promise<ScoredFlag[]> {
  const { flags, race } = input;

  if (flags.length === 0) return [];

  const userPrompt = `RACE: ${race.raceId} (Tier ${race.coverageTier})
Last covered: ${race.lastCoveredAt?.toISOString() ?? "Never"}
Days since covered: ${race.daysSinceCovered}

FLAGGED DEVELOPMENTS:
${JSON.stringify(flags, null, 2)}

Score each flag. Return a JSON array with all original fields plus "status" (BREAKING, QUEUE_NOW, or ARCHIVE).`;

  let scored = await callClaudeJSON<ScoredFlag[]>({
    system: SYSTEM_PROMPT,
    userPrompt,
  });

  // ── Rule-based overrides (Section 6.2) ──
  scored = scored.map((flag) => {
    const headlineLower = flag.headline.toLowerCase();

    // Any candidate withdrawal = BREAKING regardless of tier
    if (
      headlineLower.includes("withdraw") ||
      headlineLower.includes("drops out") ||
      headlineLower.includes("suspends campaign")
    ) {
      return { ...flag, status: "BREAKING" as SignificanceStatus };
    }

    // Any poll drop in Tier 1-2 race = QUEUE_NOW minimum
    if (
      race.coverageTier <= 2 &&
      (headlineLower.includes("poll") || headlineLower.includes("survey")) &&
      flag.status === "ARCHIVE"
    ) {
      return { ...flag, status: "QUEUE_NOW" as SignificanceStatus };
    }

    return flag;
  });

  return scored;
}
