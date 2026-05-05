"use client";

import type { HistoryItem } from "@/lib/storage";

export function HistoryDrawer(props: {
  items: HistoryItem[];
  onPick: (item: HistoryItem) => void;
  onClear: () => void;
}) {
  const has = props.items.length > 0;

  return (
    <div className="w-full rounded-[2rem] border border-white/30 bg-white/20 backdrop-blur-md p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold tracking-wide text-black">
            Recent decisions
          </div>
          <div className="text-xs text-black/60">
            Saved on this device (last 5)
          </div>
        </div>
        <button
          type="button"
          className="text-xs font-medium text-black/70 hover:text-black disabled:opacity-50 transition-colors"
          onClick={props.onClear}
          disabled={!has}
        >
          Clear
        </button>
      </div>

      {!has ? (
        <div className="mt-3 text-sm text-black/70">
          No history yet. Make one questionable choice and it'll appear here.
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {props.items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => props.onPick(item)}
                className="w-full rounded-xl border border-black/10 bg-white/80 px-3 py-2 text-left text-sm text-black hover:bg-white transition-colors"
              >
                <div className="line-clamp-2">{item.decision}</div>
                <div className="mt-1 text-xs text-black/60">
                  {item.roastMode ? "Roast: ON" : "Roast: OFF"}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

