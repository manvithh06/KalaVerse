"use client";

import type { ComponentProps, ReactNode } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function WorkspaceHeader({
  title,
  lead,
  actions,
  className,
}: {
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("page-gutter mx-auto max-w-[1280px] pb-8 pt-8 lg:pt-12", className)}>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="min-w-0">
          <h1 className="font-titling text-[clamp(2.1rem,4.4vw,3.8rem)] uppercase leading-[0.95]">{title}</h1>
          {lead && <p className="mt-4 max-w-2xl text-[1.02rem] leading-relaxed opacity-80">{lead}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </header>
  );
}

export function WorkspaceBody({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("page-gutter mx-auto max-w-[1280px] pb-20", className)} {...props} />;
}

export function WorkspaceSkeleton({ tone = "light" }: { tone?: "light" | "dark" }) {
  return (
    <div className="page-gutter mx-auto max-w-[1280px] space-y-6 py-12" role="status" aria-label="Loading your workspace">
      <Skeleton tone={tone} className="h-14 w-2/3 max-w-lg" />
      <Skeleton tone={tone} className="h-5 w-full max-w-xl" />
      <div className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} tone={tone} className="h-36" />
        ))}
      </div>
      <Skeleton tone={tone} className="h-72" />
    </div>
  );
}

/** Ring meter for a single percentage. */
export function RingMeter({ value, size = 76, className }: { value: number; size?: number; className?: string }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <div className={cn("relative grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 76 76" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="38" cy="38" r={r} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="6" />
        <motion.circle
          cx="38"
          cy="38"
          r={r}
          fill="none"
          stroke="var(--color-forest-2)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - value / 100) }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <span className="relative text-[1.05rem] font-semibold">{value}%</span>
    </div>
  );
}
