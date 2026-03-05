"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import GorillaHost from "./GorillaHost";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { href: "/", label: "Live" },
  { href: "/house", label: "House" },
  { href: "/senate", label: "Senate" },
  { href: "/races", label: "All Races" },
  { href: "/map", label: "Map" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [liveViewers] = useState(() => Math.floor(Math.random() * 40000) + 18000);
  const [time, setTime] = useState("");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <nav className="bg-black border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-4 h-14">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="-mt-1">
            <GorillaHost size="sm" mood="excited" />
          </div>
          <div>
            <span className="text-white font-black text-lg tracking-tight">Election</span>
            <span className="text-green-400 font-black text-lg tracking-tight">Gorilla</span>
            <div className="flex items-center gap-1.5 -mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-400 text-xs font-bold">LIVE</span>
              <span className="text-gray-600 text-xs">·</span>
              <span className="text-gray-400 text-xs">{liveViewers.toLocaleString()} watching</span>
            </div>
          </div>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded text-sm font-semibold transition-colors ${
                pathname === href
                  ? "bg-green-900/40 text-green-400"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Live clock + status */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-gray-400 text-xs font-mono">{time}</span>
          <div className="hidden sm:flex items-center gap-1.5 bg-gray-900 border border-gray-700 rounded px-2.5 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-gray-300 font-mono">2026 CYCLE</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
