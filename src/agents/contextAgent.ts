import type { Race } from "@prisma/client";
import { callClaudeJSON } from "../lib/claude";
import { GORILLA_CHARACTER_BIBLE } from "../lib/constants";
import type { ScriptDraft } from "../lib/types";

// ─── Context Agent (Section 6.4) ─────────────────────────────────────────────
// Runs independently on a weekly schedule. Not triggered per race — triggered by time.
// Input: All Tier 1-3 Race Objects, aggregated enthusiasm indices, national trend data.
// Output: 2-4 macro analysis scripts per week covering cross-race narratives.

const SYSTEM_PROMPT = `You are the Context Agent for ElectionGorilla.

${GORILLA_CHARACTER_BIBLE}

Your role: identify cross-race macro narratives and write MACRO_ANALYSIS scripts.

You receive a batch of the most competitive Race Objects and must identify patterns like:
- A consistent enthusiasm gap emerging across suburban districts in multiple swing states
- Outside spending patterns suggesting a party is writing off or flooding a specific race type
- Early vote patterns deviating from historical norms
- A cluster of down-ballot races that are proxies for a national policy question
- Fundraising velocity changes that signal shifting national priorities

OUTPUT FORMAT — return a JSON array of 2-4 script drafts:
[
  {
    "segment_type": "MACRO_ANALYSIS",
    "estimated_duration_sec": <number, 300-600>,
    "key_data_points": ["<string>", ...],
    "suggested_visual_overlays": ["<string>", ...],
    "script_text": "<full script in gorilla voice>"
  }
]

Each macro script should:
- Span at least 3 different races to qualify as a macro segment
- Reference specific numbers from the Race Objects
- Present a thesis about what the pattern MEANS for the national picture
- End with what to watch next — what data point would confirm or refute the thesis`;

/**
 * Run the Context Agent across all Tier 1-3 races.
 * Returns 2-4 macro analysis script drafts.
 */
export async function runContextAgent(races: Race[]): Promise<ScriptDraft[]> {
  if (races.length === 0) return [];

  const raceSummaries = races.map((r) => ({
    race_id: r.raceId,
    race_type: r.raceType,
    state: r.state,
    district: r.district,
    partisan_lean: r.partisanLean,
    coverage_tier: r.coverageTier,
    polling_spread: r.pollingSpread,
    polling_trend: r.pollingTrend,
    enthusiasm_index: r.enthusiasmIndex,
    earned_media_velocity: r.earnedMediaVelocity,
    social_sentiment_score: r.socialSentimentScore,
    small_dollar_pct: r.smallDollarPct,
    outside_spending: r.outsideSpending,
    incumbent_party: r.incumbentParty,
    is_open_seat: r.isOpenSeat,
    candidates: r.candidates,
    polling_averages: r.pollingAverages,
    fundraising_by_candidate: r.fundraisingByCandidate,
  }));

  const userPrompt = `COMPETITIVE RACE OBJECTS (Tier 1-3):
${JSON.stringify(raceSummaries, null, 2)}

AGGREGATE STATS:
- Total races analyzed: ${races.length}
- Average enthusiasm index: ${(races.reduce((s, r) => s + r.enthusiasmIndex, 0) / races.length).toFixed(2)}
- Average earned media velocity: ${(races.reduce((s, r) => s + r.earnedMediaVelocity, 0) / races.length).toFixed(2)}
- Open seats: ${races.filter((r) => r.isOpenSeat).length}

Identify 2-4 cross-race macro narratives from this data. Write MACRO_ANALYSIS scripts for each. Return a JSON array.`;

  return callClaudeJSON<ScriptDraft[]>({
    system: SYSTEM_PROMPT,
    userPrompt,
    maxTokens: 8192,
  });
}
