"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { RoastToggle } from "@/components/RoastToggle";
import { TimelineCard } from "@/components/TimelineCard";
import { ConfidenceMeter } from "@/components/ConfidenceMeter";
import { ShareCard } from "@/components/ShareCard";
import {
  loadHistory,
  pushHistory,
  saveHistory,
  type HistoryItem,
} from "@/lib/storage";

// --- Custom Hand-Drawn Arrow Components ---

const ArrowGreenLeft = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-[#CCFF00] stroke-current overflow-visible" fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15,85 C 15,40 40,20 55,40 C 65,55 75,60 90,55" />
    <path d="M75,40 L90,55 L80,70" />
  </svg>
);

const ArrowGreenRight = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-[#CCFF00] stroke-current overflow-visible" fill="none" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M85,15 C 75,60 60,80 50,65 C 40,50 35,35 25,45" />
    <path d="M35,55 L25,45 L30,30" />
  </svg>
);

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

const HistoryDrawerNoSSR = dynamic(
  () => import("@/components/HistoryDrawer").then((m) => m.HistoryDrawer),
  { ssr: false },
);

const LOADING_LINES = [
  "Consulting your future self...",
  "Rolling the cosmic dice...",
  "Asking a raccoon for financial advice...",
  "Loading consequences...",
  "Simulating timelines (please don't blink)...",
];

