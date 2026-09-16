"use client";

import { motion } from "framer-motion";
import type { AccessLevel } from "@/types";
import { ACCESS_META } from "@/lib/consent";
import { KireetaRings } from "@/components/cultural/ornaments";
import { AccessGlyph, ACCESS_BG, ACCESS_TEXT } from "./access-badge";
import { AnimatedLock } from "./animated-lock";
import { cn } from "@/lib/utils";

const CARDS: { level: AccessLevel; examples: string }[] = [
  { level: "open", examples: "Crafts, cooking and workshops that custodians want the world to find." },
  { level: "guided", examples: "Performances, fields and family homes, entered only on the custodian's terms." },
  { level: "protected", examples: "Sacred and private practices. Never listed, sold or described by AI." },
];

const WASH: Record<AccessLevel, string> = {
  open: "radial-gradient(90% 70% at 85% 10%, rgb(94 156 117 / 0.16), transparent 60%)",
  guided: "radial-gradient(90% 70% at 85% 10%, rgb(207 159 74 / 0.15), transparent 60%)",
  protected: "radial-gradient(90% 70% at 85% 10%, rgb(180 73 79 / 0.2), transparent 60%)",
};

function Visual({ level }: { level: AccessLevel }) {
  if (level === "open") {
    return (
      <div className="absolute -right-16 -top-16 size-72 text-open/25 transition-transform duration-[1.2s] ease-[var(--ease-kalaverse)] group-hover:scale-110">
        <KireetaRings rings={3} studs={28} spin />
      </div>
    );
  }
  if (level === "guided") {
    return (
      <svg viewBox="0 0 240 240" className="absolute -right-6 -top-4 size-64 text-guided/40" aria-hidden fill="none">
        <path
          d="M10 220 C60 200 40 150 100 130 C160 110 130 60 200 30"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="2 10"
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-[1.6s] ease-out group-hover:[stroke-dashoffset:-60]"
        />
        {[
          [10, 220],
          [100, 130],
          [200, 30],
        ].map(([x, y]) => (
          <circle key={x} cx={x} cy={y} r="5" fill="currentColor" />
        ))}
      </svg>
    );
  }
  return (
    <div className="absolute -right-10 -top-10 grid size-72 place-items-center">
      <KireetaRings rings={5} studs={40} className="absolute inset-0 text-protected/20 transition-transform duration-700 group-hover:scale-95" />
      <motion.div
        className="text-protected/80"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "0px 0px -20% 0px" }}
      >
        <AnimatedLock className="size-20" strokeWidth={1.6} />
      </motion.div>
    </div>
  );
}

export function BoundaryCards() {
  return (
    <div className="grid gap-px overflow-hidden bg-ivory/10 lg:grid-cols-3">
      {CARDS.map(({ level, examples }) => {
        const meta = ACCESS_META[level];
        return (
          <article
            key={level}
            tabIndex={0}
            aria-label={`${meta.label}. ${meta.imperative} ${meta.summary}`}
            className="group relative flex min-h-[440px] flex-col justify-end overflow-hidden bg-night p-7 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold-light sm:p-10 lg:min-h-[600px]"
            style={{ backgroundImage: WASH[level] }}
          >
            <Visual level={level} />
            <div className="relative">
              <div className="flex items-center gap-2.5">
                <AccessGlyph level={level} className="size-5" />
                <span className={cn("t-caps", ACCESS_TEXT[level])}>{meta.label}</span>
              </div>
              <h3 className="mt-6 font-titling text-[clamp(2.2rem,3.9vw,3.7rem)] uppercase leading-[0.96] text-ivory">{meta.imperative}</h3>
              <p className="mt-6 text-[1.08rem] text-ivory">{meta.summary}</p>
              <p className="mt-2 max-w-sm text-[0.95rem] leading-relaxed text-ivory-dim">{examples}</p>
              <p className="mt-8 flex items-center gap-3 text-[0.85rem] text-ash">
                <span className={cn("h-px w-8 transition-[width] duration-500 group-hover:w-16 group-focus-visible:w-16", ACCESS_BG[level])} />
                <span className="transition-colors group-hover:text-ivory group-focus-visible:text-ivory">{meta.hint}</span>
              </p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
