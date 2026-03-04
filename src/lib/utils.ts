import type { Party, RaceStatus } from "@/types/election";

export function partyColor(party: Party): string {
  switch (party) {
    case "D": return "#1e40af";
    case "R": return "#b91c1c";
    case "I": return "#6b21a8";
    case "L": return "#ca8a04";
    case "G": return "#15803d";
    default: return "#374151";
  }
}

export function partyBg(party: Party): string {
  switch (party) {
    case "D": return "bg-blue-700";
    case "R": return "bg-red-700";
    case "I": return "bg-purple-800";
    default: return "bg-gray-600";
  }
}

export function partyText(party: Party): string {
  switch (party) {
    case "D": return "text-blue-400";
    case "R": return "text-red-400";
    case "I": return "text-purple-400";
    default: return "text-gray-400";
  }
}

export function raceStatusLabel(status: RaceStatus): string {
  const labels: Record<RaceStatus, string> = {
    "safe-d": "Safe D",
    "likely-d": "Likely D",
    "lean-d": "Lean D",
    "toss-up": "Toss-Up",
    "lean-r": "Lean R",
    "likely-r": "Likely R",
    "safe-r": "Safe R",
  };
  return labels[status];
}

export function raceStatusColor(status: RaceStatus): string {
  switch (status) {
    case "safe-d": return "bg-blue-800 text-blue-100";
    case "likely-d": return "bg-blue-700 text-blue-100";
    case "lean-d": return "bg-blue-500 text-white";
    case "toss-up": return "bg-yellow-500 text-black";
    case "lean-r": return "bg-red-500 text-white";
    case "likely-r": return "bg-red-700 text-red-100";
    case "safe-r": return "bg-red-800 text-red-100";
    default: return "bg-gray-600 text-white";
  }
}

export function formatMoney(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount}`;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat().format(n);
}
