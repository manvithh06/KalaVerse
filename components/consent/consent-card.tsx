"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { AccessLevel, ConsentSettings } from "@/types";
import { ACCESS_META, ELIGIBILITY_LABEL, PARTICIPATION_LABEL } from "@/lib/consent";
import { cn, formatDate, formatINR, formatLanguages } from "@/lib/utils";
import { LotusSeal } from "@/components/cultural/ornaments";
import { AccessGlyph, ACCESS_TEXT } from "./access-badge";
import { AnimatedLock } from "./animated-lock";

type RowState = "allowed" | "restricted" | "guided" | "neutral";

interface Row {
  label: string;
  value: string;
  state: RowState;
}

function rowsFor(consent: ConsentSettings, price: number, languages: string[]): Row[] {
  if (consent.accessLevel === "protected") {
    return [
      { label: "PUBLIC DISCOVERY", value: "Off", state: "restricted" },
      { label: "BOOKING", value: "Off", state: "restricted" },
      { label: "COMMERCIAL ACCESS", value: "Off", state: "restricted" },
      { label: "AI DESCRIPTION", value: "Off", state: "restricted" },
      { label: "SEARCH INDEXING", value: "Off", state: "restricted" },
    ];
  }
  const media = (on: boolean): Pick<Row, "value" | "state"> =>
    on ? { value: "Allowed", state: "allowed" } : { value: "Not allowed", state: "restricted" };
  return [
    {
      label: "ACCESS",
      value: consent.accessLevel === "open" ? "Open" : "Guided",
      state: consent.accessLevel === "open" ? "allowed" : "guided",
    },
    { label: "PHOTOGRAPHY", ...media(consent.photography) },
    { label: "VIDEO", ...media(consent.video) },
    { label: "AUDIO RECORDING", ...media(consent.recording) },
    {
      label: "PARTICIPATION",
      value: PARTICIPATION_LABEL[consent.participation],
      state: consent.participation === "allowed" ? "allowed" : consent.participation === "guided" ? "guided" : "restricted",
    },
    { label: "MAXIMUM GROUP", value: String(consent.maxGroup), state: "neutral" },
    { label: "WHO CAN JOIN", value: ELIGIBILITY_LABEL[consent.eligibility], state: "neutral" },
    { label: "LANGUAGE", value: formatLanguages(languages), state: "neutral" },
    { label: "PRICE", value: price > 0 ? formatINR(price) : "Not set", state: "neutral" },
  ];
}

function StateMark({ state }: { state: RowState }) {
  if (state === "neutral") return null;
  if (state === "guided") return <AccessGlyph level="guided" className="size-3" />;
  return (
    <svg viewBox="0 0 16 16" className={cn("size-3", state === "allowed" ? "text-open" : "text-protected")} aria-hidden>
      {state === "allowed" ? (
        <path d="M3 8.5 6.5 12 13 4.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <>
          <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <path d="M3.8 12.2 12.2 3.8" stroke="currentColor" strokeWidth="1.8" />
        </>
      )}
    </svg>
  );
}

function Corners() {
  const base = "pointer-events-none absolute size-3.5 border-gold/55";
  return (
    <>
      <span aria-hidden className={cn(base, "left-2 top-2 border-l border-t")} />
      <span aria-hidden className={cn(base, "right-2 top-2 border-r border-t")} />
      <span aria-hidden className={cn(base, "bottom-2 left-2 border-b border-l")} />
      <span aria-hidden className={cn(base, "bottom-2 right-2 border-b border-r")} />
    </>
  );
}

function Seal({ level }: { level: AccessLevel }) {
  return (
    <div className="relative grid size-16 shrink-0 place-items-center">
      <AnimatePresence mode="wait" initial={false}>
        {level === "protected" ? (
          <motion.div
            key="lock"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.35 }}
            className="text-protected"
          >
            <AnimatedLock className="size-12" />
          </motion.div>
        ) : (
          <motion.div
            key="seal"
            initial={{ opacity: 0, rotate: -30 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 30 }}
            transition={{ duration: 0.5 }}
            className="text-gold/70"
          >
            <LotusSeal className="size-16" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ConsentCard({
  consent,
  price,
  languages,
  custodianName,
  compact = false,
  className,
}: {
  consent: ConsentSettings;
  price: number;
  languages: string[];
  custodianName?: string;
  compact?: boolean;
  className?: string;
}) {
  const level = consent.accessLevel;
  const meta = ACCESS_META[level];
  const rows = rowsFor(consent, price, languages);

  return (
    <section
      aria-label="Cultural consent terms"
      className={cn(
        "relative overflow-hidden bg-night-2 text-ivory shadow-[0_30px_80px_-30px_rgb(0_0_0/0.7)] texture-weave",
        compact ? "p-5" : "p-6 sm:p-7",
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 border border-ivory/10" />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full blur-3xl"
        animate={{
          backgroundColor:
            level === "open" ? "rgb(94 156 117 / 0.16)" : level === "guided" ? "rgb(207 159 74 / 0.16)" : "rgb(180 73 79 / 0.2)",
        }}
        transition={{ duration: 0.6 }}
      />
      <Corners />

      <header className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="t-caps text-ash">Cultural consent</p>
          <div className="mt-4 flex items-center gap-2.5">
            <AccessGlyph level={level} className="size-5" />
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={level}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}
                className={cn("t-title leading-none", ACCESS_TEXT[level])}
              >
                {meta.label}
              </motion.span>
            </AnimatePresence>
          </div>
          <p className="mt-2 text-[0.875rem] text-ivory-dim">{meta.hint}</p>
        </div>
        <Seal level={level} />
      </header>

      <div className="relative my-5 text-gold">
        <div className="kasuti-rule" />
      </div>

      <dl className="relative">
        {rows.map((row) => (
          <div
            key={row.label}
            className={cn("flex items-baseline justify-between gap-4 border-b border-dashed border-ivory/[0.09] last:border-b-0", compact ? "py-2" : "py-2.5")}
          >
            <dt className="t-caps shrink-0 text-ash">{row.label}</dt>
            <dd className="flex min-w-0 items-center justify-end gap-2 text-right text-[0.95rem] leading-tight">
              <StateMark state={row.state} />
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={row.value}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.22 }}
                  className={cn(row.state === "restricted" && level !== "protected" && "text-ivory")}
                >
                  {row.value}
                </motion.span>
              </AnimatePresence>
            </dd>
          </div>
        ))}
      </dl>

      <footer className="relative mt-5 border-t border-ivory/10 pt-4">
        <p className="font-serif text-[1rem] italic leading-snug text-ivory-dim">
          {level === "protected"
            ? "Only the custodian can change these terms. Platform administrators cannot override them."
            : "These terms were defined by the cultural custodian."}
        </p>
        {custodianName && (
          <div className="mt-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-1 text-[0.8rem] text-ash">
            <span className="font-serif text-[0.95rem] italic text-ivory">{custodianName}</span>
            <span>
              Version {consent.termsVersion}, updated {formatDate(consent.updatedAt)}
            </span>
          </div>
        )}
      </footer>
    </section>
  );
}
