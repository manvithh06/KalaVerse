import type { AIContent, Notification, Transaction, VaultRecord } from "@/types";
import { payoutFor } from "@/lib/economics";
import { CURRENT_CUSTODIAN_ID } from "./custodians";

/**
 * This month's activity for the demo custodian. Nets add up to ₹24,800:
 * nine experience bookings (₹26,500 gross at 10%) and one craft sale (₹1,000 at 5%).
 */
const MONTH_ACTIVITY: { label: string; gross: number; kind: "experience" | "product"; guests?: number }[] = [
  { label: "A Night with the Troupe", gross: 3600, kind: "experience", guests: 2 },
  { label: "First Steps: Yakshagana Footwork", gross: 1500, kind: "experience", guests: 3 },
  { label: "Yakshagana — Beyond the Stage", gross: 3000, kind: "experience", guests: 2 },
  { label: "Chende and Maddale: Rhythms of the Stage", gross: 3200, kind: "experience", guests: 4 },
  { label: "Yakshagana Ornament Miniature", gross: 1000, kind: "product" },
  { label: "Mukhavarnike: The Language of Stage Makeup", gross: 2600, kind: "experience", guests: 2 },
  { label: "Talamaddale: An Evening of Spoken Epic", gross: 3000, kind: "experience", guests: 5 },
  { label: "The Crown Makers' Workshop", gross: 3600, kind: "experience", guests: 3 },
  { label: "Yakshagana — Beyond the Stage", gross: 4500, kind: "experience", guests: 3 },
  { label: "Yakshagana — Beyond the Stage", gross: 1500, kind: "experience", guests: 1 },
];

/** Dates are spread between the 1st of the current month and now, so "this month" is always true. */
export function createSeedTransactions(now = new Date()): Transaction[] {
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 8, 0, 0).getTime();
  const end = Math.max(now.getTime() - 5 * 60_000, start + 60_000);
  const step = (end - start) / MONTH_ACTIVITY.length;
  return MONTH_ACTIVITY.map((item, i) => ({
    id: `txn-seed-${i + 1}`,
    kind: item.kind,
    label: item.label,
    custodianId: CURRENT_CUSTODIAN_ID,
    date: new Date(start + step * i).toISOString(),
    reference: item.kind === "experience" ? `CST-${now.getFullYear()}-${1030 + i}` : `ORD-${now.getFullYear()}-${310 + i}`,
    ...payoutFor(item.gross, item.kind),
  })).reverse();
}

/** Earlier months for the earnings chart, oldest first (months before the current one). */
export const EARNINGS_HISTORY = [
  { monthsAgo: 5, net: 14600, bookings: 8, productSales: 1 },
  { monthsAgo: 4, net: 19300, bookings: 11, productSales: 2 },
  { monthsAgo: 3, net: 16900, bookings: 10, productSales: 1 },
  { monthsAgo: 2, net: 11200, bookings: 6, productSales: 0 },
  { monthsAgo: 1, net: 18450, bookings: 10, productSales: 2 },
];

/** Season total the demo custodian has shared with troupe artists. */
export const COMMUNITY_CONTRIBUTION_BASE = 18600;

export const PROFILE_COMPLETENESS = 86;

/** Network-wide figures before any demo activity. Demo bookings and protections add to them. */
export const IMPACT_BASE = {
  custodianEarnings: 82400,
  experiences: 47,
  custodians: 26,
  protectedPractices: 12,
  participants: 184,
};

export function createSeedAIContents(now = new Date()): AIContent[] {
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000).toISOString();
  return [
    {
      id: "ai-beyond-the-stage",
      experienceId: "yakshagana-beyond-the-stage",
      draft:
        "Yakshagana is a traditional theatre form associated with Karnataka, combining music, dance, dialogue and elaborate costume. In this experience, visitors go behind the scenes of a performance, meet the artists and learn how a night of Yakshagana comes together. It is a colourful spectacle that guests can photograph and share from the front rows.",
      status: "draft",
      generatedAt: hoursAgo(2),
    },
    {
      id: "ai-mukhavarnike",
      experienceId: "mukhavarnike-stage-makeup",
      draft:
        "Watch a Yakshagana artist prepare a character's face with bold stage makeup. The session explains how colour and line help audiences recognise characters from a distance, and why preparation begins long before a performance.",
      status: "draft",
      generatedAt: hoursAgo(26),
    },
    {
      id: "ai-chende",
      experienceId: "chende-maddale-rhythms",
      draft:
        "The chende is loud and bright; the maddale is deep and steady. Together they carry every entry, every battle and every pause on stage. Our musicians show how the rhythms follow the singer, then hand you the sticks.",
      status: "approved",
      finalText:
        "The chende is loud and bright; the maddale is deep and steady. Together they carry every entry, every battle and every pause on stage. Our musicians show how the rhythms follow the singer, then hand you the sticks.",
      generatedAt: hoursAgo(24 * 40),
      decidedAt: hoursAgo(24 * 39),
    },
    {
      id: "ai-crown-makers",
      experienceId: "crown-makers-workshop",
      draft:
        "Discover the secret techniques behind sacred temple crowns, passed down in hidden rituals for centuries, and take home an authentic antique-style ornament.",
      status: "rejected",
      generatedAt: hoursAgo(24 * 30),
      decidedAt: hoursAgo(24 * 30 - 1),
    },
  ];
}

export function createSeedNotifications(now = new Date()): Notification[] {
  const hoursAgo = (h: number) => new Date(now.getTime() - h * 3_600_000).toISOString();
  return [
    {
      id: "note-ai-draft",
      kind: "ai",
      title: "An AI draft is waiting for your decision",
      body: "Nothing is published until you approve, edit or reject it.",
      createdAt: hoursAgo(2),
      read: false,
    },
    {
      id: "note-review",
      kind: "governance",
      title: "Community review complete",
      body: "Two endorsers approved your updated terms for Talamaddale.",
      createdAt: hoursAgo(20),
      read: false,
    },
    {
      id: "note-terms",
      kind: "consent",
      title: "Terms updated to version 3",
      body: "A Night with the Troupe now requires visitors to stay with their guide.",
      createdAt: hoursAgo(72),
      read: true,
    },
  ];
}

export const seedVaultRecords: VaultRecord[] = [
  {
    id: "vault-oral-tradition",
    label: "Community-only Oral Tradition",
    kind: "oral",
    keepers: "Held by senior members of the troupe",
    sealedAt: "2026-03-02T09:00:00.000Z",
  },
  {
    id: "vault-restricted-knowledge",
    label: "Restricted Cultural Knowledge",
    kind: "knowledge",
    keepers: "Passed on only through apprenticeship",
    sealedAt: "2026-04-18T09:00:00.000Z",
  },
];
