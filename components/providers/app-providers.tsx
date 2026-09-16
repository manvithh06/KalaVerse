"use client";

import { useEffect, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { Tooltip } from "radix-ui";
import { useKalaverse } from "@/store/kalaverse";
import { RoleCurtain } from "@/components/layout/role-curtain";
import { Toaster } from "@/components/ui/toaster";

/** Reads persisted demo state once, after the first paint matches the server HTML. */
function StoreHydrator() {
  useEffect(() => {
    void useKalaverse.persist?.rehydrate();
  }, []);
  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ ease: [0.22, 1, 0.36, 1] }}>
      <Tooltip.Provider delayDuration={180} skipDelayDuration={400}>
        <StoreHydrator />
        {children}
        <RoleCurtain />
        <Toaster />
      </Tooltip.Provider>
    </MotionConfig>
  );
}