export function SinglePageSimulator() {
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const [decision, setDecision] = useState("");
  const [roastMode, setRoastMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingLine, setLoadingLine] = useState(LOADING_LINES[0]);
  const [error, setError] = useState<string | null>(null);

  const [history, setHistory] = useState<HistoryItem[]>(() => loadHistory());
  const [result, setResult] = useState<SimulateResponse | null>(null);

  const confidenceLabel = useMemo(() => {
    if (!result) return "";
    const base = roastMode
      ? "chance this escalates into a personal lore arc"
      : "chance this ruins your sleep schedule";
    return `${result.confidence_percent}% ${base}.`;
  }, [result, roastMode]);

  async function simulate() {
    setError(null);
    const trimmed = decision.trim();
    if (trimmed.length < 3) {
      setError("Type a real decision first.");
      return;
    }

    const i = Math.floor(Math.random() * LOADING_LINES.length);
    setLoadingLine(LOADING_LINES[i] ?? LOADING_LINES[0]);
    setLoading(true);
    setResult(null);
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
      if ("error" in data) {
        setError(data.error || "Simulation failed.");
        return;
      }

      const item: HistoryItem = {
        id: crypto.randomUUID(),
        decision: trimmed,
        roastMode,
        createdAt: Date.now(),
      };
      pushHistory(item);
      setHistory(loadHistory());

      setResult(data);
      requestAnimationFrame(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Simulation failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-[#0038FF] text-white relative overflow-hidden selection:bg-[#CCFF00] selection:text-black">
      {/* Background Grid - ignore for html2canvas */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff18_1px,transparent_1px),linear-gradient(to_bottom,#ffffff18_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0"
        data-html2canvas-ignore
      />

       {/* Top bar */}
      <header className="relative z-10 max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-6 flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="bg-white text-black font-black tracking-tight text-[10px] sm:text-xs px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl rounded-bl-sm relative shadow-sm">
            DECISION
            <div
              className="absolute -bottom-1 sm:-bottom-1.5 left-0 w-2 sm:w-3 h-2 sm:h-3 bg-white"
              style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
            />
          </div>
          <div className="bg-[#CCFF00] text-black font-black text-[10px] sm:text-xs px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border-[1.5px] border-white shadow-sm">
            SIM
          </div>
        </div>
        <div className="text-white text-sm">
          <RoastToggle value={roastMode} onChange={setRoastMode} />
        </div>
      </header>

      {/* Hero / input */}
      <main className="relative z-10 max-w-6xl mx-auto px-3 sm:px-6 pb-10 sm:pb-14">
        <div className="relative max-w-5xl mx-auto text-center pt-4 sm:pt-6 pb-8 sm:pb-10 px-2 sm:px-0">
          <h1
            className="text-[clamp(3.5rem,10vw,140px)] font-black leading-[0.85] tracking-tighter text-white uppercase"
            style={{
              fontFamily: '"Arial Black", Impact, sans-serif',
              textShadow:
                "1px 1px 0 #001A99, 2px 2px 0 #001A99, 3px 3px 0 #001A99, 4px 4px 0 #001A99, 5px 5px 0 #001A99, 6px 6px 0 #001A99, 7px 7px 0 #001A99, 8px 8px 0 #001A99, 9px 9px 0 #001A99, 10px 10px 0 #001A99",
            }}
          >
            SIMULATE
          </h1>
          <h2
            className="mt-2 text-[clamp(2.5rem,7vw,96px)] font-black leading-[0.9] tracking-tighter text-[#CCFF00] uppercase"
            style={{
              fontFamily: '"Arial Black", Impact, sans-serif',
              textShadow:
                "1px 1px 0 #001A99, 2px 2px 0 #001A99, 3px 3px 0 #001A99, 4px 4px 0 #001A99, 5px 5px 0 #001A99, 6px 6px 0 #001A99, 7px 7px 0 #001A99",
            }}
          >
            YOUR FUTURE
          </h2>

          {/* Decorative Background Arrows - ignore for html2canvas */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden" data-html2canvas-ignore>
            {/* Bottom Left Arrow */}
            <div className="absolute bottom-[0%] left-[0%] w-24 h-24 md:w-32 md:h-32 opacity-60">
              <ArrowGreenLeft />
            </div>
            {/* Top Right Arrow */}
            <div className="absolute top-[5%] right-[0%] w-24 h-24 md:w-32 md:h-32 opacity-60">
              <ArrowGreenRight />
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 md:gap-6 md:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr] items-start">
            {/* Input card */}
            <div className="pointer-events-auto">
              <div className="bg-white/15 backdrop-blur-md border border-white/30 rounded-[1.5rem] sm:rounded-[2rem] p-3 sm:p-5 sm:p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-2 sm:gap-4">
                  <div className="text-left">
                    <div className="text-[11px] sm:text-xs font-semibold tracking-wide text-black/70">
                      Type your decision
                    </div>
                    <div className="mt-0.5 sm:mt-1 text-[11px] sm:text-sm text-black/80">
                      You'll get Best, Worst, and Wildcard timelines.
                    </div>
                  </div>
                  <div className="text-[10px] sm:text-xs font-black text-black bg-[#CCFF00] px-2 py-1 sm:px-3 sm:py-1.5 rounded-full">
                    {roastMode ? "ROAST: ON" : "ROAST: OFF"}
                  </div>
                </div>

                <textarea
                  value={decision}
                  onChange={(e) => setDecision(e.target.value)}
                  rows={4}
                  placeholder='Example: "Should I text my ex at 2am?"'
                  className="mt-3 sm:mt-4 w-full resize-none rounded-xl sm:rounded-2xl border border-black/20 bg-white/80 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-black placeholder:text-black/50 outline-none focus:border-black/40"
                  disabled={loading}
                />

                <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                  <div className="text-[11px] sm:text-xs text-black/70">
                    Simulation ≠ prediction. But it might be a warning.
                  </div>
                  <button
                    type="button"
                    onClick={simulate}
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-full border-2 border-white bg-white text-[#0038FF] px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-semibold hover:scale-[1.02] hover:bg-white/90 disabled:opacity-60 disabled:hover:scale-100 transition-all duration-300 ease-out shadow-lg hover:shadow-xl"
                  >
                    {loading ? "Simulating..." : "Simulate My Future"}
                  </button>
                </div>

                {loading ? (
                  <div className="mt-3 sm:mt-4 rounded-2xl border border-white/20 bg-black/15 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-white/85">
                    {loadingLine}
                  </div>
                ) : null}

                {error ? (
                  <div className="mt-3 sm:mt-4 rounded-2xl border border-rose-200/40 bg-rose-500/15 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-rose-50">
                    {error}
                  </div>
                ) : null}
              </div>
            </div>

            {/* History / hint card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="pointer-events-auto"
            >
              <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-3 sm:p-5 sm:p-6 text-black shadow-[0_20px_40px_rgba(0,0,0,0.25)] sm:shadow-[0_30px_80px_rgba(0,0,0,0.35)]">
                <div className="text-lg sm:text-xl font-black uppercase leading-tight">
                  Three timelines.
                  <br />
                  One decision.
                </div>
                <div className="mt-1 sm:mt-2 text-[11px] sm:text-xs font-bold text-black/60">
                  Best Case • Worst Case • Wildcard
                </div>
                <div className="mt-3 sm:mt-5">
                  <HistoryDrawerNoSSR
                    items={history}
                    onPick={(item: HistoryItem) => {
                      setDecision(item.decision);
                      setRoastMode(item.roastMode);
                    }}
                    onClear={() => {
                      saveHistory([]);
                      setHistory([]);
                    }}
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Results */}
        <div ref={resultsRef} className="scroll-mt-8" />
        {result ? (
          <section className="pb-16">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
                <div>
                  <div className="text-xs font-semibold tracking-wide text-white/75">
                    Category: {result.category} {result.provider ? `• via ${result.provider}` : ""}
                  </div>
                   <div className="mt-2 text-2xl sm:text-3xl font-black tracking-tight break-words">
                     “{decision.trim()}”
                   </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className="rounded-full border border-white/60 bg-white/10 px-5 py-2 text-sm font-semibold hover:bg-white/15 transition-colors"
                >
                  Try another
                </button>
              </div>

               <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <TimelineCard
                  label="Best Case"
                  accent="emerald"
                  title={result.timelines.best.title}
                  threeMonth={result.timelines.best.three_month}
                  oneYear={result.timelines.best.one_year}
                  verdict={result.timelines.best.verdict}
                  delay={0.02}
                />
                <TimelineCard
                  label="Worst Case"
                  accent="rose"
                  title={result.timelines.worst.title}
                  threeMonth={result.timelines.worst.three_month}
                  oneYear={result.timelines.worst.one_year}
                  verdict={result.timelines.worst.verdict}
                  delay={0.06}
                />
                <TimelineCard
                  label="Wildcard"
                  accent="violet"
                  title={result.timelines.wildcard.title}
                  threeMonth={result.timelines.wildcard.three_month}
                  oneYear={result.timelines.wildcard.one_year}
                  verdict={result.timelines.wildcard.verdict}
                  delay={0.1}
                />
              </div>

               <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                <ConfidenceMeter percent={result.confidence_percent} label={confidenceLabel} />
                 <ShareCard
                   data={{
                     decision: decision.trim(),
                     category: result.category,
                     confidence_percent: result.confidence_percent,
                     timelines: {
                       best: {
                         title: result.timelines.best.title,
                         verdict: result.timelines.best.verdict,
                       },
                       worst: {
                         title: result.timelines.worst.title,
                         verdict: result.timelines.worst.verdict,
                       },
                       wildcard: {
                         title: result.timelines.wildcard.title,
                         verdict: result.timelines.wildcard.verdict,
                       },
                     },
                   }}
                 />
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
