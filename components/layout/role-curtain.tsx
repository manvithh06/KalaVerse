"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useUI } from "@/store/ui";
import { KireetaRings } from "@/components/cultural/ornaments";

const COPY = {
  custodian: { mode: "Custodian mode", line: ["YOUR CULTURE.", "YOUR RULES."] },
  visitor: { mode: "Visitor mode", line: ["ONLY WHAT", "CUSTODIANS SHARE."] },
};

/** The curtain drawn across the interface when crossing between visitor and custodian. */
export function RoleCurtain() {
  const crossingTo = useUI((s) => s.crossingTo);
  const endCrossing = useUI((s) => s.endCrossing);
  const pathname = usePathname();

  useEffect(() => {
    if (!crossingTo) return;
    const area = pathname.startsWith("/custodian") ? "custodian" : "visitor";
    if (area !== crossingTo) return;
    const timer = window.setTimeout(endCrossing, 480);
    return () => window.clearTimeout(timer);
  }, [crossingTo, pathname, endCrossing]);

  useEffect(() => {
    if (!crossingTo) return;
    const safety = window.setTimeout(endCrossing, 6000);
    return () => window.clearTimeout(safety);
  }, [crossingTo, endCrossing]);

  return (
    <AnimatePresence>
      {crossingTo && (
        <motion.div
          key="curtain"
          role="status"
          aria-live="assertive"
          className="fixed inset-0 z-[90] grid place-items-center overflow-hidden bg-night grain"
          initial={{ clipPath: "inset(100% 0% 0% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.56, ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-1/2 size-[min(120vw,900px)] -translate-x-1/2 -translate-y-1/2 text-gold/15"
            initial={{ rotate: -25, scale: 0.9, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <KireetaRings rings={6} studs={60} className="size-full" />
          </motion.div>
          <div className="relative px-6 text-center">
            <motion.p
              className="t-caps text-gold-light"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.4 }}
            >
              {COPY[crossingTo].mode}
            </motion.p>
            <h2 className="t-headline mt-5 text-ivory">
              {COPY[crossingTo].line.map((line, i) => (
                <motion.span
                  key={line}
                  className="block"
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.42 + i * 0.12, duration: 0.5 }}
                >
                  {line}
                </motion.span>
              ))}
            </h2>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
