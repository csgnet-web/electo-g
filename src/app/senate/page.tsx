import RaceCard from "@/components/RaceCard";
import SeatCounter from "@/components/SeatCounter";
import { SENATE_RACES, NATIONAL_OVERVIEW } from "@/lib/mockData";

export const metadata = {
  title: "Senate Races 2026 — ElectionGorilla",
};

export default function SenatePage() {
  const tossups = SENATE_RACES.filter((r) => r.raceStatus === "toss-up");
  const leanD = SENATE_RACES.filter((r) => r.raceStatus === "lean-d");
  const leanR = SENATE_RACES.filter((r) => r.raceStatus === "lean-r");
  const other = SENATE_RACES.filter(
    (r) => !["toss-up", "lean-d", "lean-r"].includes(r.raceStatus)
  );

  const groups = [
    { label: "Toss-Up", races: tossups },
    { label: "Lean Democrat", races: leanD },
    { label: "Lean Republican", races: leanR },
    { label: "Other", races: other },
  ].filter((g) => g.races.length > 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white">🏛️ U.S. Senate Races 2026</h1>
          <p className="text-gray-400 mt-1">
            33 Senate seats up in 2026 · Class 2 & 3 seats
          </p>
        </div>
        <SeatCounter data={NATIONAL_OVERVIEW} chamber="senate" />
      </div>

      {groups.map(({ label, races }) => (
        <section key={label}>
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">
            {label} ({races.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {races.map((race) => (
              <RaceCard
                key={race.id}
                race={race}
                href={`/senate/${race.stateAbbr.toLowerCase()}`}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
