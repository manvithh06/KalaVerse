"use client";

import { motion } from "framer-motion";
import type { TrustLevel } from "@/types";
import { TRUST_LEVELS } from "@/data/trust";
import { cn } from "@/lib/utils";

const LEVEL_TONE: Record<TrustLevel, string> = {
  1: "text-ivory border-ivory/30",
  2: "text-gold-light border-gold/45",
  3: "text-gold-light border-gold-light/55",
  4: "text-[#f1d9a0] border-[#f1d9a0]/60",
};

const LEVEL_TONE_LIGHT: Record<TrustLevel, string> = {
  1: "text-forest-2 border-forest-2/35",
  2: "text-gold-deep border-gold/50",
  3: "text-gold-deep border-gold-deep/55",
  4: "text-maroon-2 border-maroon-2/45",
};

export function TrustBadge({
  level,
  tone = "dark",
  size = "md",
  className,
}: {
  level: TrustLevel;
  tone?: "dark" | "light";
  size?: "sm" | "md";
  className?: string;
}) {
  const info = TRUST_LEVELS[level];
  return (
    <span
      className={cn(
        "relative inline-flex items-center gap-2 overflow-hidden rounded-full border font-sans font-semibold uppercase tracking-[0.14em] [font-stretch:88%]",
        tone === "dark" ? LEVEL_TONE[level] : LEVEL_TONE_LIGHT[level],
        size === "sm" ? "h-7 px-2.5 text-[0.62rem]" : "h-8 px-3 text-[0.68rem]",
        className,
      )}
    >
      <span aria-hidden className="text-[1.05em] leading-none">
        {info.glyph}
      </span>
      {info.title}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 w-10 -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent"
        initial={{ left: "-30%" }}
        animate={{ left: "130%" }}
        transition={{ duration: 1.3, delay: 0.5, ease: "easeInOut" }}
      />
    </span>
  );
}

/** Medallion used on the trust ladder. */
export function TrustMedallion({ level, active, className }: { level: TrustLevel; active: boolean; className?: string }) {
  const info = TRUST_LEVELS[level];
  return (
    <span
      className={cn(
        "relative grid size-14 place-items-center rounded-full border text-xl transition-colors duration-500",
        active ? "border-gold-light/70 bg-gold/15 text-gold-light" : "border-ivory/15 text-ash",
        className,
      )}
    >
      {active && (
        <span aria-hidden className="absolute inset-0 rounded-full border border-gold-light/40 motion-safe:animate-[pulse-ring_2.8s_ease-out_infinite]" />
      )}
      <span aria-hidden>{info.glyph}</span>
    </span>
  );
}
