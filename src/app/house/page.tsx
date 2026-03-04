import RaceCard from "@/components/RaceCard";
import SeatCounter from "@/components/SeatCounter";
import { HOUSE_RACES, NATIONAL_OVERVIEW } from "@/lib/mockData";
import { raceStatusLabel } from "@/lib/utils";
import type { RaceStatus } from "@/types/election";

const STATUS_ORDER: RaceStatus[] = [
  "toss-up", "lean-d", "lean-r", "likely-d", "likely-r", "safe-d", "safe-r",
];

export const metadata = {
  title: "House Races 2026 — ElectionGorilla",
};

export default function HousePage() {
  const grouped = STATUS_ORDER.reduce<Record<string, typeof HOUSE_RACES>>(
    (acc, status) => {
      const filtered = HOUSE_RACES.filter((r) => r.raceStatus === status);
      if (filtered.length > 0) acc[status] = filtered;
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">🏛️ U.S. House Races 2026</h1>
          <p className="text-gray-400 mt-1">
            All 435 House seats · Real-time precinct-level tracking
          </p>
        </div>
        <SeatCounter data={NATIONAL_OVERVIEW} chamber="house" />
      </div>

      {/* Race status legend */}
      <div className="flex flex-wrap gap-2">
        {STATUS_ORDER.map((s) => (
          <span
            key={s}
            className={`text-xs font-bold px-2 py-1 rounded ${
              s.includes("d") ? "bg-blue-900/60 text-blue-300" :
              s.includes("r") ? "bg-red-900/60 text-red-300" :
              "bg-yellow-900/60 text-yellow-300"
            }`}
          >
            {raceStatusLabel(s)}
          </span>
        ))}
      </div>

      {/* Grouped by competitiveness */}
      {Object.entries(grouped).map(([status, races]) => (
        <section key={status}>
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">
            {raceStatusLabel(status as RaceStatus)} ({races.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {races.map((race) => (
              <RaceCard
                key={race.id}
                race={race}
                href={`/races/${race.stateAbbr.toLowerCase()}/${race.id}`}
              />
            ))}
          </div>
        </section>
      ))}

      {/* Placeholder note */}
      <div className="bg-gray-900 border border-gray-700 border-dashed rounded-xl p-8 text-center">
        <p className="text-gray-500 text-sm">
          Showing competitive races. Full 435-seat tracker connects to live FEC & AP data feeds.
        </p>
        <p className="text-gray-600 text-xs mt-1">
          Per-precinct breakdowns available for every district.
        </p>
      </div>
    </div>
  );
}
