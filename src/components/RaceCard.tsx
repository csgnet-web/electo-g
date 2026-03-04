"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import type { District, SenateRace } from "@/types/election";
import { raceStatusLabel, raceStatusColor, formatMoney, partyText } from "@/lib/utils";

type Race = District | SenateRace;

function isDistrict(r: Race): r is District {
  return "districtNumber" in r;
}

interface RaceCardProps {
  race: Race;
  href: string;
}

export default function RaceCard({ race, href }: RaceCardProps) {
  const title = isDistrict(race)
    ? `${race.stateAbbr}-${race.districtNumber === 0 ? "AL" : race.districtNumber}`
    : `${race.stateAbbr} Senate`;

  const reportingPct =
    race.totalPrecincts > 0
      ? Math.round((race.reportingPrecincts / race.totalPrecincts) * 100)
      : 0;

  const [cand1, cand2] = race.candidates;

  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
        className="bg-gray-900 border border-gray-700 hover:border-gray-500 rounded-xl p-4 cursor-pointer group"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <span className="text-white font-black text-lg">{title}</span>
            {race.trending && race.trending !== "none" && (
              <span className={`ml-2 text-xs font-bold ${race.trending === "d" ? "text-blue-400" : "text-red-400"}`}>
                {race.trending === "d" ? "▲ DEM TRENDING" : "▲ REP TRENDING"}
              </span>
            )}
          </div>
          <span className={`text-xs font-bold px-2 py-1 rounded ${raceStatusColor(race.raceStatus)}`}>
            {raceStatusLabel(race.raceStatus)}
          </span>
        </div>

        {/* Candidates */}
        <div className="space-y-2 mb-3">
          {[cand1, cand2].filter(Boolean).map((cand) => (
            <div key={cand.id} className="flex items-center gap-2">
              <div className={`w-1.5 h-8 rounded-full ${cand.party === "D" ? "bg-blue-500" : cand.party === "R" ? "bg-red-500" : "bg-purple-500"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <span className="text-white text-sm font-semibold truncate">{cand.name}</span>
                  <span className={`text-sm font-black ml-2 ${partyText(cand.party)}`}>
                    {cand.votePercent != null && cand.votePercent > 0 ? `${cand.votePercent.toFixed(1)}%` : "–"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">{cand.party}{cand.incumbent ? " · INC" : ""}</span>
                  {cand.fundsRaised && (
                    <span className="text-xs text-gray-600">{formatMoney(cand.fundsRaised)} raised</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Vote bar (only if votes reported) */}
        {cand1?.votePercent && cand2?.votePercent && cand1.votePercent > 0 && (
          <div className="flex h-2 rounded-full overflow-hidden bg-gray-700 mb-2">
            <div className="bg-blue-600" style={{ width: `${cand1.party === "D" ? cand1.votePercent : cand2.votePercent}%` }} />
            <div className="bg-red-600" style={{ width: `${cand1.party === "R" ? cand1.votePercent : cand2.votePercent}%` }} />
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center text-xs text-gray-500 mt-2">
          <span>{reportingPct}% precincts reporting</span>
          <span className="text-gray-600 group-hover:text-gray-400 transition-colors">View details →</span>
        </div>
      </motion.div>
    </Link>
  );
}
