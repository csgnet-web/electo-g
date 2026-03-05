import type { Race } from "@prisma/client";
import { callClaudeJSON } from "../lib/claude";
import type { MonitorAgentFlag, PendingNewsItem } from "../lib/types";

// ─── Monitor Agent (Section 6.1) ─────────────────────────────────────────────
// Scheduled: hourly for Tier 1-2, every 6h for Tier 3, daily for Tier 4-5.
// Input: Race Object + last 48 hours of news for that race_id.
// Output: Array of flagged developments with significance estimate.
// NEVER writes to the Race Object directly — returns flags to pipeline layer.

const SYSTEM_PROMPT = `You are the Monitor Agent for ElectionGorilla, an AI election coverage platform.

Your role: analyze incoming news and data about a specific election race and identify NET-NEW, MEANINGFUL developments.

CRITICAL RULES:
- Only flag genuinely new developments — not recaps of what's already known
- Compare new information against the race's existing coverage summary and pending news queue
- Return ONLY valid JSON: an array of objects
- Each object must have: headline, source, url, significance_estimate (0.0-1.0), reason
- If there are no meaningful new developments, return an empty array: []
- significance_estimate guide:
  0.8-1.0: Race-changing (candidate withdrawal, major endorsement shift, scandal)
  0.5-0.7: Significant (new poll, major fundraising filing, key endorsement)
  0.3-0.4: Notable (minor endorsement, local news coverage spike)
  0.1-0.2: Background (routine filings, minor campaign events)`;

export interface MonitorAgentInput {
  race: Race;
  recentNews: { headline: string; source: string; url: string; published_at: string }[];
}

/**
 * Run the Monitor Agent for a single race.
 * Returns an array of flagged developments (may be empty).
 */
export async function runMonitorAgent(input: MonitorAgentInput): Promise<MonitorAgentFlag[]> {
  const { race, recentNews } = input;

  if (recentNews.length === 0) {
    return [];
  }

  const pendingQueue = race.pendingNewsQueue as unknown as PendingNewsItem[];
  const existingHeadlines = pendingQueue.map((item) => item.headline).join("\n");

  const userPrompt = `RACE: ${race.raceId} (${race.raceType}, ${race.state})
Partisan lean: ${race.partisanLean > 0 ? "R+" : "D+"}${Math.abs(race.partisanLean).toFixed(1)}
Coverage tier: ${race.coverageTier}
Incumbent: ${race.incumbentName} (${race.incumbentParty})

LAST COVERAGE SUMMARY:
${race.lastScriptSummary || "No previous coverage."}

ALREADY IN PENDING NEWS QUEUE:
${existingHeadlines || "Empty — no pending items."}

NEW NEWS BATCH (last 48 hours):
${recentNews.map((n, i) => `${i + 1}. [${n.source}] ${n.headline} (${n.published_at})\n   URL: ${n.url}`).join("\n")}

Analyze these news items. Identify only NET-NEW developments that are not already captured in the pending queue or last coverage summary. Return a JSON array of flagged items.`;

  const flags = await callClaudeJSON<MonitorAgentFlag[]>({
    system: SYSTEM_PROMPT,
    userPrompt,
  });

  // Validate and clamp significance estimates
  return flags.map((flag) => ({
    ...flag,
    significance_estimate: Math.max(0, Math.min(1, flag.significance_estimate)),
  }));
}
