"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn, formatINR } from "@/lib/utils";

/** Where a visitor's payment goes: most of it to the custodian, a small fee to the platform. */
export function PayoutFlow({
  gross,
  platformFee,
  custodianNet,
  tone = "dark",
  className,
}: {
  gross: number;
  platformFee: number;
  custodianNet: number;
  tone?: "dark" | "light";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const share = gross > 0 ? (custodianNet / gross) * 100 : 90;
  const dark = tone === "dark";

  return (
    <div ref={ref} className={cn(dark ? "text-ivory" : "text-ink", className)}>
      <div className="flex items-baseline justify-between gap-4">
        <span className={cn("text-[0.9rem]", dark ? "text-ivory-dim" : "text-ink-soft")}>Visitor pays</span>
        <span className="t-num text-[1.75rem]">{formatINR(gross)}</span>
      </div>
      <div
        className={cn("mt-4 flex h-3 w-full gap-0.5 overflow-hidden rounded-full", dark ? "bg-ivory/[0.06]" : "bg-ink/[0.06]")}
        role="img"
        aria-label={`${formatINR(custodianNet)} to the custodian, ${formatINR(platformFee)} platform fee`}
      >
        <motion.div
          className="h-full rounded-l-full bg-open"
          initial={{ width: "0%" }}
          animate={{ width: inView ? `${share}%` : "0%" }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.div
          className={cn("h-full rounded-r-full", dark ? "bg-ash/60" : "bg-ink-faint/60")}
          initial={{ width: "0%" }}
          animate={{ width: inView ? `${100 - share}%` : "0%" }}
          transition={{ duration: 1.1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <p className="t-num text-[1.6rem] text-open">{formatINR(custodianNet)}</p>
          <p className={cn("mt-1 text-[0.9rem]", dark ? "text-ivory" : "text-ink")}>→ Custodian</p>
        </div>
        <div className="text-right">
          <p className={cn("t-num text-[1.6rem]", dark ? "text-ivory-dim" : "text-ink-soft")}>{formatINR(platformFee)}</p>
          <p className={cn("mt-1 text-[0.9rem]", dark ? "text-ash" : "text-ink-faint")}>Platform fee</p>
        </div>
      </div>
    </div>
  );
}
