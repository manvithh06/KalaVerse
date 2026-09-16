"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { KireetaRings } from "./ornaments";
import { AnimatedLock } from "@/components/consent/animated-lock";

type Tone = "dark" | "light";

export function KireetaLoader({ label, tone = "dark", className }: { label: string; tone?: Tone; className?: string }) {
  return (
    <div role="status" aria-live="polite" className={cn("flex flex-col items-center gap-4 py-10", className)}>
      <div className="relative size-16">
        <KireetaRings spin rings={3} studs={24} className={cn("absolute inset-0", tone === "dark" ? "text-gold/70" : "text-gold-deep/70")} />
        <span className={cn("absolute inset-[38%] rounded-full motion-safe:animate-breathe", tone === "dark" ? "bg-gold-light/80" : "bg-gold/80")} />
      </div>
      <p className={cn("t-label", tone === "dark" ? "text-ash" : "text-ink-faint")}>{label}</p>
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
  icon,
  tone = "dark",
  className,
}: {
  title: string;
  body?: ReactNode;
  action?: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center px-6 py-14 text-center",
        tone === "dark" ? "text-ivory" : "text-ink",
        className,
      )}
    >
      {icon && (
        <div
          className={cn(
            "mb-5 grid size-14 place-items-center rounded-full border",
            tone === "dark" ? "border-ivory/15 text-gold-light" : "border-ink/15 text-gold-deep",
          )}
        >
          {icon}
        </div>
      )}
      <h3 className="t-subtitle max-w-md">{title}</h3>
      {body && (
        <p className={cn("mt-3 max-w-md text-[0.95rem] leading-relaxed", tone === "dark" ? "text-ivory-dim" : "text-ink-soft")}>
          {body}
        </p>
      )}
      {action && <div className="mt-6 flex flex-wrap justify-center gap-3">{action}</div>}
    </div>
  );
}

/** Shown wherever a visitor reaches something a custodian has protected. Reveals nothing about it. */
export function ProtectedNotice({
  title = "Protected by its custodian",
  body = "This practice is kept within its community. It is not listed, cannot be booked and is not described here.",
  action,
  className,
}: {
  title?: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-vault px-6 py-16 text-center text-ivory grain sm:px-10", className)}>
      <KireetaRings rings={5} studs={48} className="pointer-events-none absolute left-1/2 top-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 text-open/[0.07]" />
      <div className="relative mx-auto flex max-w-lg flex-col items-center">
        <div className="text-protected">
          <AnimatedLock className="size-14" />
        </div>
        <p className="t-caps mt-6 text-protected">Protected</p>
        <h2 className="t-title mt-3">{title}</h2>
        <p className="mt-4 text-ivory-dim">{body}</p>
        {action && <div className="mt-8 flex flex-wrap justify-center gap-3">{action}</div>}
      </div>
    </div>
  );
}
