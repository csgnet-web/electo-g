"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface QueueOverview {
  counts: { breaking: number; daily: number; weekly: number; total: number };
  estimatedTotalRecordingTimeSec: number;
  lastUpdated: string;
  breaking: QueueItem[];
  daily: QueueItem[];
  weekly: QueueItem[];
}

interface QueueItem {
  id: string;
  raceId: string;
  urgency: string;
  segmentType: string;
  scriptDraft: string;
  scriptVersion: number;
  estimatedDurationSec: number;
  status: string;
  createdAt: string;
  race: { raceId: string; state: string; raceType: string; coverageTier: number };
}

const urgencyStyles: Record<string, string> = {
  BREAKING: "bg-red-600 text-white",
  DAILY_BATCH: "bg-yellow-500 text-black",
  WEEKLY_BATCH: "bg-gray-600 text-white",
};

const tierBadge = (tier: number) => {
  const colors = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-gray-500"];
  return colors[tier] ?? "bg-gray-500";
};

export default function DashboardPage() {
  const [data, setData] = useState<QueueOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/queue")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 animate-pulse">Loading production queue...</div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-red-400 p-8">Failed to load queue data</div>;
  }

  const totalMinutes = Math.ceil(data.estimatedTotalRecordingTimeSec / 60);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Production Queue</h1>
          <p className="text-gray-400 mt-1">
            {data.counts.total} items pending · ~{totalMinutes} min recording time
          </p>
        </div>
        <div className="text-xs text-gray-500">
          Updated: {new Date(data.lastUpdated).toLocaleTimeString()}
        </div>
      </div>

      {/* Urgency counts */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-center">
          <div className="text-3xl font-black text-red-400">{data.counts.breaking}</div>
          <div className="text-xs text-red-300 uppercase tracking-widest font-bold mt-1">Breaking</div>
        </div>
        <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-4 text-center">
          <div className="text-3xl font-black text-yellow-400">{data.counts.daily}</div>
          <div className="text-xs text-yellow-300 uppercase tracking-widest font-bold mt-1">Daily Batch</div>
        </div>
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-4 text-center">
          <div className="text-3xl font-black text-gray-300">{data.counts.weekly}</div>
          <div className="text-xs text-gray-400 uppercase tracking-widest font-bold mt-1">Weekly</div>
        </div>
      </div>

      {/* Queue sections */}
      {(
        [
          { label: "Breaking", items: data.breaking, urgency: "BREAKING" },
          { label: "Daily Batch", items: data.daily, urgency: "DAILY_BATCH" },
          { label: "Weekly", items: data.weekly, urgency: "WEEKLY_BATCH" },
        ] as const
      ).map(({ label, items, urgency }) =>
        items.length > 0 ? (
          <section key={urgency}>
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3">
              {label} ({items.length})
            </h2>
            <div className="space-y-3">
              {items.map((item) => (
                <Link key={item.id} href={`/dashboard/queue/${item.id}`}>
                  <div className="bg-gray-900 border border-gray-700 hover:border-gray-500 rounded-xl p-4 cursor-pointer transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${urgencyStyles[item.urgency]}`}>
                          {item.urgency.replace("_", " ")}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded text-white ${tierBadge(item.race.coverageTier)}`}>
                          T{item.race.coverageTier}
                        </span>
                        <span className="text-white font-bold">{item.raceId}</span>
                      </div>
                      <span className="text-gray-500 text-xs">
                        {Math.ceil(item.estimatedDurationSec / 60)} min
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm line-clamp-2">{item.scriptDraft.slice(0, 200)}...</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span>{item.segmentType.replace(/_/g, " ")}</span>
                      <span>v{item.scriptVersion}</span>
                      <span>{new Date(item.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null
      )}

      {data.counts.total === 0 && (
        <div className="bg-gray-900 border border-gray-700 border-dashed rounded-xl p-12 text-center">
          <p className="text-gray-500 text-lg">Queue is empty. Agents will populate this as they detect new developments.</p>
        </div>
      )}
    </div>
  );
}
