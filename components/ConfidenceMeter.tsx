"use client";

export function ConfidenceMeter(props: {
  percent: number;
  label?: string;
}) {
  const p = Math.max(1, Math.min(99, Math.round(props.percent)));

  return (
    <div className="rounded-[2rem] border border-white/30 bg-white/10 backdrop-blur-md p-5">
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
      </div>
    </div>
  );
}

