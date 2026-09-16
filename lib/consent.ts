import type { AccessLevel, ConsentSettings, Eligibility, Experience, ParticipationMode } from "@/types";

export const ACCESS_LEVELS: AccessLevel[] = ["open", "guided", "protected"];

/** What protection switches off. Kept in a plain module so Server Components can read it. */
export const PROTECTION_LOCKS = ["Public discovery", "Commercial access", "AI description", "Search indexing"];

export interface AccessMeta {
  label: string;
  imperative: string;
  hint: string;
  summary: string;
  explanation: string;
}

export const ACCESS_META: Record<AccessLevel, AccessMeta> = {
  open: {
    label: "OPEN",
    imperative: "SHARE IT.",
    hint: "Publicly discoverable",
    summary: "Publicly discoverable.",
    explanation:
      "Anyone can discover and book this experience. Your rules still travel with it, and every visitor accepts them before booking.",
  },
  guided: {
    label: "GUIDED",
    imperative: "EXPERIENCE IT RESPECTFULLY.",
    hint: "Available under custodian-defined rules",
    summary: "Visitors participate under defined rules.",
    explanation:
      "Visitors can discover this experience, but they take part only under your rules and your guidance. You decide how close they come.",
  },
  protected: {
    label: "PROTECTED",
    imperative: "KEEP IT WITHIN THE COMMUNITY.",
    hint: "Not publicly exposed",
    summary: "Not publicly discoverable.",
    explanation:
      "This experience will not appear in public discovery. It cannot be booked, described by AI, sold or indexed by search. Only you can change this.",
  },
};

export interface Visibility {
  discovery: boolean;
  booking: boolean;
  ai: boolean;
  indexing: boolean;
  commercial: boolean;
}

export function visibilityFor(level: AccessLevel, aiAssist = true): Visibility {
  const shared = level !== "protected";
  return {
    discovery: shared,
    booking: shared,
    ai: shared && aiAssist,
    indexing: shared,
    commercial: shared,
  };
}

export const PARTICIPATION_LABEL: Record<ParticipationMode, string> = {
  allowed: "Allowed",
  guided: "Custodian guided",
  not_allowed: "Not allowed",
};

export const ELIGIBILITY_LABEL: Record<Eligibility, string> = {
  everyone: "Everyone",
  age_12_plus: "Ages 12 and up",
  adults: "Adults only",
  community_invited: "Community invited",
};

export function isDiscoverable(experience: Experience) {
  return experience.status === "published" && experience.consent.accessLevel !== "protected";
}

/** Rule 2: protected (or unpublished) experiences can never be booked. */
export function isBookable(experience: Experience) {
  return isDiscoverable(experience);
}

/** Rule 3: protected content cannot be described by AI. */
export function canUseAI(experience: Experience) {
  return experience.consent.accessLevel !== "protected" && experience.consent.aiAssist;
}

export type ConsentCore = Omit<ConsentSettings, "termsVersion" | "updatedAt">;

/** Protection is enforced in one place so no caller can forget part of it. */
export function applyAccessLevel<T extends ConsentCore>(consent: T, level: AccessLevel): T {
  if (level !== "protected") return { ...consent, accessLevel: level };
  return {
    ...consent,
    accessLevel: level,
    aiAssist: false,
    photography: false,
    video: false,
    recording: false,
    participation: "not_allowed",
    eligibility: "community_invited",
  };
}

/** The four standard pledges a visitor accepts before any booking (Rule 8). */
export const RESPECT_PLEDGES = [
  { id: "instructions", text: "I agree to follow the custodian's instructions." },
  { id: "photography", text: "I understand photography restrictions." },
  { id: "knowledge", text: "I will not reproduce protected cultural knowledge." },
  { id: "boundaries", text: "I will respect community boundaries." },
] as const;

/** Words in an AI draft that would contradict the custodian's media terms. */
export function findTermConflicts(text: string, consent: ConsentSettings) {
  const conflicts: { phrase: string; rule: string }[] = [];
  const lower = text.toLowerCase();
  const check = (allowed: boolean, pattern: RegExp, rule: string) => {
    if (allowed) return;
    const match = lower.match(pattern);
    if (match) conflicts.push({ phrase: match[0], rule });
  };
  check(consent.photography, /photograph\w*|photos?\b|selfies?/, "Photography is not allowed");
  check(consent.video, /\bvideos?\b|\bfilm\w*/, "Video is not allowed");
  check(consent.recording, /\brecord\w*/, "Recording is not allowed");
  return conflicts;
}
