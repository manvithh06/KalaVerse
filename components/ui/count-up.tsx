"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { formatNumber } from "@/lib/utils";

/** Counts up to `value` when first seen, and glides to new values when they change. */
export function CountUp({
  value,
  format = formatNumber,
  duration = 1.3,
  className,
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(0);
  const text = useTransform(motionValue, (v) => format(v));

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      motionValue.set(value);
      return;
    }
    const controls = animate(motionValue, value, { duration, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [inView, value, reduce, duration, motionValue]);

  return (
    <motion.span ref={ref} className={className} aria-label={format(value)}>
      {text}
    </motion.span>
  );
}
