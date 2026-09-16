"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** A lock whose shackle drops shut. Used whenever something becomes protected. */
export function AnimatedLock({
  locked = true,
  closeOnMount = true,
  className,
  strokeWidth = 2,
}: {
  locked?: boolean;
  closeOnMount?: boolean;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg viewBox="0 0 48 48" className={cn("size-10", className)} aria-hidden fill="none" stroke="currentColor" strokeWidth={strokeWidth}>
      <motion.path
        d="M15.5 22v-6.5a8.5 8.5 0 0 1 17 0V22"
        strokeLinecap="round"
        initial={closeOnMount ? { y: -7 } : false}
        animate={{ y: locked ? 0 : -7 }}
        transition={{ type: "spring", stiffness: 420, damping: 22, delay: closeOnMount ? 0.15 : 0 }}
      />
      <rect x="10.5" y="22" width="27" height="19.5" rx="3.5" />
      <motion.path
        d="M24 29.5v4"
        strokeLinecap="round"
        initial={closeOnMount ? { opacity: 0 } : false}
        animate={{ opacity: locked ? 1 : 0.35 }}
        transition={{ duration: 0.3, delay: closeOnMount ? 0.35 : 0 }}
      />
    </svg>
  );
}
