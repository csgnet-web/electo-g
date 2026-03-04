export type Party = "D" | "R" | "I" | "L" | "G";

export interface Candidate {
  id: string;
  name: string;
  party: Party;
  incumbent: boolean;
  imageUrl?: string;
  votes?: number;
  votePercent?: number;
  fundsRaised?: number;
  cashOnHand?: number;
}

export interface PrecinctResult {
  precinctId: string;
  precinctName: string;
  county: string;
  totalVotes: number;
  candidates: {
    candidateId: string;
    votes: number;
    percent: number;
  }[];
  reportingPercent: number;
}

export interface District {
  id: string;
  state: string;
  stateAbbr: string;
  districtNumber: number; // 0 = at-large
  chamber: "house" | "senate";
  name: string;
  candidates: Candidate[];
  precincts: PrecinctResult[];
  totalPrecincts: number;
  reportingPrecincts: number;
  raceStatus: "safe-d" | "likely-d" | "lean-d" | "toss-up" | "lean-r" | "likely-r" | "safe-r";
  trending?: "d" | "r" | "none";
  lastUpdated: string;
}

export interface SenateRace {
  id: string;
  state: string;
  stateAbbr: string;
  seatClass: 1 | 2 | 3;
  candidates: Candidate[];
  precincts: PrecinctResult[];
  totalPrecincts: number;
  reportingPrecincts: number;
  raceStatus: "safe-d" | "likely-d" | "lean-d" | "toss-up" | "lean-r" | "likely-r" | "safe-r";
  trending?: "d" | "r" | "none";
  lastUpdated: string;
}

export type RaceStatus = District["raceStatus"];

export interface NationalOverview {
  houseSeats: { d: number; r: number; i: number; uncalled: number };
  senateSeats: { d: number; r: number; i: number; uncalled: number };
  lastUpdated: string;
}

export interface SocialSignal {
  id: string;
  platform: "twitter" | "reddit" | "youtube";
  text: string;
  author: string;
  timestamp: string;
  sentiment: "positive" | "negative" | "neutral";
  districtId?: string;
}

export interface AICommentary {
  id: string;
  text: string;
  timestamp: string;
  topic: "race-call" | "trending" | "data-insight" | "breaking";
  relatedDistrictId?: string;
}
