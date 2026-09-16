"use client";

import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { AnimatedLock } from "@/components/consent/animated-lock";
import { AccessBadge } from "@/components/consent/access-badge";
import { cn } from "@/lib/utils";

/** A switch that is visibly off and cannot be turned on from here. */
export function LockedSetting({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3" role="img" aria-label={`${label}: off, locked by protection`}>
      <span className="t-caps text-ash">{label}</span>
      <span className="flex items-center gap-2.5">
        <span className="text-[0.72rem] font-bold tracking-[0.16em] text-protected">OFF</span>
        <span className="relative inline-flex h-6 w-11 items-center rounded-full border border-protected/35 bg-protected/10">
          <span className="ml-[3px] grid size-[18px] place-items-center rounded-full bg-ivory/15">
            <Lock className="size-2.5 text-protected" aria-hidden />
          </span>
        </span>
      </span>
    </div>
  );
}

/**
 * A sealed record. Its entrance plays on mount rather than on scroll, so the card is
 * always visible by the time anyone reaches it, including in captures and print.
 */
export function SealedRecord({
  title,
  note,
  index = 0,
  footer,
  children,
  className,
}: {
  title: string;
  note: string;
  index?: number;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <article
      className={cn(
        "relative flex flex-col overflow-hidden border border-open/[0.14] bg-vault-2 p-6 animate-[rise-in_600ms_var(--ease-kalaverse)_both]",
        className,
      )}
      style={{ animationDelay: `${index * 110}ms` }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{ backgroundImage: "repeating-linear-gradient(135deg, rgb(94 156 117 / 0.035) 0 1px, transparent 1px 9px)" }}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3.5">
          <span className="grid size-12 shrink-0 place-items-center rounded-full border border-protected/35 text-protected">
            <AnimatedLock className="size-7" />
          </span>
          <div className="min-w-0">
            <h3 className="text-[1.02rem] font-medium leading-snug text-ivory">{title}</h3>
            <p className="mt-0.5 text-[0.8rem] text-ash">{note}</p>
          </div>
        </div>
        <AccessBadge level="protected" size="sm" hint={false} className="shrink-0" />
      </div>
      <div aria-hidden className="relative mt-6 space-y-2.5">
        {[92, 70, 81].map((w) => (
          <div key={w} className="h-2 rounded-full bg-ivory/[0.06]" style={{ width: `${w}%` }} />
        ))}
      </div>
      <p className="relative mt-3 text-[0.78rem] text-ash">Contents are not stored on Kalaverse.</p>
      {children && <div className="relative mt-4">{children}</div>}
      {footer && <div className="relative mt-5 border-t border-ivory/[0.08] pt-4">{footer}</div>}
    </article>
  );
}
