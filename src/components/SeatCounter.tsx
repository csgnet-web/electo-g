"use client";
import type { NationalOverview } from "@/types/election";

interface SeatCounterProps {
  data: NationalOverview;
  chamber: "house" | "senate";
}

export default function SeatCounter({ data, chamber }: SeatCounterProps) {
  const seats = chamber === "house" ? data.houseSeats : data.senateSeats;
  const total = chamber === "house" ? 435 : 100;
  const majority = Math.floor(total / 2) + 1;

  const dPct = (seats.d / total) * 100;
  const rPct = (seats.r / total) * 100;
  const uncalledPct = ((seats.uncalled + seats.i) / total) * 100;

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 min-w-[280px]">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">
          {chamber === "house" ? "House" : "Senate"} Balance
        </span>
        <span className="text-xs text-gray-500">{majority} to control</span>
      </div>

      {/* Bar */}
      <div className="flex h-4 rounded-full overflow-hidden mb-3 bg-gray-700">
        <div
          className="bg-blue-600 transition-all duration-700 ease-out"
          style={{ width: `${dPct}%` }}
        />
        <div
          className="bg-gray-500 transition-all duration-700 ease-out"
          style={{ width: `${uncalledPct}%` }}
        />
        <div
          className="bg-red-600 transition-all duration-700 ease-out"
          style={{ width: `${rPct}%` }}
        />
      </div>

      {/* Majority line marker */}
      <div className="relative h-1 mb-3">
        <div
          className="absolute w-0.5 h-3 bg-white -top-1 opacity-50"
          style={{ left: `${(majority / total) * 100}%` }}
        />
      </div>

      {/* Counts */}
      <div className="flex justify-between text-sm">
        <div className="text-center">
          <div className="text-2xl font-black text-blue-400">{seats.d}</div>
          <div className="text-xs text-gray-500">DEM</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-400">{seats.uncalled + seats.i}</div>
          <div className="text-xs text-gray-600">TBD</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-black text-red-400">{seats.r}</div>
          <div className="text-xs text-gray-500">REP</div>
        </div>
      </div>
    </div>
  );
}
