"use client";
import GorillaHost from "./GorillaHost";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import type { AICommentary } from "@/types/election";

interface LiveStreamPanelProps {
  commentary: AICommentary[];
}

export default function LiveStreamPanel({ commentary }: LiveStreamPanelProps) {
  const [activeItem, setActiveItem] = useState(0);
  const [speaking, setSpeaking] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveItem((i) => (i + 1) % commentary.length);
      setSpeaking(true);
      setTimeout(() => setSpeaking(false), 4000);
    }, 10000);
    return () => clearInterval(interval);
  }, [commentary.length]);

  const current = commentary[activeItem];

  return (
    <div className="relative bg-black rounded-2xl overflow-hidden border border-gray-700 aspect-video flex items-end">
      {/* Simulated stream background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-black" />

      {/* Election map placeholder */}
      <div className="absolute inset-0 flex items-center justify-center opacity-10">
        <div className="grid grid-cols-10 gap-1 p-8 w-full h-full">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className={`rounded-sm ${Math.random() > 0.5 ? "bg-blue-600" : "bg-red-600"}`}
              style={{ opacity: 0.3 + Math.random() * 0.7 }}
            />
          ))}
        </div>
      </div>

      {/* Stream overlay: top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-red-400 text-xs font-black tracking-widest">LIVE</span>
          <span className="text-gray-400 text-xs ml-2">ElectionGorilla 24/7</span>
        </div>
        <div className="text-gray-300 text-xs font-mono">
          {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
        </div>
      </div>

      {/* Gorilla host — lower third left */}
      <div className="absolute bottom-10 left-4 flex items-end gap-4 z-10">
        <motion.div
          animate={{ scale: speaking ? 1.05 : 1 }}
          transition={{ duration: 0.3 }}
        >
          <GorillaHost speaking={speaking} mood={speaking ? "excited" : "neutral"} size="lg" />
        </motion.div>

        {/* Lower third name plate */}
        <div className="mb-4">
          <div className="bg-green-500 text-black text-xs font-black px-2 py-0.5 mb-0.5 inline-block">
            ELECTION GORILLA
          </div>
          <div className="bg-black/80 text-white text-xs px-2 py-1 border-l-2 border-green-400 max-w-[260px]">
            <AnimatePresence mode="wait">
              <motion.span
                key={current.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="block leading-snug"
              >
                {current.text}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom race ticker */}
      <div className="relative w-full bg-black/90 border-t border-gray-800 px-4 py-2">
        <div className="flex gap-6 overflow-hidden">
          {[
            { label: "NC-13", status: "TOSS-UP", color: "text-yellow-400" },
            { label: "AZ SEN", status: "TOSS-UP", color: "text-yellow-400" },
            { label: "PA-07", status: "LEAN D", color: "text-blue-400" },
            { label: "MT SEN", status: "LEAN R", color: "text-red-400" },
            { label: "MI-10", status: "TOSS-UP", color: "text-yellow-400" },
            { label: "NV SEN", status: "TOSS-UP", color: "text-yellow-400" },
          ].map((r) => (
            <div key={r.label} className="flex items-center gap-1.5 shrink-0">
              <span className="text-white text-xs font-black">{r.label}</span>
              <span className={`text-xs font-bold ${r.color}`}>{r.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
