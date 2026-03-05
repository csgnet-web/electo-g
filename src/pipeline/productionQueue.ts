import { Queue, Worker, type Job } from "bullmq";
import { prisma } from "../db/client";
import { runMonitorAgent } from "../agents/monitorAgent";
import { runSignificanceScorer } from "../agents/significanceScorer";
import { runScriptAgent } from "../agents/scriptAgent";
import type { ScoredFlag, SegmentType, UrgencyLevel } from "../lib/types";
import { MONITOR_INTERVAL_HOURS } from "../lib/constants";

// ─── Production Queue (Section 7, 10) ────────────────────────────────────────
// BullMQ queue with urgency tiers. Schedules Monitor Agent runs per race tier.

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

function getRedisConnectionOpts() {
  const url = new URL(REDIS_URL);
  return {
    host: url.hostname,
    port: Number(url.port) || 6379,
    maxRetriesPerRequest: null,
  };
}

// ── Queue definitions
export const monitorQueue = new Queue("monitor-agent", {
  connection: getRedisConnectionOpts(),
});

export const scriptQueue = new Queue("script-agent", {
  connection: getRedisConnectionOpts(),
});

// ── Job types
interface MonitorJobData {
  raceId: string;
}

interface ScriptJobData {
  raceId: string;
  developments: ScoredFlag[];
  segmentType: SegmentType;
  urgency: UrgencyLevel;
}

/**
 * Schedule monitor jobs for all races based on their tier.
 * Called by a daily cron job after tier recalculation.
 */
export async function scheduleMonitorJobs(): Promise<void> {
  const races = await prisma.race.findMany({
    select: { raceId: true, coverageTier: true },
  });

  for (const race of races) {
    const intervalHours = MONITOR_INTERVAL_HOURS[race.coverageTier] ?? 24;

    await monitorQueue.add(
      `monitor:${race.raceId}`,
      { raceId: race.raceId } satisfies MonitorJobData,
      {
        repeat: {
          every: intervalHours * 60 * 60 * 1000,
        },
        jobId: `monitor:${race.raceId}`,
      }
    );
  }

  console.log(`[queue] Scheduled monitor jobs for ${races.length} races`);
}

/**
 * Add a script job to the production queue after significance scoring.
 */
export async function enqueueScriptJob(data: ScriptJobData): Promise<void> {
  const priority = data.urgency === "BREAKING" ? 1 : data.urgency === "DAILY_BATCH" ? 5 : 10;

  await scriptQueue.add(`script:${data.raceId}`, data, { priority });
  console.log(`[queue] Enqueued script job for ${data.raceId} (${data.urgency})`);
}

/**
 * Determine the segment type based on urgency and tier.
 */
function determineSegmentType(urgency: UrgencyLevel, tier: number): SegmentType {
  if (urgency === "BREAKING") return "BREAKING_UPDATE";
  if (tier <= 2) return "DEEP_DIVE";
  if (tier <= 3) return "WHIP_AROUND_BRIEF";
  return "MACRO_MENTION";
}

/**
 * Determine urgency level from scored flags.
 */
function determineUrgency(flags: ScoredFlag[]): UrgencyLevel {
  if (flags.some((f) => f.status === "BREAKING")) return "BREAKING";
  if (flags.some((f) => f.status === "QUEUE_NOW")) return "DAILY_BATCH";
  return "WEEKLY_BATCH";
}

// ─── Workers ─────────────────────────────────────────────────────────────────

/**
 * Create and start the Monitor Agent worker.
 * Processes monitor jobs: runs Monitor Agent → Significance Scorer → enqueues script jobs.
 */
export function startMonitorWorker(): Worker {
  const worker = new Worker<MonitorJobData>(
    "monitor-agent",
    async (job: Job<MonitorJobData>) => {
      const { raceId } = job.data;
      console.log(`[monitor-worker] Processing ${raceId}`);

      const race = await prisma.race.findUnique({ where: { raceId } });
      if (!race) {
        console.warn(`[monitor-worker] Race not found: ${raceId}`);
        return;
      }

      // Stub: in production, this would call the news data client
      const recentNews: { headline: string; source: string; url: string; published_at: string }[] = [];

      const flags = await runMonitorAgent({ race, recentNews });
      if (flags.length === 0) {
        console.log(`[monitor-worker] No new developments for ${raceId}`);
        return;
      }

      const scoredFlags = await runSignificanceScorer({ flags, race });
      const actionableFlags = scoredFlags.filter((f) => f.status !== "ARCHIVE");

      if (actionableFlags.length === 0) {
        console.log(`[monitor-worker] All flags archived for ${raceId}`);
        return;
      }

      // Update race pending news queue with archived items for context
      const archivedFlags = scoredFlags.filter((f) => f.status === "ARCHIVE");
      if (archivedFlags.length > 0) {
        const existingQueue = (race.pendingNewsQueue as object[]) ?? [];
        await prisma.race.update({
          where: { raceId },
          data: {
            pendingNewsQueue: [
              ...existingQueue,
              ...archivedFlags.map((f) => ({
                headline: f.headline,
                source: f.source,
                url: f.url,
                flagged_at: new Date().toISOString(),
                significance_score: f.significance_estimate,
              })),
            ],
          },
        });
      }

      // Enqueue script job for actionable flags
      const urgency = determineUrgency(actionableFlags);
      const segmentType = determineSegmentType(urgency, race.coverageTier);

      await enqueueScriptJob({
        raceId,
        developments: actionableFlags,
        segmentType,
        urgency,
      });
    },
    { connection: getRedisConnectionOpts() }
  );

  worker.on("failed", (job, err) => {
    console.error(`[monitor-worker] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}

/**
 * Create and start the Script Agent worker.
 * Processes script jobs: runs Script Agent → writes to production_queue table.
 */
export function startScriptWorker(): Worker {
  const worker = new Worker<ScriptJobData>(
    "script-agent",
    async (job: Job<ScriptJobData>) => {
      const { raceId, developments, segmentType, urgency } = job.data;
      console.log(`[script-worker] Generating script for ${raceId} (${segmentType})`);

      const race = await prisma.race.findUnique({ where: { raceId } });
      if (!race) {
        console.warn(`[script-worker] Race not found: ${raceId}`);
        return;
      }

      const draft = await runScriptAgent({ race, developments, segmentType });

      await prisma.productionQueue.create({
        data: {
          raceId,
          urgency,
          segmentType: draft.segment_type,
          scriptDraft: draft.script_text,
          estimatedDurationSec: draft.estimated_duration_sec,
          triggeringEvents: developments as object[],
          status: "PENDING",
        },
      });

      console.log(`[script-worker] Script created for ${raceId} (${draft.estimated_duration_sec}s)`);
    },
    { connection: getRedisConnectionOpts() }
  );

  worker.on("failed", (job, err) => {
    console.error(`[script-worker] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}
