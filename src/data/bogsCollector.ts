import { prisma } from "../db/client";
import type { BogsSignal } from "../lib/types";

// ─── Boots-on-Ground Signal Collection (Section 4.6, 9) ─────────────────────
// Collects geotagged signs, canvassing logs, local tips.
// Stored in bogs_submissions table from day one even before token rewards are live.

export interface BogsSubmissionInput {
  raceId: string;
  type: "SIGN_PHOTO" | "CANVASSING_LOG" | "LOCAL_TIP" | "EVENT_REPORT" | "OTHER";
  content: string;
  mediaUrl?: string;
  location?: { lat: number; lng: number; description: string };
  submitterWallet?: string;
}

/**
 * Submit a boots-on-the-ground signal.
 */
export async function submitBogsSignal(input: BogsSubmissionInput) {
  return prisma.bogsSubmission.create({
    data: {
      raceId: input.raceId,
      submissionType: input.type,
      content: input.content,
      mediaUrl: input.mediaUrl,
      location: input.location ?? undefined,
      submitterWallet: input.submitterWallet,
    },
  });
}

/**
 * Get unverified BOGS submissions for review.
 */
export async function getUnverifiedSubmissions(limit: number = 50) {
  return prisma.bogsSubmission.findMany({
    where: { verified: false },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

/**
 * Verify a BOGS submission and optionally update the Race Object's bogs_signals.
 */
export async function verifySubmission(submissionId: string) {
  const submission = await prisma.bogsSubmission.update({
    where: { id: submissionId },
    data: { verified: true },
  });

  // Add to the race's bogs_signals JSONB array
  const race = await prisma.race.findUnique({
    where: { raceId: submission.raceId },
  });

  if (race) {
    const existingSignals = (race.bogsSignals as unknown as BogsSignal[]) ?? [];
    const newSignal: BogsSignal = {
      type: submission.submissionType.toLowerCase() as BogsSignal["type"],
      location: (submission.location as BogsSignal["location"]) ?? {
        lat: 0,
        lng: 0,
        description: "Unknown",
      },
      content: submission.content,
      submitted_at: submission.createdAt.toISOString(),
      verified: true,
    };

    await prisma.race.update({
      where: { raceId: submission.raceId },
      data: { bogsSignals: [...existingSignals, newSignal] as unknown as object[] },
    });
  }

  return submission;
}
