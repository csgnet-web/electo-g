import { prisma } from "../db/client";
import type { ContentPackage } from "../lib/types";

// ─── Content Packager (Section 7) ────────────────────────────────────────────
// Bundles approved scripts with audio recordings into Content Packages
// that the stream scheduler can consume.

/**
 * Get all recorded (ready-to-air) content packages.
 */
export async function getReadyPackages(): Promise<ContentPackage[]> {
  const items = await prisma.productionQueue.findMany({
    where: { status: "RECORDED" },
    orderBy: [
      { urgency: "asc" }, // BREAKING first
      { createdAt: "asc" },
    ],
  });

  return items.map((item) => ({
    package_id: item.id,
    race_id: item.raceId,
    segment_type: item.segmentType,
    script_text: item.scriptDraft,
    audio_url: item.recordedAudioUrl,
    duration_sec: item.estimatedDurationSec,
    approved_at: (item.approvedAt ?? item.createdAt).toISOString(),
  }));
}

/**
 * Get all aired content packages for a specific race.
 */
export async function getAiredPackagesForRace(raceId: string): Promise<ContentPackage[]> {
  const items = await prisma.productionQueue.findMany({
    where: { raceId, status: "AIRED" },
    orderBy: { airedAt: "desc" },
    take: 50,
  });

  return items.map((item) => ({
    package_id: item.id,
    race_id: item.raceId,
    segment_type: item.segmentType,
    script_text: item.scriptDraft,
    audio_url: item.recordedAudioUrl,
    duration_sec: item.estimatedDurationSec,
    approved_at: (item.approvedAt ?? item.createdAt).toISOString(),
  }));
}
