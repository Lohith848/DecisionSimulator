"use client";

const FUNNY_TRUTHS = [
  "Your future self is already facepalming.",
  "The raccoons approve this decision.",
  "Statistically, you'll probably be fine. Probably.",
  "The universe says: 'Maybe.'",
  "Your plant will outlive this decision.",
  "A coin flip would be more confident.",
  "This timeline has a 2/5 star rating on Yelp.",
  "Your future self is sending a strongly worded letter.",
  "Simulation accuracy: 67%* (*the other 33% is chaos).",
  "Even the AI is judging you a little.",
  "Your cat knows the truth but won't tell.",
  "The stars are neutral on this one.",
];

export function ConfidenceMeter(props: {
  percent: number;
  label?: string;
}) {
  const p = Math.max(1, Math.min(99, Math.round(props.percent)));
  const truthIndex = p % FUNNY_TRUTHS.length;

  return (
    <div className="rounded-[2rem] border border-white/30 bg-white/10 backdrop-blur-md p-5 shadow-sm">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white/90">
            Confidence meter
          </div>
          <div className="mt-1 text-xs text-white/70">
            Fake, fun, and clearly not a prediction.
          </div>
        </div>
        <div className="text-2xl font-semibold tabular-nums text-white">
          {p}%
        </div>
      </div>

      <div className="mt-4">
        <div className="h-3 w-full rounded-full bg-white/20">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-fuchsia-500 to-amber-400"
            style={{ width: `${p}%` }}
          />
        </div>
        {props.label ? (
          <div className="mt-2 text-xs text-white/70">
            {props.label}
          </div>
        ) : null}
        <div className="mt-2 text-xs italic text-white/60">
          💡 {FUNNY_TRUTHS[truthIndex]}
        </div>
      </div>
    </div>
  );
}

