import { HOUSE_RACES, SENATE_RACES } from "@/lib/mockData";
import { raceStatusColor, raceStatusLabel } from "@/lib/utils";

export const metadata = {
  title: "Race Map 2026 — ElectionGorilla",
};

const STATE_POSITIONS: Record<string, { x: number; y: number; label: string }> = {
  AL: { x: 620, y: 380, label: "AL" }, AK: { x: 160, y: 480, label: "AK" },
  AZ: { x: 200, y: 350, label: "AZ" }, AR: { x: 570, y: 350, label: "AR" },
  CA: { x: 100, y: 280, label: "CA" }, CO: { x: 300, y: 300, label: "CO" },
  CT: { x: 800, y: 210, label: "CT" }, DE: { x: 780, y: 260, label: "DE" },
  FL: { x: 680, y: 430, label: "FL" }, GA: { x: 660, y: 390, label: "GA" },
  HI: { x: 240, y: 490, label: "HI" }, ID: { x: 200, y: 180, label: "ID" },
  IL: { x: 590, y: 270, label: "IL" }, IN: { x: 620, y: 270, label: "IN" },
  IA: { x: 540, y: 240, label: "IA" }, KS: { x: 460, y: 310, label: "KS" },
  KY: { x: 640, y: 320, label: "KY" }, LA: { x: 570, y: 400, label: "LA" },
  ME: { x: 830, y: 160, label: "ME" }, MD: { x: 760, y: 270, label: "MD" },
  MA: { x: 820, y: 200, label: "MA" }, MI: { x: 620, y: 220, label: "MI" },
  MN: { x: 510, y: 180, label: "MN" }, MS: { x: 590, y: 390, label: "MS" },
  MO: { x: 545, y: 305, label: "MO" }, MT: { x: 270, y: 160, label: "MT" },
  NE: { x: 450, y: 260, label: "NE" }, NV: { x: 155, y: 260, label: "NV" },
  NH: { x: 810, y: 185, label: "NH" }, NJ: { x: 790, y: 250, label: "NJ" },
  NM: { x: 290, y: 370, label: "NM" }, NY: { x: 770, y: 210, label: "NY" },
  NC: { x: 700, y: 330, label: "NC" }, ND: { x: 440, y: 165, label: "ND" },
  OH: { x: 660, y: 265, label: "OH" }, OK: { x: 470, y: 355, label: "OK" },
  OR: { x: 130, y: 200, label: "OR" }, PA: { x: 740, y: 245, label: "PA" },
  RI: { x: 820, y: 215, label: "RI" }, SC: { x: 690, y: 365, label: "SC" },
  SD: { x: 440, y: 215, label: "SD" }, TN: { x: 630, y: 345, label: "TN" },
  TX: { x: 430, y: 410, label: "TX" }, UT: { x: 230, y: 280, label: "UT" },
  VT: { x: 800, y: 175, label: "VT" }, VA: { x: 730, y: 300, label: "VA" },
  WA: { x: 140, y: 150, label: "WA" }, WV: { x: 700, y: 290, label: "WV" },
  WI: { x: 570, y: 215, label: "WI" }, WY: { x: 300, y: 230, label: "WY" },
};

const statusFill: Record<string, string> = {
  "safe-d": "#1e3a8a",
  "likely-d": "#1d4ed8",
  "lean-d": "#3b82f6",
  "toss-up": "#eab308",
  "lean-r": "#ef4444",
  "likely-r": "#b91c1c",
  "safe-r": "#7f1d1d",
};

export default function MapPage() {
  // Build a state → status map from senate races (most visible on state map)
  const stateStatus: Record<string, string> = {};
  SENATE_RACES.forEach((r) => {
    stateStatus[r.stateAbbr] = r.raceStatus;
  });
  HOUSE_RACES.forEach((r) => {
    if (!stateStatus[r.stateAbbr]) stateStatus[r.stateAbbr] = r.raceStatus;
  });

  const allRaces = [...SENATE_RACES, ...HOUSE_RACES];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white">Race Map 2026</h1>
        <p className="text-gray-400 mt-1">Competitive races highlighted. Zoom into any district for precinct data.</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {Object.entries(statusFill).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ background: color }} />
            <span className="text-xs text-gray-400">{raceStatusLabel(status as never)}</span>
          </div>
        ))}
      </div>

      {/* SVG US Map (schematic) */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
        <svg
          viewBox="0 0 950 560"
          className="w-full"
          style={{ maxHeight: "520px" }}
          aria-label="US Election Map 2026"
        >
          <rect width="950" height="560" fill="#111" />
          {Object.entries(STATE_POSITIONS).map(([abbr, pos]) => {
            const status = stateStatus[abbr];
            const fill = status ? statusFill[status] : "#374151";
            const race = allRaces.find((r) => r.stateAbbr === abbr);
            return (
              <g key={abbr}>
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={status ? 18 : 14}
                  fill={fill}
                  opacity={status ? 0.95 : 0.5}
                  stroke={status ? "#fff" : "#555"}
                  strokeWidth={status ? 1.5 : 0.5}
                />
                <text
                  x={pos.x}
                  y={pos.y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="8"
                  fontWeight="bold"
                  fill="white"
                  fontFamily="monospace"
                >
                  {abbr}
                </text>
                {race && (
                  <title>{race.state}: {raceStatusLabel(race.raceStatus)}</title>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Race list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allRaces.map((race) => {
          const isSenate = !("districtNumber" in race);
          const href = isSenate
            ? `/senate/${race.stateAbbr.toLowerCase()}`
            : `/races/${race.stateAbbr.toLowerCase()}/${race.id}`;
          return (
            <a
              key={race.id}
              href={href}
              className="bg-gray-900 border border-gray-700 hover:border-gray-500 rounded-lg p-3 flex items-center justify-between transition-colors"
            >
              <div>
                <span className="text-white font-bold text-sm">
                  {"districtNumber" in race
                    ? `${race.stateAbbr}-${race.districtNumber}`
                    : `${race.state} Senate`}
                </span>
                <span className="text-gray-500 text-xs ml-2">
                  {"districtNumber" in race ? "House" : "Senate"}
                </span>
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded ${raceStatusColor(race.raceStatus)}`}>
                {raceStatusLabel(race.raceStatus)}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
