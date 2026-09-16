"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Play, RotateCcw, ShieldAlert, X } from "lucide-react";
import { AUTHORITIES, PERMISSIONS, WORKFLOW } from "@/data/governance";
import { AnimatedLock } from "@/components/consent/animated-lock";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Tone = "dark" | "light";

export function AuthorityGrid({ tone = "dark" }: { tone?: Tone }) {
  const dark = tone === "dark";
  return (
    <div className={cn("grid gap-px overflow-hidden border sm:grid-cols-2 lg:grid-cols-4", dark ? "border-ivory/10 bg-ivory/10" : "border-ink/10 bg-ink/10")}>
      {AUTHORITIES.map((a) => (
        <div key={a.id} className={cn("flex min-h-64 flex-col p-6 sm:p-7", dark ? "bg-night" : "bg-paper")}>
          <div className="flex items-start justify-between gap-4">
            <h3 className="t-subtitle max-w-[12rem]">{a.name}</h3>
            <span
              className={cn(
                "grid size-12 shrink-0 place-items-center rounded-full border-2",
                a.shapesCulture ? "border-open text-open" : "border-protected text-protected",
              )}
              aria-label={a.shapesCulture ? "Has cultural authority" : "No cultural authority"}
            >
              {a.shapesCulture ? <Check className="size-6" strokeWidth={2.6} /> : <X className="size-6" strokeWidth={2.6} />}
            </span>
          </div>
          <p className={cn("mt-auto pt-10 text-[0.95rem] leading-relaxed", dark ? "text-ivory-dim" : "text-ink-soft")}>{a.role}</p>
        </div>
      ))}
    </div>
  );
}

