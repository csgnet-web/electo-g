import { notFound } from "next/navigation";
import { HOUSE_RACES } from "@/lib/mockData";
import { raceStatusLabel, raceStatusColor, formatMoney, partyColor, formatNumber } from "@/lib/utils";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ state: string; raceId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { raceId } = await params;
  const race = HOUSE_RACES.find((r) => r.id === raceId);
  if (!race) return { title: "Race Not Found" };
  return { title: `${race.name} House Race 2026 — ElectionGorilla` };
}

export default async function HouseRaceDetailPage({ params }: Props) {
  const { raceId } = await params;
  const race = HOUSE_RACES.find((r) => r.id === raceId);
  if (!race) notFound();

  const totalVotes = race.candidates.reduce((s, c) => s + (c.votes ?? 0), 0);
  const reportingPct =
    race.totalPrecincts > 0
      ? Math.round((race.reportingPrecincts / race.totalPrecincts) * 100)
      : 0;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <a href="/house" className="text-gray-500 text-sm hover:text-gray-300">← House Races</a>
          <span className="text-gray-700">·</span>
          <span className={`text-sm font-bold px-2 py-1 rounded ${raceStatusColor(race.raceStatus)}`}>
            {raceStatusLabel(race.raceStatus)}
          </span>
          {race.trending && race.trending !== "none" && (
            <span className={`text-xs font-bold ${race.trending === "d" ? "text-blue-400" : "text-red-400"}`}>
              {race.trending === "d" ? "▲ DEM TRENDING" : "▲ REP TRENDING"}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-black text-white">
          {race.state} Congressional District {race.districtNumber === 0 ? "At-Large" : race.districtNumber}
        </h1>
        <p className="text-gray-400 mt-1">
          {reportingPct}% precincts reporting ({race.reportingPrecincts} of {race.totalPrecincts})
        </p>
      </div>

      {/* Results */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-5">
        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Results</h2>
        {race.candidates.map((cand) => {
          const pct = cand.votePercent ?? (totalVotes > 0 ? ((cand.votes ?? 0) / totalVotes) * 100 : 0);
          const leading = race.candidates.reduce((a, b) =>
            (b.votePercent ?? 0) > (a.votePercent ?? 0) ? b : a
          );
          const isLeading = cand.id === leading.id && pct > 0;
          return (
            <div key={cand.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: partyColor(cand.party) }}
                  />
                  <div>
                    <span className="text-white font-bold">{cand.name}</span>
                    {isLeading && <span className="ml-2 text-xs bg-green-900/50 text-green-400 px-1.5 rounded">LEADING</span>}
                    <div className="text-gray-500 text-xs">{cand.party}{cand.incumbent ? " · Incumbent" : " · Challenger"}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white font-black text-xl">{pct > 0 ? `${pct.toFixed(1)}%` : "—"}</div>
                  {(cand.votes ?? 0) > 0 && (
                    <div className="text-gray-500 text-xs">{formatNumber(cand.votes ?? 0)} votes</div>
                  )}
                </div>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: partyColor(cand.party) }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Fundraising */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Fundraising</h2>
        <div className="grid grid-cols-2 gap-6">
          {race.candidates.map((cand) => (
            <div key={cand.id}>
              <div
                className="text-sm font-bold mb-2"
                style={{ color: partyColor(cand.party) }}
              >
                {cand.name}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500">Total Raised</div>
                  <div className="text-green-400 font-black text-lg">
                    {cand.fundsRaised ? formatMoney(cand.fundsRaised) : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Cash on Hand</div>
                  <div className="text-gray-200 font-bold">
                    {cand.cashOnHand ? formatMoney(cand.cashOnHand) : "—"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Precinct tracker */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Precinct Reporting</h2>
          <span className="text-xs text-gray-600">Updates every 60s</span>
        </div>
        <div className="flex items-center gap-4 mb-2">
          <div className="flex-1 h-4 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${reportingPct}%` }}
            />
          </div>
          <span className="text-sm font-bold text-gray-300 whitespace-nowrap">
            {reportingPct}%
          </span>
        </div>
        <p className="text-gray-600 text-xs">
          {race.totalPrecincts.toLocaleString()} total precincts in {race.name}.
          Per-precinct breakdown appears here as results come in.
        </p>
      </div>

      {/* Precinct table placeholder */}
      {race.precincts.length > 0 ? (
        <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="text-left px-4 py-2 text-gray-400 font-bold text-xs uppercase">Precinct</th>
                <th className="text-left px-4 py-2 text-gray-400 font-bold text-xs uppercase">County</th>
                <th className="text-right px-4 py-2 text-gray-400 font-bold text-xs uppercase">Total Votes</th>
                <th className="text-right px-4 py-2 text-gray-400 font-bold text-xs uppercase">Reporting</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {race.precincts.map((p) => (
                <tr key={p.precinctId} className="hover:bg-gray-800/50">
                  <td className="px-4 py-2 text-white font-medium">{p.precinctName}</td>
                  <td className="px-4 py-2 text-gray-400">{p.county}</td>
                  <td className="px-4 py-2 text-right text-gray-300">{formatNumber(p.totalVotes)}</td>
                  <td className="px-4 py-2 text-right text-green-400">{p.reportingPercent.toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-gray-900 border border-gray-700 border-dashed rounded-xl p-8 text-center">
          <p className="text-gray-500 text-sm">Precinct-level results will appear here when polls close and counting begins.</p>
        </div>
      )}
    </div>
  );
}
