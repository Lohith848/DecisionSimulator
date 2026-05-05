"use client";

import { useId } from "react";

export function RoastToggle(props: {
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className="inline-flex items-center gap-3 select-none text-white"
    >
      <span className="text-sm font-medium">
        Roast mode
      </span>
      <button
        type="button"
        onClick={() => props.onChange(!props.value)}
        className={[
          "relative h-7 w-12 rounded-full border transition-colors duration-300",
          props.value
            ? "bg-fuchsia-600 border-fuchsia-500"
            : "bg-zinc-700 border-zinc-600 hover:border-zinc-500",
        ].join(" ")}
        aria-pressed={props.value}
        aria-labelledby={id}
      >
        <span
          className={[
            "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform duration-300",
            props.value ? "translate-x-5" : "translate-x-0.5",
          ].join(" ")}
        />
      </button>
      <input
        id={id}
        type="checkbox"
        checked={props.value}
        onChange={(e) => props.onChange(e.target.checked)}
        className="sr-only"
      />
    </label>
  );
}

