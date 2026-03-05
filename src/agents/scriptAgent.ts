import type { Race } from "@prisma/client";
import { callClaudeJSON } from "../lib/claude";
import { GORILLA_CHARACTER_BIBLE } from "../lib/constants";
import type { ScriptDraft, SegmentType, ScoredFlag } from "../lib/types";

// ─── Script Agent (Section 6.3) ──────────────────────────────────────────────
// Invoked when a race clears significance threshold and enters production queue.
// Input: Full Race Object, flagged developments, segment type, gorilla character bible.
// Output: Formatted script draft with segment type, duration, data points, overlays, and script text.

const SYSTEM_PROMPT = `You are the Script Agent for ElectionGorilla.

${GORILLA_CHARACTER_BIBLE}

Your role: write a broadcast script for the Election Gorilla to deliver on the 24/7 livestream.

OUTPUT FORMAT — return valid JSON with these fields:
{
  "segment_type": "WHIP_AROUND_BRIEF" | "DEEP_DIVE" | "MACRO_MENTION" | "BREAKING_UPDATE" | "MACRO_ANALYSIS",
  "estimated_duration_sec": <number>,
  "key_data_points": ["<string>", ...],
  "suggested_visual_overlays": ["<string>", ...],
  "script_text": "<full script in gorilla voice>"
}

SEGMENT DURATION GUIDE:
- WHIP_AROUND_BRIEF: 60-90 seconds. Quick hits. Punchy.
- DEEP_DIVE: 8-15 minutes. Full analytical breakdown.
- MACRO_MENTION: 30-60 seconds. Brief context mention.
- BREAKING_UPDATE: 2-5 minutes. Urgent but factual.
- MACRO_ANALYSIS: 5-10 minutes. Cross-race narrative.

SCRIPT WRITING RULES:
- Write the script exactly as the gorilla would speak it aloud
- Include [PAUSE], [BEAT], [EMPHASIS] directions where appropriate
- Reference specific numbers: precinct counts, dollar figures, poll margins
- Never editorialize on who "should" win — show the math
- End every segment with a forward-looking hook: what to watch next`;

export interface ScriptAgentInput {
  race: Race;
  developments: ScoredFlag[];
  segmentType: SegmentType;
}

/**
 * Generate a gorilla-voice script draft for a race update.
 */
export async function runScriptAgent(input: ScriptAgentInput): Promise<ScriptDraft> {
  const { race, developments, segmentType } = input;

  const candidatesJson = JSON.stringify(race.candidates, null, 2);
  const pollingJson = JSON.stringify(race.pollingAverages, null, 2);
  const fundraisingJson = JSON.stringify(race.fundraisingByCandidate, null, 2);

  const userPrompt = `RACE: ${race.raceId}
Type: ${race.raceType} | State: ${race.state} | District: ${race.district || "Statewide"}
Partisan lean: ${race.partisanLean > 0 ? "R+" : "D+"}${Math.abs(race.partisanLean).toFixed(1)}
Coverage tier: ${race.coverageTier}
Incumbent: ${race.incumbentName} (${race.incumbentParty})${race.isOpenSeat ? " [OPEN SEAT]" : ""}

CANDIDATES:
${candidatesJson}

POLLING:
Spread: ${race.pollingSpread > 0 ? "R+" : "D+"}${Math.abs(race.pollingSpread).toFixed(1)}
Trend: ${race.pollingTrend}
Averages: ${pollingJson}

FUNDRAISING:
${fundraisingJson}
Outside spending: ${JSON.stringify(race.outsideSpending)}
Small dollar %: ${race.smallDollarPct}%

ENTHUSIASM INDEX: ${race.enthusiasmIndex}
EARNED MEDIA VELOCITY: ${race.earnedMediaVelocity}

LAST COVERAGE SUMMARY:
${race.lastScriptSummary || "No previous coverage."}

DEVELOPMENTS TO COVER:
${JSON.stringify(developments, null, 2)}

REQUESTED SEGMENT TYPE: ${segmentType}

Write a ${segmentType} script for this race covering the listed developments. Return valid JSON.`;

  return callClaudeJSON<ScriptDraft>({
    system: SYSTEM_PROMPT,
    userPrompt,
  });
}
