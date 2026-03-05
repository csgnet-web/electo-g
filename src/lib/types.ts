// ─── JSONB Sub-Schema TypeScript Interfaces ─────────────────────────────────
// These mirror the JSONB columns in the Prisma Race Object schema.
// See spec Section 4.

// ── Section 4.2: Candidate Array Entry
export type CandidateStatus =
  | "DECLARED"
  | "WITHDRAWN"
  | "PRIMARY_WINNER"
  | "GENERAL_WINNER"
  | "LOST";

export type CandidateParty = "DEMOCRAT" | "REPUBLICAN" | "INDEPENDENT" | "OTHER";

export interface Candidate {
  candidate_id: string;
  full_name: string;
  party: CandidateParty;
  fec_candidate_id: string;
  declared_date: string; // ISO 8601
  website: string;
  status: CandidateStatus;
}

// ── Section 4.3: Fundraising by Candidate
export interface CandidateFundraising {
  candidate_id: string;
  total_raised: number;
  total_spent: number;
  cash_on_hand: number;
  last_filing_date: string; // ISO 8601
}

// ── Section 4.3: Outside Spending
export interface OutsideSpending {
  total_for_dem: number;
  total_for_rep: number;
  total_against_dem: number;
  total_against_rep: number;
  top_spenders: {
    name: string;
    amount: number;
    supporting: CandidateParty;
  }[];
}

// ── Section 4.4: Polling Average Entry
export interface PollingAverage {
  candidate_id: string;
  candidate_name: string;
  average_pct: number;
  as_of_date: string; // ISO 8601
}

// ── Section 4.4: Raw Poll Entry
export interface RawPoll {
  pollster: string;
  date: string; // ISO 8601
  sample_size: number;
  margin_of_error: number;
  results: {
    candidate_id: string;
    pct: number;
  }[];
  url: string;
}

// ── Section 4.5: Pending News Queue Item
export interface PendingNewsItem {
  headline: string;
  source: string;
  url: string;
  flagged_at: string; // ISO 8601
  significance_score: number; // 0.0 – 1.0
}

// ── Section 4.5: Approved Script
export interface ApprovedScript {
  script_id: string;
  segment_type: SegmentType;
  script_text: string;
  approved_at: string; // ISO 8601
  aired_at?: string;
  duration_sec: number;
}

// ── Section 4.6: BOGS Signal
export interface BogsSignal {
  type: "sign_sighting" | "canvassing_report" | "local_tip" | "event_report";
  location: {
    lat: number;
    lng: number;
    description: string;
  };
  content: string;
  submitted_at: string; // ISO 8601
  verified: boolean;
}

// ── Section 4.7: Endorsement
export type EndorserType =
  | "PRESIDENT"
  | "SENATOR"
  | "GOVERNOR"
  | "FORMER_OFFICIAL"
  | "MAJOR_UNION"
  | "MAJOR_NEWSPAPER"
  | "CELEBRITY"
  | "LOCAL_OFFICIAL";

export interface Endorsement {
  endorser_name: string;
  endorser_type: EndorserType;
  endorser_weight: number; // 1–10
  candidate_id: string;
  date: string; // ISO 8601
  source_url: string;
}

// ── Census District Data
export interface CensusDistrictData {
  population: number;
  median_income: number;
  college_pct: number;
  white_pct: number;
  black_pct: number;
  hispanic_pct: number;
  asian_pct: number;
  urban_pct: number;
  rural_pct: number;
}

// ── Section 6: Agent Output Types

export interface MonitorAgentFlag {
  headline: string;
  source: string;
  url: string;
  significance_estimate: number; // 0.0 – 1.0
  reason: string;
}

export type SignificanceStatus = "BREAKING" | "QUEUE_NOW" | "ARCHIVE";

export interface ScoredFlag extends MonitorAgentFlag {
  status: SignificanceStatus;
}

// ── Section 7.1: Segment & Queue Types

export type SegmentType =
  | "WHIP_AROUND_BRIEF"
  | "DEEP_DIVE"
  | "MACRO_MENTION"
  | "BREAKING_UPDATE"
  | "MACRO_ANALYSIS";

export type UrgencyLevel = "BREAKING" | "DAILY_BATCH" | "WEEKLY_BATCH";

export type QueueItemStatus =
  | "PENDING"
  | "APPROVED"
  | "EDITED_APPROVED"
  | "REJECTED"
  | "RECORDED"
  | "AIRED";

// ── Section 6.3: Script Agent Output
export interface ScriptDraft {
  segment_type: SegmentType;
  estimated_duration_sec: number;
  key_data_points: string[];
  suggested_visual_overlays: string[];
  script_text: string;
}

// ── Section 8: Stream Schedule Types

export type BlockType =
  | "WHIP_AROUND"
  | "DEEP_DIVE"
  | "MACRO_ANALYSIS"
  | "BREAKING_NEWS"
  | "DOWN_BALLOT_DISCOVERY";

export interface ContentPackage {
  package_id: string;
  race_id: string;
  segment_type: SegmentType;
  script_text: string;
  audio_url: string;
  duration_sec: number;
  approved_at: string;
}

export interface StreamBlock {
  block_type: BlockType;
  race_id?: string;
  package_id: string;
  estimated_start: string; // ISO 8601
  estimated_duration_sec: number;
}

export interface StreamSchedule {
  generated_at: string;
  current_block: {
    type: BlockType;
    started_at: string;
    packages: ContentPackage[];
  } | null;
  queue: StreamBlock[];
}
