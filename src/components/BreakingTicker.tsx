"use client";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const DEFAULT_ITEMS = [
  "🔴 LIVE: 435 House races tracked in real time",
  "📊 NC-13 rated TOSS-UP — watch precincts report live",
  "🐒 Election Gorilla 24/7 — your AI election host never sleeps",
  "📍 Arizona Senate: Maricopa County is the battleground",
  "🔵 PA-07 trending Democrat based on early precinct data",
  "📡 Precinct-level data updated every 60 seconds",
  "🏛️ 33 Senate seats up for grabs in 2026",
  "🗺️ Zoom into any district for county and precinct breakdowns",
];

interface BreakingTickerProps {
  items?: string[];
  speed?: number;
}

export default function BreakingTicker({ items = DEFAULT_ITEMS, speed = 40 }: BreakingTickerProps) {
  const text = [...items, ...items].join("   ·   ");
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (ref.current) setWidth(ref.current.scrollWidth / 2);
  }, [text]);

  const duration = width / speed;

  return (
    <div className="bg-red-700 text-white text-sm font-bold overflow-hidden whitespace-nowrap border-b border-red-900 relative">
      <div className="flex items-center h-8">
        <div className="bg-black text-red-500 px-3 h-full flex items-center text-xs font-black tracking-widest shrink-0 z-10 border-r border-red-700">
          BREAKING
        </div>
        <div className="overflow-hidden flex-1 relative">
          <motion.div
            ref={ref}
            className="inline-flex whitespace-nowrap"
            animate={{ x: [-width, 0] }}
            transition={{
              x: { duration, ease: "linear", repeat: Infinity },
            }}
          >
            <span className="px-4">{text}</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
