"use client";

import { motion } from "framer-motion";

export function TimelineCard(props: {
  label: "Best Case" | "Worst Case" | "Wildcard";
  accent: "emerald" | "rose" | "violet";
  title: string;
  threeMonth: string;
  oneYear: string;
  verdict: string;
  vibe: string;
  delay?: number;
}) {
  const accentClasses =
    props.accent === "emerald"
      ? "from-emerald-500/20 to-emerald-500/0 border-emerald-300/40 dark:border-emerald-400/30"
      : props.accent === "rose"
        ? "from-rose-500/20 to-rose-500/0 border-rose-300/40 dark:border-rose-400/30"
        : "from-violet-500/20 to-violet-500/0 border-violet-300/40 dark:border-violet-400/30";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: props.delay ?? 0 }}
      className={[
        "relative overflow-hidden rounded-[2rem] border bg-white/10 backdrop-blur-md shadow-sm",
        accentClasses,
      ].join(" ")}
    >
      <div className="absolute inset-0 bg-gradient-to-b opacity-100" />
      <div className="relative p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold tracking-wide text-white/80">
              {props.label}
            </div>
            <div className="mt-1 text-xl font-semibold tracking-tight text-white">
              {props.title}
            </div>
          </div>
          <div className="text-2xl">{props.vibe}</div>
        </div>

        <div className="mt-4 space-y-3 text-sm text-white/90">
          <div>
            <div className="text-xs font-semibold text-white/70">
              3-month outlook
            </div>
            <div className="mt-1 whitespace-pre-line">{props.threeMonth}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-white/70">
              1-year outlook
            </div>
            <div className="mt-1 whitespace-pre-line">{props.oneYear}</div>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/15 px-4 py-3 text-white">
            <div className="text-xs font-semibold text-white/70">
              Verdict
            </div>
            <div className="mt-1 font-medium">{props.verdict}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

