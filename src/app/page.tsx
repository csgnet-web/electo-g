import SeatCounter from "@/components/SeatCounter";
import RaceCard from "@/components/RaceCard";
import AICommentaryFeed from "@/components/AICommentaryFeed";
import SocialFeed from "@/components/SocialFeed";
import LiveStreamPanel from "@/components/LiveStreamPanel";
import { NATIONAL_OVERVIEW, HOUSE_RACES, SENATE_RACES, SOCIAL_SIGNALS, AI_COMMENTARY } from "@/lib/mockData";

export const dynamic = "force-dynamic";

export default function Home() {
  const keyRaces = [
    ...HOUSE_RACES.filter((r) => r.raceStatus === "toss-up"),
    ...SENATE_RACES.filter((r) => r.raceStatus === "toss-up"),
  ].slice(0, 6);

  return (
    <div className="space-y-8">
      {/* Hero: Stream + sidebar */}
      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <LiveStreamPanel commentary={AI_COMMENTARY} />
        </div>
        <div className="space-y-4">
          <SeatCounter data={NATIONAL_OVERVIEW} chamber="senate" />
          <SeatCounter data={NATIONAL_OVERVIEW} chamber="house" />
        </div>
      </section>

      {/* AI Commentary */}
      <section>
        <AICommentaryFeed items={AI_COMMENTARY} />
      </section>

      {/* Key Races */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-white uppercase tracking-wide">
            🔥 Key Races to Watch
          </h2>
          <a href="/races" className="text-green-400 text-sm hover:text-green-300 transition-colors">
            All 435 House + 33 Senate races →
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {keyRaces.map((race) => {
            const isDistrict = "districtNumber" in race;
            const href = isDistrict
              ? `/races/${race.stateAbbr.toLowerCase()}/${race.id}`
              : `/senate/${race.stateAbbr.toLowerCase()}`;
            return <RaceCard key={race.id} race={race} href={href} />;
          })}
        </div>
      </section>

      {/* Two-column: social + senate */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Social Pulse</h2>
          <SocialFeed signals={SOCIAL_SIGNALS} />
        </div>
        <div>
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Senate Battleground</h2>
          <div className="space-y-3">
            {SENATE_RACES.map((race) => (
              <RaceCard key={race.id} race={race} href={`/senate/${race.stateAbbr.toLowerCase()}`} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
