"use client";
import { motion, useAnimation, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

interface GorillaHostProps {
  speaking?: boolean;
  mood?: "neutral" | "excited" | "analyzing" | "breaking";
  size?: "sm" | "md" | "lg" | "xl";
}

const moodColors: Record<NonNullable<GorillaHostProps["mood"]>, string> = {
  neutral: "#4ade80",
  excited: "#facc15",
  analyzing: "#60a5fa",
  breaking: "#f87171",
};

const sizeMap = {
  sm: 80,
  md: 120,
  lg: 180,
  xl: 240,
};

export default function GorillaHost({
  speaking = false,
  mood = "neutral",
  size = "md",
}: GorillaHostProps) {
  const controls = useAnimation();
  const prefersReduced = useReducedMotion();
  const [blink, setBlink] = useState(false);
  const dim = sizeMap[size];

  useEffect(() => {
    if (speaking && !prefersReduced) {
      controls.start({
        y: [0, -4, 0, -2, 0],
        transition: { duration: 0.6, repeat: Infinity, ease: "easeInOut" },
      });
    } else {
      controls.start({ y: 0, transition: { duration: 0.3 } });
    }
  }, [speaking, controls, prefersReduced]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const accentColor = moodColors[mood];
  const eyeH = blink ? 1 : 12;

  return (
    <motion.div animate={controls} style={{ width: dim, height: dim + 20 }} className="relative select-none">
      <svg
        width={dim}
        height={dim + 20}
        viewBox="0 0 120 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Election Gorilla host"
        role="img"
      >
        {/* Glow ring when speaking */}
        {speaking && (
          <motion.circle
            cx="60" cy="72" r="54"
            stroke={accentColor}
            strokeWidth="2"
            opacity={0.4}
            fill="none"
            animate={{ r: [50, 56, 50], opacity: [0.4, 0.1, 0.4] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* Neck */}
        <rect x="44" y="106" width="32" height="18" rx="6" fill="#1c1210" />

        {/* Torso hint */}
        <ellipse cx="60" cy="130" rx="30" ry="14" fill="#1c1210" />

        {/* Head */}
        <ellipse cx="60" cy="70" rx="46" ry="44" fill="#2d1b0e" />

        {/* Ear left */}
        <ellipse cx="17" cy="68" rx="11" ry="13" fill="#2d1b0e" />
        <ellipse cx="17" cy="68" rx="7" ry="9" fill="#4a2e1a" />

        {/* Ear right */}
        <ellipse cx="103" cy="68" rx="11" ry="13" fill="#2d1b0e" />
        <ellipse cx="103" cy="68" rx="7" ry="9" fill="#4a2e1a" />

        {/* Forehead ridge */}
        <ellipse cx="60" cy="42" rx="34" ry="10" fill="#1a0d06" />

        {/* Face plate */}
        <ellipse cx="60" cy="80" rx="30" ry="26" fill="#3d2410" />

        {/* Eye whites */}
        <ellipse cx="44" cy="70" rx="10" ry={eyeH} fill="white" />
        <ellipse cx="76" cy="70" rx="10" ry={eyeH} fill="white" />

        {/* Pupils */}
        {!blink && (
          <>
            <circle cx="46" cy="71" r="6" fill="#1a1a1a" />
            <circle cx="78" cy="71" r="6" fill="#1a1a1a" />
            {/* Highlight */}
            <circle cx="48" cy="69" r="2" fill="white" opacity={0.7} />
            <circle cx="80" cy="69" r="2" fill="white" opacity={0.7} />
          </>
        )}

        {/* Nose */}
        <ellipse cx="60" cy="84" rx="12" ry="8" fill="#1a0d06" />
        <circle cx="56" cy="83" r="3.5" fill="#0d0806" />
        <circle cx="64" cy="83" r="3.5" fill="#0d0806" />

        {/* Mouth */}
        {speaking ? (
          <motion.ellipse
            cx="60" cy="96"
            rx="12" ry="5"
            fill="#0d0806"
            animate={{ ry: [5, 8, 5, 6, 5] }}
            transition={{ duration: 0.4, repeat: Infinity }}
          />
        ) : (
          <path d="M 48 96 Q 60 103 72 96" stroke="#0d0806" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        )}

        {/* Tie / badge area */}
        <rect x="50" y="118" width="20" height="10" rx="3" fill={accentColor} opacity={0.85} />
        <text x="60" y="126" textAnchor="middle" fontSize="5" fill="#000" fontWeight="bold" fontFamily="monospace">LIVE</text>

        {/* Mood indicator dot */}
        <circle cx="96" cy="50" r="6" fill={accentColor} opacity={0.9} />
      </svg>
    </motion.div>
  );
}
