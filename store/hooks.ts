"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useKalaverse } from "./kalaverse";
import { CURRENT_CUSTODIAN_ID, custodians } from "@/data/custodians";
import { isDiscoverable } from "@/lib/consent";
import type { Custodian } from "@/types";

/**
 * True once persisted demo state has been read from localStorage.
 * Views that depend on it render a skeleton until then, so server HTML and the
 * first client render always match.
 */
export function useHydrated() {
  // During hydration React uses the server snapshot (false), even for Suspense boundaries that
  // hydrate after the store has already loaded; on client-side navigation it reads the real value.
  return useSyncExternalStore(
    (onChange) => useKalaverse.persist?.onFinishHydration(onChange) ?? (() => undefined),
    () => useKalaverse.persist?.hasHydrated() ?? true,
    () => false,
  );
}

export function useExperience(id: string) {
  const experiences = useKalaverse((s) => s.experiences);
  return useMemo(() => experiences.find((e) => e.id === id), [experiences, id]);
}

export function useDiscoverableExperiences() {
  const experiences = useKalaverse((s) => s.experiences);
  return useMemo(() => experiences.filter(isDiscoverable), [experiences]);
}

export function useMyExperiences() {
  const experiences = useKalaverse((s) => s.experiences);
  return useMemo(() => experiences.filter((e) => e.custodianId === CURRENT_CUSTODIAN_ID), [experiences]);
}

/** Custodian with the demo custodian's own profile edits applied. */
export function useCustodian(id: string): Custodian | undefined {
  const profile = useKalaverse((s) => s.profile);
  return useMemo(() => {
    const base = custodians.find((c) => c.id === id);
    if (!base || id !== CURRENT_CUSTODIAN_ID) return base;
    return {
      ...base,
      name: profile.name?.trim() || base.name,
      bio: profile.bio?.trim() || base.bio,
      location: profile.location?.trim() || base.location,
      languages: profile.languages?.length ? profile.languages : base.languages,
      story: profile.story?.length ? profile.story : base.story,
      rules: profile.rules?.length ? profile.rules : base.rules,
    };
  }, [id, profile]);
}

export function useCurrentCustodian() {
  return useCustodian(CURRENT_CUSTODIAN_ID) as Custodian;
}

export function useUnreadCount() {
  const notifications = useKalaverse((s) => s.notifications);
  return useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);
}

const MINUTE = 60_000;

function subscribeToMinutes(onChange: () => void) {
  const timer = window.setInterval(onChange, MINUTE);
  return () => window.clearInterval(timer);
}

/**
 * The current time to the minute, for date-dependent views. Null during server render and
 * hydration (so dates never mismatch), then refreshed every minute.
 */
export function useNow() {
  const minute = useSyncExternalStore(
    subscribeToMinutes,
    () => Math.floor(Date.now() / MINUTE),
    () => null,
  );
  return useMemo(() => (minute === null ? null : new Date(minute * MINUTE)), [minute]);
}
