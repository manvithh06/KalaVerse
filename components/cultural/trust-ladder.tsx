"use client";

import { motion } from "framer-motion";
import type { TrustLevel } from "@/types";
import { TRUST_DISCLAIMER, TRUST_LEVELS } from "@/data/trust";
import { cn } from "@/lib/utils";
import { TrustMedallion } from "./trust-badge";

const LEVELS: TrustLevel[] = [1, 2, 3, 4];

export function TrustLadder({
  current,
  tone = "dark",
  className,
}: {
  current?: TrustLevel;
  tone?: "dark" | "light";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div className={className}>
      <ol className="relative grid gap-9 md:grid-cols-4 md:gap-6">
        <span
          aria-hidden
          className={cn("absolute bottom-7 left-7 top-7 w-px md:bottom-auto md:left-7 md:right-7 md:h-px md:w-auto", dark ? "bg-ivory/12" : "bg-ink/12")}
        />
        {current && current > 1 && (
          <motion.span
            aria-hidden
            className="absolute left-7 top-7 hidden h-px origin-left bg-gold-light md:block"
            style={{ width: `calc(${(current - 1) / 3} * (100% - 3.5rem))` }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
        {LEVELS.map((level, i) => {
          const info = TRUST_LEVELS[level];
          const reached = current ? level <= current : true;
          const isCurrent = current === level;
          return (
            <li
              key={level}
              className="relative flex animate-[rise-in_600ms_var(--ease-kalaverse)_both] gap-5 md:flex-col md:gap-5"
              style={{ animationDelay: `${i * 110}ms` }}
              aria-current={isCurrent ? "step" : undefined}
            >
              <TrustMedallion
                level={level}
                active={reached}
                className={cn(!dark && !reached && "border-ink/15 text-ink-faint", !dark && reached && "border-gold/60 text-gold-deep")}
              />
              <div className="min-w-0">
                <p className={cn("text-[0.78rem]", dark ? "text-ash" : "text-ink-faint")}>
                  Level {level}
                  {isCurrent && <span className={cn("ml-2 font-semibold", dark ? "text-gold-light" : "text-gold-deep")}>Current</span>}
                </p>
                <h3 className="t-subtitle mt-2">
                  <span aria-hidden className="mr-1.5">
                    {info.glyph}
                  </span>
                  {info.title}
                </h3>
                <p className={cn("mt-1.5 text-[0.9rem] font-medium", dark ? "text-gold-light" : "text-gold-deep")}>{info.basis}</p>
                <p className={cn("mt-2 text-[0.9rem] leading-relaxed", dark ? "text-ivory-dim" : "text-ink-soft")}>{info.description}</p>
              </div>
            </li>
          );
        })}
      </ol>
      <p className={cn("mt-10 max-w-2xl font-serif text-[1.05rem] italic leading-relaxed", dark ? "text-ivory-dim" : "text-ink-soft")}>
        {TRUST_DISCLAIMER}
      </p>
    </div>
  );
}
