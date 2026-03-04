"use client";
import { motion } from "framer-motion";
import type { SocialSignal } from "@/types/election";

const platformIcon = (p: SocialSignal["platform"]) => {
  if (p === "twitter") return "𝕏";
  if (p === "reddit") return "🟠";
  return "▶";
};

const platformColor = (p: SocialSignal["platform"]) => {
  if (p === "twitter") return "text-sky-400";
  if (p === "reddit") return "text-orange-400";
  return "text-red-500";
};

interface SocialFeedProps {
  signals: SocialSignal[];
}

export default function SocialFeed({ signals }: SocialFeedProps) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center gap-2">
        <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">Social Pulse</span>
      </div>
      <div className="divide-y divide-gray-800">
        {signals.map((sig, i) => (
          <motion.div
            key={sig.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="px-4 py-3 hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className={`text-base ${platformColor(sig.platform)} shrink-0`}>
                {platformIcon(sig.platform)}
              </span>
              <div className="min-w-0">
                <p className="text-sm text-gray-200 leading-snug">{sig.text}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">{sig.author}</span>
                  <span className={`text-xs px-1.5 rounded ${
                    sig.sentiment === "positive" ? "bg-green-900/50 text-green-400" :
                    sig.sentiment === "negative" ? "bg-red-900/50 text-red-400" :
                    "bg-gray-800 text-gray-500"
                  }`}>
                    {sig.sentiment}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
