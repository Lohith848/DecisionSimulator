"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";

type ShareData = {
  decision: string;
  category: string;
  confidence_percent: number;
  timelines: {
    best: { title: string; verdict: string; vibe: string };
    worst: { title: string; verdict: string; vibe: string };
    wildcard: { title: string; verdict: string; vibe: string };
  };
};

export function ShareCard(props: { data: ShareData }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Light theme for export and preview (glassmorphism)
  const exportColors = {
    bgTopLeft: "rgba(255, 255, 255, 0.9)",
    bgMid: "rgba(255, 255, 255, 0.85)",
    bgBottomRight: "rgba(255, 255, 255, 0.95)",
    text: "#000000",
    muted: "rgba(0,0,0,0.6)",
    muted2: "rgba(0,0,0,0.4)",
    pillBg: "rgba(0,0,0,0.08)",
    bestBorder: "rgba(52, 211, 153, 0.5)",
    bestBg: "rgba(52, 211, 153, 0.15)",
    worstBorder: "rgba(251, 113, 133, 0.5)",
    worstBg: "rgba(251, 113, 133, 0.15)",
    wildBorder: "rgba(167, 139, 250, 0.5)",
    wildBg: "rgba(167, 139, 250, 0.15)",
  } as const;

   async function exportImage() {
    setError(null);
    if (!ref.current) return;
    setBusy(true);
    try {
      const canvas = await html2canvas(ref.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        ignoreElements: (el) => {
          // Ignore elements with data-html2canvas-ignore or their ancestors
          return el.hasAttribute('data-html2canvas-ignore') || !!el.closest('[data-html2canvas-ignore]');
        },
        logging: false,
      });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = "decision-simulator.png";
      a.click();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setBusy(false);
    }
  }

  const { data } = props;

  return (
    <div className="rounded-[2rem] border-[1px] border-[rgba(0,0,0,0.15)] bg-white/70 backdrop-blur-sm p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold tracking-wide text-black">
            Share card
          </div>
          <div className="mt-1 text-xs text-black/60">
            Exports a light glassmorphism image (with watermark).
          </div>
        </div>
        <button
          type="button"
          onClick={exportImage}
          disabled={busy}
          className="inline-flex items-center justify-center rounded-full border-2 border-black bg-black text-white px-4 py-2 text-sm font-semibold hover:bg-black/90 disabled:opacity-60 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          {busy ? "Exporting..." : "Export image"}
        </button>
      </div>

      {error ? (
        <div className="mt-3 rounded-2xl border border-rose-600/40 bg-rose-500/20 px-4 py-3 text-sm text-rose-900">
          {error}
        </div>
      ) : null}

      <div className="mt-4 flex justify-center">
        <div
          ref={ref}
          className="w-[720px] max-w-full overflow-hidden rounded-[2rem] border-[1px] border-[rgba(0,0,0,0.1)] bg-white/90 backdrop-blur-md p-6 shadow-lg"
          style={{
            color: exportColors.text,
            backgroundImage: `linear-gradient(135deg, ${exportColors.bgTopLeft}, ${exportColors.bgMid}, ${exportColors.bgBottomRight})`,
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div
                className="text-xs font-semibold tracking-wide"
                style={{ color: exportColors.muted }}
              >
                Decision Simulator
              </div>
              <div className="mt-2 text-lg font-semibold leading-snug text-black">
                “{data.decision}”
              </div>
              <div className="mt-2 text-xs" style={{ color: exportColors.muted }}>
                Category: <span style={{ color: exportColors.text }}>{data.category}</span>{" "}
                • Confidence:{" "}
                <span style={{ color: exportColors.text }}>{data.confidence_percent}%</span>
              </div>
            </div>
            <div
              className="rounded-2xl px-3 py-2 text-xs"
              style={{ backgroundColor: exportColors.pillBg, color: exportColors.muted }}
            >
              Simulated by decisionsimulator.app
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {(
              [
                [
                  "Best",
                  data.timelines.best,
                  { borderColor: exportColors.bestBorder, backgroundColor: exportColors.bestBg },
                ] as const,
                [
                  "Worst",
                  data.timelines.worst,
                  { borderColor: exportColors.worstBorder, backgroundColor: exportColors.worstBg },
                ] as const,
                [
                  "Wildcard",
                  data.timelines.wildcard,
                  { borderColor: exportColors.wildBorder, backgroundColor: exportColors.wildBg },
                ] as const,
              ] as const
            ).map(([label, t, style]) => (
              <div key={label} className="rounded-2xl border p-4" style={style}>
                <div className="flex items-start justify-between gap-2">
                  <div
                    className="text-xs font-semibold tracking-wide"
                    style={{ color: exportColors.muted }}
                  >
                    {label}
                  </div>
                </div>
                <div className="mt-2 text-sm font-semibold text-black">{t.title}</div>
                <div className="mt-2 text-xs" style={{ color: exportColors.muted }}>
                  {t.verdict}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-[11px]" style={{ color: exportColors.muted2 }}>
            This is comedic simulation output, not real prediction.
          </div>
        </div>
      </div>
    </div>
  );
}