export function WorkflowStepper({ tone = "dark" }: { tone?: Tone }) {
  const dark = tone === "dark";
  const [active, setActive] = useState(-1);
  const [running, setRunning] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  function run() {
    timers.current.forEach((t) => window.clearTimeout(t));
    setRunning(true);
    setActive(0);
    WORKFLOW.forEach((_, i) => {
      if (i === 0) return;
      timers.current.push(window.setTimeout(() => setActive(i), i * 1300));
    });
    timers.current.push(window.setTimeout(() => setRunning(false), WORKFLOW.length * 1300));
  }

  return (
    <div>
      <ol className="relative">
        {WORKFLOW.map((step, i) => {
          const reached = active >= i;
          const current = active === i;
          return (
            <li key={step.id} className="relative">
              <div
                className={cn(
                  "grid gap-3 border-l-2 py-6 pl-6 transition-colors duration-500 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] sm:gap-10 sm:pl-10",
                  reached ? "border-gold-light" : dark ? "border-ivory/12" : "border-ink/12",
                )}
              >
                <div>
                  <p className={cn("text-[0.78rem]", dark ? "text-ash" : "text-ink-faint")}>Step {i + 1}</p>
                  <h3
                    className={cn(
                      "mt-1 font-titling text-[clamp(1.6rem,3vw,2.5rem)] uppercase leading-none transition-colors duration-500",
                      reached ? (dark ? "text-ivory" : "text-ink") : dark ? "text-ivory/35" : "text-ink/35",
                    )}
                  >
                    {step.title}
                  </h3>
                </div>
                <div>
                  <p className={cn("text-[0.98rem] leading-relaxed", dark ? "text-ivory-dim" : "text-ink-soft")}>{step.detail}</p>
                  <AnimatePresence>
                    {current && (
                      <motion.p
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={cn("mt-3 font-serif text-[1rem] italic", dark ? "text-gold-light" : "text-gold-deep")}
                      >
                        {step.example}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              {i < WORKFLOW.length - 1 && (
                <span aria-hidden className={cn("absolute -bottom-2.5 left-[-7px] text-lg leading-none", reached && active > i ? "text-gold-light" : dark ? "text-ivory/30" : "text-ink/30")}>
                  ↓
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button variant={dark ? "outline" : "outline-ink"} onClick={run} disabled={running}>
          {active >= WORKFLOW.length - 1 && !running ? <RotateCcw aria-hidden /> : <Play aria-hidden />}
          {active >= WORKFLOW.length - 1 && !running ? "Walk it through again" : "Walk a listing through review"}
        </Button>
        <p aria-live="polite" className={cn("text-[0.85rem]", dark ? "text-ash" : "text-ink-faint")}>
          {active >= 0 ? `${WORKFLOW[active].title}${active === WORKFLOW.length - 1 && !running ? ": published as approved" : ""}` : ""}
        </p>
      </div>
    </div>
  );
}

export function PermissionMatrix({ tone = "dark" }: { tone?: Tone }) {
  const dark = tone === "dark";
  const cols = ["custodian", "endorser", "organization", "admin"] as const;
  const heads = ["Custodian", "Community endorser", "Cultural organization", "Platform admin"];
  return (
    <div className={cn("overflow-x-auto border", dark ? "border-ivory/10" : "border-ink/10")}>
      <table className="w-full min-w-[720px] border-collapse text-left">
        <caption className="sr-only">Who can do what on Kalaverse</caption>
        <thead>
          <tr className={dark ? "bg-night-2" : "bg-paper"}>
            <th scope="col" className={cn("p-4 text-[0.82rem] font-medium", dark ? "text-ash" : "text-ink-faint")}>
              Action
            </th>
            {heads.map((h) => (
              <th key={h} scope="col" className={cn("p-4 text-center text-[0.82rem] font-medium", dark ? "text-ivory" : "text-ink")}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERMISSIONS.map((p) => (
            <tr key={p.action} className={cn("border-t", dark ? "border-ivory/[0.07]" : "border-ink/[0.07]", p.action.startsWith("Override") && (dark ? "bg-protected/[0.06]" : "bg-protected/[0.05]"))}>
              <th scope="row" className="p-4 align-top font-normal">
                <span className={cn("text-[0.95rem]", dark ? "text-ivory" : "text-ink")}>{p.action}</span>
                {p.note && <span className={cn("mt-1 block text-[0.8rem]", dark ? "text-ash" : "text-ink-faint")}>{p.note}</span>}
              </th>
              {cols.map((c) => (
                <td key={c} className="p-4 text-center align-top">
                  {p[c] ? (
                    <Check className="mx-auto size-5 text-open" strokeWidth={2.6} aria-label="Allowed" />
                  ) : (
                    <X className={cn("mx-auto size-5", c === "admin" ? "text-protected" : dark ? "text-ivory/25" : "text-ink/25")} strokeWidth={2.4} aria-label="Not allowed" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function OverrideAttempt({ tone = "dark" }: { tone?: Tone }) {
  const dark = tone === "dark";
  const [attempted, setAttempted] = useState(false);
  return (
    <div className={cn("relative overflow-hidden border p-6 sm:p-8", dark ? "border-protected/30 bg-vault text-ivory" : "border-protected/30 bg-night text-ivory")}>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-xl">
          <p className="flex items-center gap-2 text-[0.85rem] text-protected">
            <ShieldAlert className="size-4" aria-hidden />
            Admin console, simulated
          </p>
          <h3 className="t-subtitle mt-3">Change &ldquo;Sacred / Restricted Practice&rdquo; from protected to open</h3>
          <p className="mt-2 text-[0.92rem] text-ivory-dim">See what happens when the platform tries to overrule a custodian.</p>
        </div>
        <Button variant="protected" caps onClick={() => setAttempted(true)} disabled={attempted}>
          Attempt override
        </Button>
      </div>
      <AnimatePresence>
        {attempted && (
          <motion.div
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-6 flex gap-4 border-t border-ivory/10 pt-6">
              <span className="text-protected">
                <AnimatedLock className="size-10" />
              </span>
              <div>
                <p className="font-sans text-[0.78rem] font-bold uppercase tracking-[0.18em] text-protected">Override refused</p>
                <p className="mt-2 max-w-xl text-[0.95rem] leading-relaxed text-ivory">
                  Protection can only be changed by the custodian, with community consent. Platform administrators have no control for it,
                  so there is nothing to approve and nothing to bypass.
                </p>
                <button type="button" onClick={() => setAttempted(false)} className="mt-4 text-[0.85rem] text-ash underline underline-offset-4 hover:text-ivory">
                  Reset simulation
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PlatformStatement({ tone = "dark", className }: { tone?: Tone; className?: string }) {
  return (
    <p className={cn("t-headline", tone === "dark" ? "text-ivory" : "text-ink", className)}>
      <span className="block">The platform facilitates access.</span>
      <span className={cn("block", tone === "dark" ? "text-gold-light" : "text-gold-deep")}>It does not own the cultural narrative.</span>
    </p>
  );
}

export function GovernanceView({ tone = "dark" }: { tone?: Tone }) {
  const dark = tone === "dark";
  return (
    <div className={cn(dark ? "bg-night text-ivory" : "text-ink")}>
      <header className={cn("page-gutter mx-auto max-w-[1280px]", dark ? "pb-16 pt-32 lg:pt-40" : "pb-12 pt-10 lg:pt-14")}>
        <h1 className="t-headline">
          Community
          <br />
          governance
        </h1>
        <p className={cn("t-voice mt-6 max-w-2xl", dark ? "text-ivory-dim" : "text-ink-soft")}>
          Kalaverse hosts culture. It does not decide what a practice means, who may share it, or what must stay protected.
        </p>
      </header>

      <section aria-labelledby="gov-authority" className="page-gutter mx-auto max-w-[1280px] pb-20">
        <h2 id="gov-authority" className={cn("mb-6 text-[0.95rem] font-medium", dark ? "text-ivory-dim" : "text-ink-soft")}>
          Who holds cultural authority
        </h2>
        <AuthorityGrid tone={tone} />
      </section>

      <section aria-labelledby="gov-flow" className={cn("border-y", dark ? "border-ivory/[0.08] bg-night-2" : "border-ink/[0.08] bg-paper")}>
        <div className="page-gutter mx-auto grid max-w-[1280px] gap-12 py-20 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div>
            <h2 id="gov-flow" className="t-title">
              How a listing
              <br />
              goes live
            </h2>
            <p className={cn("mt-5 max-w-sm leading-relaxed", dark ? "text-ivory-dim" : "text-ink-soft")}>
              Every listing passes through the custodian&apos;s own community before anyone else sees it.
            </p>
          </div>
          <WorkflowStepper tone={tone} />
        </div>
      </section>

      <section className="page-gutter mx-auto max-w-[1280px] py-24">
        <PlatformStatement tone={tone} />
      </section>

      <section aria-labelledby="gov-matrix" className="page-gutter mx-auto max-w-[1280px] space-y-8 pb-24">
        <h2 id="gov-matrix" className="t-title">
          Who can do what
        </h2>
        <PermissionMatrix tone={tone} />
        <OverrideAttempt tone={tone} />
      </section>
    </div>
  );
}
