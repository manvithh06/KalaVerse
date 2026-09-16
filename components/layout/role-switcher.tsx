"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import type { Role } from "@/types";
import { useUI } from "@/store/ui";
import { useKalaverse } from "@/store/kalaverse";
import { useHydrated } from "@/store/hooks";
import { cn } from "@/lib/utils";

const TARGET: Record<Role, string> = { visitor: "/discover", custodian: "/custodian" };

export function useCurrentArea(): Role {
  const pathname = usePathname();
  return pathname.startsWith("/custodian") ? "custodian" : "visitor";
}

export function useRoleCrossing() {
  const router = useRouter();
  const current = useCurrentArea();
  const crossingTo = useUI((s) => s.crossingTo);
  const beginCrossing = useUI((s) => s.beginCrossing);
  const reduce = useReducedMotion();

  return (to: Role, href = TARGET[to]) => {
    if (crossingTo) return;
    if (to === current) {
      router.push(href);
      return;
    }
    beginCrossing(to);
    window.setTimeout(() => router.push(href), reduce ? 0 : 580);
  };
}

export function RoleSwitcher({ tone = "dark", className }: { tone?: "dark" | "light"; className?: string }) {
  const current = useCurrentArea();
  const cross = useRoleCrossing();

  return (
    <div
      role="group"
      aria-label="Switch between visitor and custodian mode"
      className={cn(
        "relative flex h-10 shrink-0 items-center rounded-full border p-1",
        tone === "dark" ? "border-ivory/15 bg-night/50" : "border-ink/15 bg-paper",
        className,
      )}
    >
      {(["visitor", "custodian"] as Role[]).map((role) => {
        const active = current === role;
        return (
          <button
            key={role}
            type="button"
            aria-pressed={active}
            onClick={() => cross(role)}
            className={cn(
              "relative h-8 rounded-full px-3 font-sans text-[0.66rem] font-semibold uppercase tracking-[0.16em] transition-colors [font-stretch:88%] sm:px-3.5",
              active
                ? tone === "dark"
                  ? "text-night"
                  : "text-paper"
                : tone === "dark"
                  ? "text-ivory-dim hover:text-ivory"
                  : "text-ink-soft hover:text-ink",
            )}
          >
            {active && (
              <motion.span
                layoutId={`role-pill-${tone}`}
                aria-hidden
                className={cn("absolute inset-0 rounded-full", tone === "dark" ? "bg-ivory" : "bg-ink")}
                transition={{ type: "spring", stiffness: 480, damping: 38 }}
              />
            )}
            <span className="relative">{role === "visitor" ? "Visitor" : "Custodian"}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Keeps the persisted role in step with the part of the app being viewed. */
export function RoleSync({ role }: { role: Role }) {
  const hydrated = useHydrated();
  const stored = useKalaverse((s) => s.role);
  const setRole = useKalaverse((s) => s.setRole);
  useEffect(() => {
    if (hydrated && stored !== role) setRole(role);
  }, [hydrated, stored, role, setRole]);
  return null;
}
