import { notFound } from "next/navigation";
import { SENATE_RACES } from "@/lib/mockData";
import { raceStatusLabel, raceStatusColor, formatMoney, partyColor } from "@/lib/utils";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ state: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await params;
  const race = SENATE_RACES.find((r) => r.stateAbbr.toLowerCase() === state);
  if (!race) return { title: "Race Not Found" };
  return { title: `${race.state} Senate 2026 — ElectionGorilla` };
}

export default async function SenateStatePage({ params }: Props) {
  const { state } = await params;
  const race = SENATE_RACES.find((r) => r.stateAbbr.toLowerCase() === state);
  if (!race) notFound();

  const totalVotes = race.candidates.reduce((s, c) => s + (c.votes ?? 0), 0);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className={`text-sm font-bold px-2 py-1 rounded ${raceStatusColor(race.raceStatus)}`}>
            {raceStatusLabel(race.raceStatus)}
          </span>
          {race.trending && race.trending !== "none" && (
            <span className={`text-xs font-bold ${race.trending === "d" ? "text-blue-400" : "text-red-400"}`}>
              {race.trending === "d" ? "▲ DEM TRENDING" : "▲ REP TRENDING"}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-black text-white">{race.state} Senate Race 2026</h1>
        <p className="text-gray-400 mt-1">
          {race.reportingPrecincts} of {race.totalPrecincts} precincts reporting
          ({race.totalPrecincts > 0 ? Math.round((race.reportingPrecincts / race.totalPrecincts) * 100) : 0}%)
        </p>
      </div>

      {/* Candidate results */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-5">
        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Results</h2>
        {race.candidates.map((cand) => {
          const pct = cand.votePercent ?? (totalVotes > 0 ? ((cand.votes ?? 0) / totalVotes) * 100 : 0);
          return (
            <div key={cand.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: partyColor(cand.party) }}
                  />
                  <span className="text-white font-bold">{cand.name}</span>
                  <span className="text-gray-500 text-xs">{cand.party}{cand.incumbent ? " · INC" : ""}</span>
                </div>
                <div className="text-right">
                  <span className="text-white font-black text-lg">{pct > 0 ? `${pct.toFixed(1)}%` : "—"}</span>
                  {cand.votes ? <span className="text-gray-500 text-xs ml-2">{cand.votes.toLocaleString()} votes</span> : null}
                </div>
              </div>
              <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    background: partyColor(cand.party),
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Fundraising */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Fundraising</h2>
        <div className="grid grid-cols-2 gap-4">
          {race.candidates.map((cand) => (
            <div key={cand.id} className="space-y-2">
              <div className="text-white font-semibold text-sm">{cand.name}</div>
              <div>
                <div className="text-xs text-gray-500">Total Raised</div>
                <div className="text-green-400 font-black text-xl">
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
          ))}
        </div>
      </div>

      {/* Precinct status */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-6">
        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">Precinct Reporting</h2>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-4 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{
                width: `${race.totalPrecincts > 0 ? (race.reportingPrecincts / race.totalPrecincts) * 100 : 0}%`,
              }}
            />
          </div>
          <span className="text-gray-300 text-sm font-bold whitespace-nowrap">
            {race.reportingPrecincts}/{race.totalPrecincts} precincts
          </span>
        </div>
        <p className="text-gray-600 text-xs mt-3">
          Per-precinct breakdown available once reporting begins. Data refreshes every 60 seconds.
        </p>
      </div>
    </div>
  );
}
