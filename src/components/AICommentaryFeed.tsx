"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import type { AICommentary } from "@/types/election";
import GorillaHost from "./GorillaHost";

const topicIcons: Record<AICommentary["topic"], string> = {
  "race-call": "🏆",
  "trending": "📈",
  "data-insight": "🔬",
  "breaking": "🚨",
};

const topicMood: Record<AICommentary["topic"], "neutral" | "excited" | "analyzing" | "breaking"> = {
  "race-call": "excited",
  "trending": "analyzing",
  "data-insight": "analyzing",
  "breaking": "breaking",
};

interface AICommentaryFeedProps {
  items: AICommentary[];
}

export default function AICommentaryFeed({ items }: AICommentaryFeedProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setSpeaking(true);
    const timeout = setTimeout(() => setSpeaking(false), 3000);
    return () => clearTimeout(timeout);
  }, [activeIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % items.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [items.length]);

  const current = items[activeIndex];

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">AI Election Commentary</span>
      </div>

      <div className="p-4 flex gap-4 items-start">
        {/* Gorilla */}
        <div className="shrink-0">
          <GorillaHost speaking={speaking} mood={topicMood[current.topic]} size="sm" />
        </div>

        {/* Commentary */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{topicIcons[current.topic]}</span>
                <span className="text-xs text-gray-400 uppercase tracking-wide font-bold">
                  {current.topic.replace("-", " ")}
                </span>
              </div>
              <p className="text-white text-sm leading-relaxed">{current.text}</p>
              <span className="text-xs text-gray-600 mt-2 block">
                {new Date(current.timestamp).toLocaleTimeString()}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Dots */}
          <div className="flex gap-1.5 mt-3">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === activeIndex ? "bg-green-400" : "bg-gray-600"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
