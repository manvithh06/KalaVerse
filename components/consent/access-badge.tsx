"use client";

import { Lock } from "lucide-react";
import type { AccessLevel } from "@/types";
import { ACCESS_META } from "@/lib/consent";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export const ACCESS_TEXT: Record<AccessLevel, string> = {
  open: "text-open",
  guided: "text-guided",
  protected: "text-protected",
};

export const ACCESS_BG: Record<AccessLevel, string> = {
  open: "bg-open",
  guided: "bg-guided",
  protected: "bg-protected",
};

export const ACCESS_BORDER: Record<AccessLevel, string> = {
  open: "border-open/45",
  guided: "border-guided/45",
  protected: "border-protected/50",
};

/** Open ring, half-filled ring, sealed disc: legible without colour. */
export function AccessGlyph({ level, className }: { level: AccessLevel; className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={cn("size-3.5", ACCESS_TEXT[level], className)} aria-hidden>
      {level === "open" && (
        <>
          <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="8" cy="8" r="2" fill="currentColor" />
        </>
      )}
      {level === "guided" && (
        <>
          <circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 1.8a6.2 6.2 0 0 1 0 12.4Z" fill="currentColor" />
        </>
      )}
      {level === "protected" && (
        <>
          <circle cx="8" cy="8" r="7" fill="currentColor" />
          <rect x="5.4" y="7.4" width="5.2" height="4" rx="0.8" fill="var(--color-night)" />
          <path d="M6.3 7.4V6.2a1.7 1.7 0 0 1 3.4 0v1.2" fill="none" stroke="var(--color-night)" strokeWidth="1.1" />
        </>
      )}
    </svg>
  );
}

/** Darker steps of each state hue, for badges on light grounds (≥ 4.5:1 on paper). */
const ACCESS_TEXT_ON_LIGHT: Record<AccessLevel, string> = {
  open: "text-forest-2",
  guided: "text-gold-deep",
  protected: "text-maroon-2",
};

export function AccessBadge({
  level,
  size = "md",
  hint = true,
  tone = "dark",
  className,
}: {
  level: AccessLevel;
  size?: "sm" | "md" | "lg";
  hint?: boolean;
  tone?: "dark" | "light";
  className?: string;
}) {
  const meta = ACCESS_META[level];
  const text = tone === "light" ? ACCESS_TEXT_ON_LIGHT[level] : ACCESS_TEXT[level];
  const badge = (
    <span
      tabIndex={hint ? 0 : undefined}
      aria-label={hint ? `${meta.label}: ${meta.hint}` : undefined}
      className={cn(
        "inline-flex w-fit select-none items-center gap-1.5 self-start rounded-full border font-sans font-semibold uppercase tracking-[0.16em] [font-stretch:88%]",
        tone === "light" ? "bg-paper" : "bg-night/40",
        ACCESS_BORDER[level],
        text,
        size === "sm" && "h-6 px-2 text-[0.62rem]",
        size === "md" && "h-7 px-2.5 text-[0.66rem]",
        size === "lg" && "h-9 px-3.5 text-[0.74rem]",
        hint && "cursor-help",
        className,
      )}
    >
      <AccessGlyph level={level} className={size === "lg" ? "size-4" : undefined} />
      {meta.label}
    </span>
  );
  if (!hint) return badge;
  return (
    <Tooltip
      content={
        <span className="flex items-center gap-1.5">
          {level === "protected" && <Lock className="size-3.5" aria-hidden />}
          {meta.hint}
        </span>
      }
    >
      {badge}
    </Tooltip>
  );
}
