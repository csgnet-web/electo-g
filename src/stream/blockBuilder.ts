import type { ContentPackage, StreamBlock, BlockType } from "../lib/types";

// ─── Block Builder (Section 8.1) ─────────────────────────────────────────────
// Assembles programming blocks from approved, recorded Content Packages.

/**
 * Build a Daily Whip-Around block.
 * Top 15-20 races by tier. Pull most recent WHIP_AROUND_BRIEF per race.
 * Flagship segment, 20-30 min total.
 */
export function buildWhipAroundBlock(
  packages: ContentPackage[],
  startTime: Date
): StreamBlock[] {
  const whipAroundPackages = packages
    .filter((p) => p.segment_type === "WHIP_AROUND_BRIEF")
    .slice(0, 20);

  let currentTime = new Date(startTime);

  return whipAroundPackages.map((pkg) => {
    const block: StreamBlock = {
      block_type: "WHIP_AROUND",
      race_id: pkg.race_id,
      package_id: pkg.package_id,
      estimated_start: currentTime.toISOString(),
      estimated_duration_sec: pkg.duration_sec,
    };
    currentTime = new Date(currentTime.getTime() + pkg.duration_sec * 1000);
    return block;
  });
}

/**
 * Build a Deep Dive block.
 * Select race most overdue relative to its target frequency.
 * 8-15 min per segment.
 */
export function buildDeepDiveBlock(
  packages: ContentPackage[],
  startTime: Date
): StreamBlock | null {
  const deepDive = packages.find((p) => p.segment_type === "DEEP_DIVE");
  if (!deepDive) return null;

  return {
    block_type: "DEEP_DIVE",
    race_id: deepDive.race_id,
    package_id: deepDive.package_id,
    estimated_start: startTime.toISOString(),
    estimated_duration_sec: deepDive.duration_sec,
  };
}

/**
 * Build a Macro Analysis block.
 * Context Agent packages, re-surfaced on decay schedule.
 */
export function buildMacroAnalysisBlock(
  packages: ContentPackage[],
  startTime: Date
): StreamBlock | null {
  const macro = packages.find((p) => p.segment_type === "MACRO_ANALYSIS");
  if (!macro) return null;

  return {
    block_type: "MACRO_ANALYSIS",
    package_id: macro.package_id,
    estimated_start: startTime.toISOString(),
    estimated_duration_sec: macro.duration_sec,
  };
}

/**
 * Build a Breaking News Interrupt block.
 * Bypasses rotation, surfaces immediately.
 */
export function buildBreakingBlock(
  pkg: ContentPackage,
  startTime: Date
): StreamBlock {
  return {
    block_type: "BREAKING_NEWS",
    race_id: pkg.race_id,
    package_id: pkg.package_id,
    estimated_start: startTime.toISOString(),
    estimated_duration_sec: pkg.duration_sec,
  };
}

/**
 * Build Down-Ballot Discovery filler blocks.
 * Tier 4-5 MACRO_MENTION packages fill gaps between main blocks.
 */
export function buildDownBallotBlocks(
  packages: ContentPackage[],
  startTime: Date
): StreamBlock[] {
  const mentions = packages.filter((p) => p.segment_type === "MACRO_MENTION");
  let currentTime = new Date(startTime);

  return mentions.map((pkg) => {
    const block: StreamBlock = {
      block_type: "DOWN_BALLOT_DISCOVERY",
      race_id: pkg.race_id,
      package_id: pkg.package_id,
      estimated_start: currentTime.toISOString(),
      estimated_duration_sec: pkg.duration_sec,
    };
    currentTime = new Date(currentTime.getTime() + pkg.duration_sec * 1000);
    return block;
  });
}

/**
 * Assemble a full programming schedule from available content packages.
 * Returns an ordered array of stream blocks.
 */
export function assembleSchedule(packages: ContentPackage[]): StreamBlock[] {
  const now = new Date();
  const schedule: StreamBlock[] = [];
  let currentTime = new Date(now);

  // Check for breaking content first — always surfaces immediately
  const breakingPkgs = packages.filter(
    (p) => p.segment_type === "BREAKING_UPDATE"
  );
  for (const pkg of breakingPkgs) {
    const block = buildBreakingBlock(pkg, currentTime);
    schedule.push(block);
    currentTime = new Date(currentTime.getTime() + pkg.duration_sec * 1000);
  }

  // Daily Whip-Around
  const whipArounds = buildWhipAroundBlock(packages, currentTime);
  for (const block of whipArounds) {
    schedule.push(block);
    currentTime = new Date(currentTime.getTime() + block.estimated_duration_sec * 1000);
  }

  // Deep Dive rotation (4-6 per day)
  const deepDivePackages = packages.filter((p) => p.segment_type === "DEEP_DIVE");
  for (const pkg of deepDivePackages.slice(0, 6)) {
    schedule.push({
      block_type: "DEEP_DIVE",
      race_id: pkg.race_id,
      package_id: pkg.package_id,
      estimated_start: currentTime.toISOString(),
      estimated_duration_sec: pkg.duration_sec,
    });
    currentTime = new Date(currentTime.getTime() + pkg.duration_sec * 1000);

    // Interleave down-ballot filler
    const fillers = buildDownBallotBlocks(packages.filter((p) => p.segment_type === "MACRO_MENTION"), currentTime);
    if (fillers.length > 0) {
      const filler = fillers[0];
      schedule.push(filler);
      currentTime = new Date(currentTime.getTime() + filler.estimated_duration_sec * 1000);
    }
  }

  // Macro Analysis (2-3 per day)
  const macroPkgs = packages.filter((p) => p.segment_type === "MACRO_ANALYSIS");
  for (const pkg of macroPkgs.slice(0, 3)) {
    schedule.push({
      block_type: "MACRO_ANALYSIS",
      package_id: pkg.package_id,
      race_id: pkg.race_id,
      estimated_start: currentTime.toISOString(),
      estimated_duration_sec: pkg.duration_sec,
    });
    currentTime = new Date(currentTime.getTime() + pkg.duration_sec * 1000);
  }

  return schedule;
}
