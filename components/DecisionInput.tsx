"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { RoastToggle } from "@/components/RoastToggle";
import { loadHistory, pushHistory, saveLatestResult, saveHistory, type HistoryItem } from "@/lib/storage";

type SimulateResponse = {
  category: string;
  confidence_percent: number;
  timelines: {
    best: { title: string; three_month: string; one_year: string; verdict: string; vibe: string };
    worst: { title: string; three_month: string; one_year: string; verdict: string; vibe: string };
    wildcard: { title: string; three_month: string; one_year: string; verdict: string; vibe: string };
  };
  provider?: "groq" | "gemini";
};

const LOADING_LINES = [
  "Consulting your future self...",
  "Rolling the cosmic dice...",
  "Asking a raccoon for financial advice...",
  "Loading consequences...",
  "Simulating timelines (please don’t blink)...",
];

const HistoryDrawerNoSSR = dynamic(
  () => import("@/components/HistoryDrawer").then((m) => m.HistoryDrawer),
  { ssr: false },
);

export function DecisionInput() {
  const router = useRouter();
  const [decision, setDecision] = useState("");
  const [roastMode, setRoastMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistoryState] = useState<HistoryItem[]>(() => loadHistory());
  const [loadingLine, setLoadingLine] = useState<string>(LOADING_LINES[0]);

  async function onSimulate() {
    setError(null);
    const trimmed = decision.trim();
    if (trimmed.length < 3) {
      setError("Type a real decision first.");
      return;
    }

    const i = Math.floor(Math.random() * LOADING_LINES.length);
    setLoadingLine(LOADING_LINES[i] ?? LOADING_LINES[0]);
    setLoading(true);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ decision: trimmed, roastMode }),
      });

      const data = (await res.json()) as SimulateResponse | { error: string };
      if (!res.ok) {
        setError("error" in data ? data.error : "Simulation failed.");
        return;
      }

      const item: HistoryItem = {
        id: crypto.randomUUID(),
        decision: trimmed,
        roastMode,
        createdAt: Date.now(),
      };
      pushHistory(item);
      setHistoryState(loadHistory());

      saveLatestResult({
        input: { decision: trimmed, roastMode },
        output: data,
        createdAt: Date.now(),
      });

      router.push("/results");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Simulation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full space-y-4">
      <div className="rounded-3xl border border-zinc-200 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/50">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              Decision Simulator
            </div>
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              See your future before you live it.
            </div>
          </div>
          <RoastToggle value={roastMode} onChange={setRoastMode} />
        </div>

        <div className="mt-4">
          <label className="sr-only" htmlFor="decision">
            Your decision
          </label>
          <textarea
            id="decision"
            value={decision}
            onChange={(e) => setDecision(e.target.value)}
            rows={5}
            placeholder='Type your decision. Example: "Should I text my ex at 2am?"'
            className="w-full resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-700"
            disabled={loading}
          />
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              This is a simulation, not a prediction. Mostly.
            </div>
            <button
              type="button"
              onClick={onSimulate}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-2xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {loading ? "Simulating..." : "Simulate My Future"}
            </button>
          </div>

          {loading ? (
            <div className="mt-3 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-300">
              {loadingLine}
            </div>
          ) : null}

          {error ? (
            <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
              {error}
            </div>
          ) : null}
        </div>
      </div>

      <HistoryDrawerNoSSR
        items={history}
        onPick={(item: HistoryItem) => {
          setDecision(item.decision);
          setRoastMode(item.roastMode);
        }}
        onClear={() => {
          saveHistory([]);
          setHistoryState([]);
        }}
      />
    </div>
  );
}

