"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface QueueItem {
  id: string;
  raceId: string;
  urgency: string;
  segmentType: string;
  scriptDraft: string;
  scriptVersion: number;
  estimatedDurationSec: number;
  status: string;
  operatorNotes: string;
  triggeringEvents: { headline: string; source: string; significance_estimate: number }[];
  createdAt: string;
}

interface RaceData {
  raceId: string;
  raceType: string;
  state: string;
  district: string;
  partisanLean: number;
  coverageTier: number;
  incumbentName: string;
  incumbentParty: string;
  candidates: object[];
  pollingAverages: object[];
  pollingSpread: number;
  pollingTrend: string;
  enthusiasmIndex: number;
}

const REJECTION_REASONS = [
  { value: "factually_wrong", label: "Factually Wrong" },
  { value: "tone_off", label: "Tone Off" },
  { value: "timing_not_right", label: "Timing Not Right" },
  { value: "needs_more_context", label: "Needs More Context" },
];

export default function ScriptApprovalPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<QueueItem | null>(null);
  const [race, setRace] = useState<RaceData | null>(null);
  const [editedScript, setEditedScript] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // In production this would be a single joined query.
    // For now, fetch the queue item from the queue overview.
    fetch("/api/queue")
      .then((r) => r.json())
      .then((data) => {
        const all = [...(data.breaking ?? []), ...(data.daily ?? []), ...(data.weekly ?? [])];
        const found = all.find((i: QueueItem) => i.id === params.id);
        if (found) {
          setItem(found);
          setEditedScript(found.scriptDraft);
          // Fetch race data
          fetch(`/api/races/${found.raceId}`)
            .then((r) => r.json())
            .then(setRace)
            .catch(console.error);
        }
      })
      .catch(console.error);
  }, [params.id]);

  async function handleApprove() {
    if (!item) return;
    setSubmitting(true);
    const body: Record<string, string> = {};
    if (isEditing && editedScript !== item.scriptDraft) body.editedScript = editedScript;
    if (notes) body.operatorNotes = notes;

    await fetch(`/api/queue/${item.id}/approve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    router.push("/dashboard");
  }

  async function handleReject() {
    if (!item || !rejectReason) return;
    setSubmitting(true);
    await fetch(`/api/queue/${item.id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: rejectReason, notes }),
    });
    router.push("/dashboard");
  }

  if (!item) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 animate-pulse">Loading script...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main: Script Card */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <div>
          <button onClick={() => router.push("/dashboard")} className="text-gray-500 text-sm hover:text-gray-300 mb-2 block">
            ← Back to queue
          </button>
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-xs font-bold px-2 py-1 rounded ${
              item.urgency === "BREAKING" ? "bg-red-600 text-white" :
              item.urgency === "DAILY_BATCH" ? "bg-yellow-500 text-black" :
              "bg-gray-600 text-white"
            }`}>
              {item.urgency.replace("_", " ")}
            </span>
            <span className="text-xs font-bold px-2 py-1 rounded bg-gray-700 text-gray-200">
              {item.segmentType.replace(/_/g, " ")}
            </span>
            <span className="text-gray-500 text-xs">v{item.scriptVersion}</span>
          </div>
          <h1 className="text-2xl font-black text-white">{item.raceId}</h1>
          <p className="text-gray-400 text-sm mt-1">
            ~{Math.ceil(item.estimatedDurationSec / 60)} min · Created {new Date(item.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Triggering Events */}
        {item.triggeringEvents.length > 0 && (
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">What triggered this</h3>
            <div className="space-y-2">
              {item.triggeringEvents.map((ev, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-yellow-400 text-sm shrink-0">
                    {ev.significance_estimate >= 0.7 ? "🔴" : ev.significance_estimate >= 0.4 ? "🟡" : "🟢"}
                  </span>
                  <div>
                    <p className="text-gray-200 text-sm">{ev.headline}</p>
                    <span className="text-gray-500 text-xs">{ev.source} · sig: {ev.significance_estimate.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Script */}
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Script</h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs text-green-400 hover:text-green-300"
            >
              {isEditing ? "Preview" : "Edit"}
            </button>
          </div>
          {isEditing ? (
            <textarea
              value={editedScript}
              onChange={(e) => setEditedScript(e.target.value)}
              className="w-full h-96 bg-gray-800 text-gray-200 text-sm font-mono p-4 rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none resize-y"
            />
          ) : (
            <div className="bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-gray-200 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                {editedScript}
              </pre>
            </div>
          )}
        </div>

        {/* Operator Notes */}
        <div>
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-2">Operator Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional notes..."
            className="w-full h-20 bg-gray-800 text-gray-200 text-sm p-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none resize-y"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleApprove}
            disabled={submitting}
            className="bg-green-600 hover:bg-green-500 text-white font-bold px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {isEditing && editedScript !== item.scriptDraft ? "Approve with Edits" : "Approve"}
          </button>
          <button
            onClick={() => setShowReject(!showReject)}
            className="bg-red-900 hover:bg-red-800 text-red-200 font-bold px-6 py-2.5 rounded-lg transition-colors"
          >
            Reject
          </button>
        </div>

        {/* Reject dropdown */}
        {showReject && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {REJECTION_REASONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRejectReason(r.value)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    rejectReason === r.value
                      ? "bg-red-600 border-red-600 text-white"
                      : "border-red-700 text-red-300 hover:border-red-500"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleReject}
              disabled={!rejectReason || submitting}
              className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              Confirm Rejection
            </button>
          </div>
        )}
      </div>

      {/* Sidebar: Race Object */}
      <div className="space-y-4">
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Race Object</h3>
          {race ? (
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Race ID:</span>
                <span className="text-white ml-2 font-mono">{race.raceId}</span>
              </div>
              <div>
                <span className="text-gray-500">Type:</span>
                <span className="text-white ml-2">{race.raceType}</span>
              </div>
              <div>
                <span className="text-gray-500">State:</span>
                <span className="text-white ml-2">{race.state}</span>
              </div>
              <div>
                <span className="text-gray-500">Lean:</span>
                <span className={`ml-2 font-bold ${race.partisanLean < 0 ? "text-blue-400" : "text-red-400"}`}>
                  {race.partisanLean > 0 ? "R+" : "D+"}{Math.abs(race.partisanLean).toFixed(1)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Tier:</span>
                <span className="text-white ml-2 font-bold">T{race.coverageTier}</span>
              </div>
              <div>
                <span className="text-gray-500">Incumbent:</span>
                <span className="text-white ml-2">{race.incumbentName} ({race.incumbentParty})</span>
              </div>
              <div>
                <span className="text-gray-500">Polling spread:</span>
                <span className={`ml-2 font-bold ${race.pollingSpread < 0 ? "text-blue-400" : "text-red-400"}`}>
                  {race.pollingSpread > 0 ? "R+" : "D+"}{Math.abs(race.pollingSpread).toFixed(1)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Trend:</span>
                <span className="text-white ml-2">{race.pollingTrend}</span>
              </div>
              <div>
                <span className="text-gray-500">Enthusiasm:</span>
                <span className="text-white ml-2">{race.enthusiasmIndex}</span>
              </div>

              <hr className="border-gray-700" />

              <details>
                <summary className="text-gray-400 text-xs cursor-pointer hover:text-gray-300">Candidates JSON</summary>
                <pre className="text-gray-300 text-xs mt-2 overflow-auto max-h-48 bg-gray-800 rounded p-2">
                  {JSON.stringify(race.candidates, null, 2)}
                </pre>
              </details>
              <details>
                <summary className="text-gray-400 text-xs cursor-pointer hover:text-gray-300">Polling Averages JSON</summary>
                <pre className="text-gray-300 text-xs mt-2 overflow-auto max-h-48 bg-gray-800 rounded p-2">
                  {JSON.stringify(race.pollingAverages, null, 2)}
                </pre>
              </details>
            </div>
          ) : (
            <div className="text-gray-500 text-sm animate-pulse">Loading race data...</div>
          )}
        </div>
      </div>
    </div>
  );
}
