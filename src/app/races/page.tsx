import RaceCard from "@/components/RaceCard";
import { HOUSE_RACES, SENATE_RACES } from "@/lib/mockData";

export const metadata = {
  title: "All Races 2026 — ElectionGorilla",
};

export default function AllRacesPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-black text-white">All 2026 Races</h1>
        <p className="text-gray-400 mt-1">
          Every U.S. House and Senate race tracked in real time.
          Showing competitive races — full 435-seat House + 33-seat Senate coverage.
        </p>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-white">Senate Races</h2>
          <a href="/senate" className="text-green-400 text-sm hover:text-green-300">Senate tracker →</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {SENATE_RACES.map((r) => (
            <RaceCard key={r.id} race={r} href={`/senate/${r.stateAbbr.toLowerCase()}`} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-white">House Races</h2>
          <a href="/house" className="text-green-400 text-sm hover:text-green-300">House tracker →</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {HOUSE_RACES.map((r) => (
            <RaceCard
              key={r.id}
              race={r}
              href={`/races/${r.stateAbbr.toLowerCase()}/${r.id}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
