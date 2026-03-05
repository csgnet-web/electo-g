import { prisma } from "../db/client";
import type { QueueItemStatus, UrgencyLevel } from "../lib/types";

// ─── Approval Workflow (Section 7.2, 7.3) ────────────────────────────────────
// Routes production queue items by urgency. Provides approval/reject/edit actions.

export type RejectionReason =
  | "factually_wrong"
  | "tone_off"
  | "timing_not_right"
  | "needs_more_context";

/**
 * Get pending queue items grouped by urgency tier.
 */
export async function getQueueOverview() {
  const [breaking, daily, weekly] = await Promise.all([
    prisma.productionQueue.findMany({
      where: { urgency: "BREAKING", status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: { race: { select: { raceId: true, state: true, raceType: true, coverageTier: true } } },
    }),
    prisma.productionQueue.findMany({
      where: { urgency: "DAILY_BATCH", status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: { race: { select: { raceId: true, state: true, raceType: true, coverageTier: true } } },
    }),
    prisma.productionQueue.findMany({
      where: { urgency: "WEEKLY_BATCH", status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: { race: { select: { raceId: true, state: true, raceType: true, coverageTier: true } } },
    }),
  ]);

  const totalDurationSec = [...breaking, ...daily, ...weekly].reduce(
    (sum, item) => sum + item.estimatedDurationSec,
    0
  );

  return {
    breaking,
    daily,
    weekly,
    counts: {
      breaking: breaking.length,
      daily: daily.length,
      weekly: weekly.length,
      total: breaking.length + daily.length + weekly.length,
    },
    estimatedTotalRecordingTimeSec: totalDurationSec,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Approve a script. Optionally with edits (becomes EDITED_APPROVED).
 */
export async function approveScript(
  queueItemId: string,
  editedScript?: string,
  operatorNotes?: string
) {
  const status: QueueItemStatus = editedScript ? "EDITED_APPROVED" : "APPROVED";

  const updated = await prisma.productionQueue.update({
    where: { id: queueItemId },
    data: {
      status,
      approvedAt: new Date(),
      ...(editedScript && { scriptDraft: editedScript }),
      ...(operatorNotes && { operatorNotes }),
    },
  });

  // Update the race's last coverage info
  await prisma.race.update({
    where: { raceId: updated.raceId },
    data: {
      lastCoveredAt: new Date(),
      daysSinceCovered: 0,
      lastScriptSummary: (editedScript ?? updated.scriptDraft).slice(0, 500),
    },
  });

  return updated;
}

/**
 * Reject a script with a categorized reason.
 * Each reason maps to a different Script Agent re-prompt strategy.
 */
export async function rejectScript(
  queueItemId: string,
  reason: RejectionReason,
  operatorNotes?: string
) {
  return prisma.productionQueue.update({
    where: { id: queueItemId },
    data: {
      status: "REJECTED",
      operatorNotes: `[${reason}] ${operatorNotes ?? ""}`.trim(),
    },
  });
}

/**
 * Mark a script as recorded with its audio URL.
 */
export async function markRecorded(queueItemId: string, audioUrl: string) {
  return prisma.productionQueue.update({
    where: { id: queueItemId },
    data: {
      status: "RECORDED",
      recordedAudioUrl: audioUrl,
    },
  });
}

/**
 * Mark a script as aired.
 */
export async function markAired(queueItemId: string) {
  return prisma.productionQueue.update({
    where: { id: queueItemId },
    data: {
      status: "AIRED",
      airedAt: new Date(),
    },
  });
}

/**
 * Send operator notification for BREAKING items.
 * Uses the OPERATOR_NOTIFICATION_WEBHOOK env var.
 */
export async function notifyOperatorBreaking(raceId: string, headline: string): Promise<void> {
  const webhookUrl = process.env.OPERATOR_NOTIFICATION_WEBHOOK;
  if (!webhookUrl) {
    console.warn("[approval] No OPERATOR_NOTIFICATION_WEBHOOK configured — skipping notification");
    return;
  }

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `🚨 BREAKING — ${raceId}: ${headline}\nDashboard: ${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/queue`,
      }),
    });
  } catch (error) {
    console.error("[approval] Failed to send breaking notification:", error);
  }
}
