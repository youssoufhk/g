"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export type WindowPresetValue =
  | "1w"
  | "2w"
  | "1m"
  | "3m"
  | "6m"
  | "9m"
  | "12m"
  | "18m";

export const WINDOW_PRESETS: { value: WindowPresetValue; label: string; weeks: number }[] = [
  { value: "1w",  label: "1 week",    weeks: 1 },
  { value: "2w",  label: "2 weeks",   weeks: 2 },
  { value: "1m",  label: "1 month",   weeks: 4 },
  { value: "3m",  label: "3 months",  weeks: 13 },
  { value: "6m",  label: "6 months",  weeks: 26 },
  { value: "9m",  label: "9 months",  weeks: 39 },
  { value: "12m", label: "12 months", weeks: 52 },
  { value: "18m", label: "18 months", weeks: 78 },
];

export function weeksFor(value: WindowPresetValue): number {
  return WINDOW_PRESETS.find((p) => p.value === value)?.weeks ?? 8;
}

type Props = {
  value: WindowPresetValue;
  onChange: (v: WindowPresetValue) => void;
  label?: string;
};

export function TimelineWindowSelector({ value, onChange, label = "Window" }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const current = WINDOW_PRESETS.find((p) => p.value === value) ?? WINDOW_PRESETS[2]!;

  return (
    <div className="tw-selector-wrap" ref={ref}>
      <button
        type="button"
        className="tw-selector-pill"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${current.label}`}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="tw-selector-pill-label">{label}</span>
        <span className="tw-selector-pill-value">{current.label}</span>
        <ChevronDown size={16} />
      </button>

      {open && (
        <div className="tw-selector-panel" role="listbox" aria-label={label}>
          {WINDOW_PRESETS.map((p) => {
            const active = p.value === value;
            return (
              <button
                key={p.value}
                type="button"
                role="option"
                aria-selected={active}
                className="tw-selector-option"
                data-active={active ? "true" : undefined}
                onClick={() => {
                  onChange(p.value);
                  setOpen(false);
                }}
              >
                <span className="tw-selector-option-check" aria-hidden>
                  {active && <Check size={12} />}
                </span>
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
