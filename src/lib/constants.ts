// ─── Tier Scoring Weights (Section 5.1) ──────────────────────────────────────

export const TIER_WEIGHTS = {
  NATIONAL_SIGNIFICANCE: 0.30,
  COMPETITIVENESS: 0.25,
  RECENCY_PENALTY: 0.20,
  NEWS_QUEUE_DEPTH: 0.15,
  EARNED_MEDIA_VELOCITY: 0.10,
} as const;

// ── National significance base scores by race type
export const RACE_TYPE_SIGNIFICANCE: Record<string, number> = {
  SENATE: 10,
  GOVERNOR: 8,
  HOUSE: 7,    // toss-up; adjusted down for safe seats
  LT_GOVERNOR: 4,
  AG: 4,
  STATE_SEN: 2,
  STATE_HOU: 2,
  BALLOT_INIT: 3,
  LOCAL: 1,
};

// ── Tier boundaries (Section 5.2)
export const TIER_BOUNDARIES = {
  1: { min: 80, max: 100 },
  2: { min: 60, max: 79 },
  3: { min: 40, max: 59 },
  4: { min: 20, max: 39 },
  5: { min: 0, max: 19 },
} as const;

// ── Coverage frequency targets per tier
export const TIER_FREQUENCY: Record<number, string> = {
  1: "DAILY",
  2: "TWICE_WEEKLY",
  3: "WEEKLY",
  4: "BIWEEKLY",
  5: "MONTHLY",
};

// ── Monitor Agent invocation intervals (hours) per tier (Section 6.1)
export const MONITOR_INTERVAL_HOURS: Record<number, number> = {
  1: 1,
  2: 1,
  3: 6,
  4: 24,
  5: 24,
};

// ── Gorilla Character Bible (Section 6.3) ────────────────────────────────────

export const GORILLA_CHARACTER_BIBLE = `You are the Election Gorilla — the animated host of a 24/7 election coverage stream.

PERSONALITY:
- Passionate about data and numbers, never about candidates as people
- Slightly unhinged enthusiasm about electoral details — precinct-level stuff EXCITES you
- Never express partisan preference. "The numbers show X" not "X deserves to win"
- Use Kornacki-style construction: establish stakes, explain what would need to happen, show the path
- Short punchy sentences for whip-around segments. Longer analytical flow for deep dives
- Always end a segment with one forward-looking thing: what to watch next in this race

TONE:
- Energetic but credible
- Data-obsessed, not opinion-obsessed
- Think sports commentator for democracy
- You love the process, the margins, the precinct-level swings
- Occasionally reference your own gorilla nature with dry humor`;

// ── Claude API defaults
export const CLAUDE_MODEL = "claude-sonnet-4-20250514";
export const CLAUDE_MAX_TOKENS = 4096;

// ── Days target for coverage frequency
export const FREQUENCY_TARGET_DAYS: Record<string, number> = {
  DAILY: 1,
  TWICE_WEEKLY: 3.5,
  WEEKLY: 7,
  BIWEEKLY: 14,
  MONTHLY: 30,
};
