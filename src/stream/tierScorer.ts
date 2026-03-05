import type { Race } from "@prisma/client";
import {
  TIER_WEIGHTS,
  RACE_TYPE_SIGNIFICANCE,
  TIER_BOUNDARIES,
  TIER_FREQUENCY,
  FREQUENCY_TARGET_DAYS,
} from "../lib/constants";
import type { PendingNewsItem } from "../lib/types";

// ─── Race Tier Scoring Algorithm (Section 5) ─────────────────────────────────

/**
 * Calculate a race's tier score (0–100) based on the weighted inputs
 * described in Section 5.1 of the spec.
 */
export function calculateTierScore(race: Race): number {
  const significanceScore = scoreNationalSignificance(race);
  const competitivenessScore = scoreCompetitiveness(race.partisanLean);
  const recencyScore = scoreRecencyPenalty(race);
  const newsQueueScore = scoreNewsQueueDepth(race);
  const mediaVelocityScore = scoreEarnedMediaVelocity(race.earnedMediaVelocity);

  const raw =
    significanceScore * TIER_WEIGHTS.NATIONAL_SIGNIFICANCE +
    competitivenessScore * TIER_WEIGHTS.COMPETITIVENESS +
    recencyScore * TIER_WEIGHTS.RECENCY_PENALTY +
    newsQueueScore * TIER_WEIGHTS.NEWS_QUEUE_DEPTH +
    mediaVelocityScore * TIER_WEIGHTS.EARNED_MEDIA_VELOCITY;

  // Clamp to 0–100
  return Math.max(0, Math.min(100, raw));
}

/**
 * Convert a raw score (0–100) to a tier (1–5).
 */
export function scoreToTier(score: number): number {
  for (const [tier, bounds] of Object.entries(TIER_BOUNDARIES)) {
    if (score >= bounds.min && score <= bounds.max) {
      return Number(tier);
    }
  }
  return 5;
}

/**
 * Get the coverage frequency target string for a tier.
 */
export function tierToFrequency(tier: number): string {
  return TIER_FREQUENCY[tier] ?? "MONTHLY";
}

/**
 * Full recalculation: returns tier, raw score, and frequency target.
 */
export function recalculateRaceTier(race: Race): {
  tierScoreRaw: number;
  coverageTier: number;
  coverageFrequencyTarget: string;
} {
  const tierScoreRaw = calculateTierScore(race);
  const coverageTier = scoreToTier(tierScoreRaw);
  const coverageFrequencyTarget = tierToFrequency(coverageTier);
  return { tierScoreRaw, coverageTier, coverageFrequencyTarget };
}

// ─── Individual Scoring Functions ────────────────────────────────────────────

/**
 * National electoral significance (30%).
 * Score 0–100 based on race type. House races are adjusted down
 * if partisan lean indicates a safe seat.
 */
function scoreNationalSignificance(race: Race): number {
  const baseScore = (RACE_TYPE_SIGNIFICANCE[race.raceType] ?? 1) * 10;

  // Adjust House races: safe seats get lower significance
  if (race.raceType === "HOUSE") {
    const leanAbs = Math.abs(race.partisanLean);
    if (leanAbs > 10) return 30; // safe seat = 3 * 10
  }

  return Math.min(100, baseScore);
}

/**
 * Competitiveness (25%).
 * |partisan_lean| < 2 = max score (100). Scales linearly to 0 at lean >= 15.
 */
function scoreCompetitiveness(partisanLean: number): number {
  const leanAbs = Math.abs(partisanLean);
  if (leanAbs <= 2) return 100;
  if (leanAbs >= 15) return 0;
  // Linear interpolation from 100 at lean=2 to 0 at lean=15
  return ((15 - leanAbs) / (15 - 2)) * 100;
}

/**
 * Recency penalty (20%).
 * Races uncovered longer than their target frequency get an exponential
 * score boost. Recently covered races score low here (0).
 */
function scoreRecencyPenalty(race: Race): number {
  if (!race.lastCoveredAt) return 100; // never covered = maximum urgency

  const targetDays = FREQUENCY_TARGET_DAYS[race.coverageFrequencyTarget] ?? 30;
  const daysSince = race.daysSinceCovered;

  if (daysSince <= targetDays) return 0;

  // Exponential boost for overdue races, capped at 100
  const overdueRatio = daysSince / targetDays;
  return Math.min(100, Math.pow(overdueRatio, 1.5) * 25);
}

/**
 * News queue depth (15%).
 * More unscripted flagged items = higher urgency to cover.
 */
function scoreNewsQueueDepth(race: Race): number {
  const queue = race.pendingNewsQueue as unknown as PendingNewsItem[];
  const depth = Array.isArray(queue) ? queue.length : 0;

  // 0 items = 0, 1 item = 25, 2 = 50, 3 = 75, 4+ = 100
  return Math.min(100, depth * 25);
}

/**
 * Earned media velocity (10%).
 * Spike in news mentions signals something worth covering.
 * Normalized: 0 velocity = 0 score, velocity >= 50 mentions/day = 100.
 */
function scoreEarnedMediaVelocity(velocity: number): number {
  return Math.min(100, (velocity / 50) * 100);
}
