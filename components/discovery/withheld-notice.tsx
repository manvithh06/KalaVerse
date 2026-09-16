"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AnimatedLock } from "@/components/consent/animated-lock";

/**
 * Shown once in discovery after a custodian protects something that was listed.
 * It names nothing: it only shows that a practice has left public view.
 */
export function WithheldNotice({ onDone, duration = 5200 }: { onDone: () => void; duration?: number }) {
  useEffect(() => {
    const timer = window.setTimeout(onDone, duration);
    return () => window.clearTimeout(timer);
  }, [onDone, duration]);

  return (
    <div role="status" className="relative flex h-full min-h-[420px] flex-col justify-between overflow-hidden border border-protected/35 bg-vault p-6 text-ivory">
      <div
        aria-hidden
        className="absolute inset-0 opacity-70"
        style={{ backgroundImage: "repeating-linear-gradient(135deg, rgb(180 73 79 / 0.07) 0 1px, transparent 1px 10px)" }}
      />
      <div className="relative">
        <span className="text-protected">
          <AnimatedLock className="size-12" />
        </span>
        <p className="t-caps mt-6 text-protected">Removed from public discovery</p>
        <p className="mt-3 font-titling text-[1.35rem] uppercase leading-tight">A custodian has placed a practice under protection.</p>
        <p className="mt-4 text-[0.95rem] leading-relaxed text-ivory-dim">
          It is no longer listed, bookable or described here. Kalaverse does not show what it was.
        </p>
      </div>
      <div className="relative mt-8 h-px bg-ivory/10">
        <motion.div
          className="h-px origin-left bg-protected"
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: duration / 1000, ease: "linear" }}
        />
      </div>
    </div>
  );
}
