"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import type { AccessLevel } from "@/types";
import { ACCESS_LEVELS, ACCESS_META, visibilityFor } from "@/lib/consent";
import { AccessGlyph, ACCESS_TEXT } from "./access-badge";
import { AnimatedLock } from "./animated-lock";
import { cn } from "@/lib/utils";

type Tone = "light" | "dark";

const SELECTED: Record<Tone, Record<AccessLevel, string>> = {
  light: {
    open: "border-open bg-open/[0.08]",
    guided: "border-guided bg-guided/[0.1]",
    protected: "border-protected bg-protected/[0.08]",
  },
  dark: {
    open: "border-open/80 bg-open/[0.1]",
    guided: "border-guided/80 bg-guided/[0.1]",
    protected: "border-protected/80 bg-protected/[0.12]",
  },
};

const VISIBILITY_LABELS: { key: "discovery" | "booking" | "ai" | "indexing"; label: string }[] = [
  { key: "discovery", label: "Public discovery" },
  { key: "booking", label: "Booking" },
  { key: "ai", label: "AI description" },
  { key: "indexing", label: "Search indexing" },
];

export function AccessSelector({
  value,
  onChange,
  tone = "light",
  aiAssist = true,
  showExplanation = true,
  label = "Access level",
}: {
  value: AccessLevel;
  onChange: (level: AccessLevel) => void;
  tone?: Tone;
  aiAssist?: boolean;
  showExplanation?: boolean;
  label?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [lockKey, setLockKey] = useState(0);
  const dark = tone === "dark";
  const visibility = visibilityFor(value, aiAssist);

  const select = (level: AccessLevel) => {
    if (level === "protected") setLockKey((k) => k + 1);
    onChange(level);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!delta) return;
    e.preventDefault();
    const next = (index + delta + ACCESS_LEVELS.length) % ACCESS_LEVELS.length;
    select(ACCESS_LEVELS[next]);
    refs.current[next]?.focus();
  };

  return (
    <div>
      <div role="radiogroup" aria-label={label} className="grid gap-3 sm:grid-cols-3">
        {ACCESS_LEVELS.map((level, i) => {
          const selected = value === level;
          const meta = ACCESS_META[level];
          return (
            <button
              key={level}
              ref={(el) => {
                refs.current[i] = el;
              }}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              title={meta.hint}
              onClick={() => select(level)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                "group relative flex min-h-[108px] flex-col items-start justify-between gap-3 overflow-hidden rounded-[4px] border p-4 text-left transition-[border-color,background-color] duration-300",
                selected
                  ? SELECTED[tone][level]
                  : dark
                    ? "border-ivory/12 hover:border-ivory/35 hover:bg-ivory/[0.03]"
                    : "border-ink/12 bg-paper hover:border-ink/35",
              )}
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  <AccessGlyph level={level} className="size-4" />
                  <span className={cn("t-caps", selected ? ACCESS_TEXT[level] : dark ? "text-ivory-dim" : "text-ink-soft")}>{meta.label}</span>
                </span>
                {level === "protected" && selected ? (
                  <span key={lockKey} className="text-protected">
                    <AnimatedLock className="size-6" />
                  </span>
                ) : selected ? (
                  <Check className={cn("size-4", ACCESS_TEXT[level])} aria-hidden />
                ) : null}
              </span>
              <span className={cn("text-[0.86rem] leading-snug", dark ? "text-ivory-dim" : "text-ink-soft")}>{meta.hint}</span>
            </button>
          );
        })}
      </div>

      {showExplanation && (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={value}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "mt-3 rounded-[4px] border p-4 sm:p-5",
              value === "protected"
                ? "border-protected/40 bg-protected/[0.06]"
                : dark
                  ? "border-ivory/10 bg-ivory/[0.02]"
                  : "border-ink/10 bg-paper",
            )}
            aria-live="polite"
          >
            <p className={cn("text-[0.95rem] leading-relaxed", dark ? "text-ivory" : "text-ink")}>{ACCESS_META[value].explanation}</p>
            <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
              {VISIBILITY_LABELS.map(({ key, label: text }) => {
                const on = visibility[key];
                return (
                  <li key={key} className="flex items-center gap-2 text-[0.84rem]">
                    <span
                      className={cn(
                        "grid size-5 shrink-0 place-items-center rounded-full",
                        on ? "bg-open/15 text-open" : "bg-protected/15 text-protected",
                      )}
                    >
                      {on ? <Check className="size-3" strokeWidth={3} aria-hidden /> : <X className="size-3" strokeWidth={3} aria-hidden />}
                    </span>
                    <span className={dark ? "text-ivory-dim" : "text-ink-soft"}>
                      {text}
                      <span className="sr-only">{on ? ": on" : ": off"}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
