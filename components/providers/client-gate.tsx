"use client";

import type { ReactNode } from "react";
import { useHydrated } from "@/store/hooks";

/** Renders `fallback` until persisted demo state is loaded. */
export function ClientGate({ children, fallback }: { children: ReactNode; fallback: ReactNode }) {
  const hydrated = useHydrated();
  return <>{hydrated ? children : fallback}</>;
}
