import { getReadyPackages } from "../pipeline/contentPackager";
import { assembleSchedule } from "./blockBuilder";
import type { StreamSchedule } from "../lib/types";

// ─── Stream Scheduler (Section 8) ────────────────────────────────────────────
// Runs continuously. Assembles programming blocks from approved, recorded
// Content Packages. Outputs a JSON schedule that updates every 15 minutes.
// OBS browser source reads GET /api/stream/schedule.

/**
 * Generate the current stream schedule.
 * Called by the /api/stream/schedule endpoint.
 */
export async function generateStreamSchedule(): Promise<StreamSchedule> {
  const packages = await getReadyPackages();
  const blocks = assembleSchedule(packages);

  const currentBlock = blocks.length > 0
    ? {
        type: blocks[0].block_type,
        started_at: blocks[0].estimated_start,
        packages: packages.filter((p) => p.package_id === blocks[0].package_id),
      }
    : null;

  return {
    generated_at: new Date().toISOString(),
    current_block: currentBlock,
    queue: blocks.slice(1),
  };
}
