import type { Booking, Experience, Transaction } from "@/types";
import { EARNINGS_HISTORY, IMPACT_BASE } from "@/data/seed";
import { seedExperiences } from "@/data/experiences";
import { monthLabel } from "./utils";

export function isSameMonth(iso: string, now: Date) {
  const d = new Date(iso);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

export function monthSummary(transactions: Transaction[], custodianId: string, now: Date) {
  const mine = transactions.filter((t) => t.custodianId === custodianId && isSameMonth(t.date, now));
  const experiences = mine.filter((t) => t.kind === "experience");
  const productsSold = mine.filter((t) => t.kind === "product");
  const net = mine.reduce((sum, t) => sum + t.custodianNet, 0);
  const gross = mine.reduce((sum, t) => sum + t.gross, 0);
  const fees = mine.reduce((sum, t) => sum + t.platformFee, 0);
  const experienceGross = experiences.reduce((sum, t) => sum + t.gross, 0);
  return {
    transactions: mine,
    net,
    gross,
    fees,
    bookings: experiences.length,
    productSales: productsSold.length,
    productNet: productsSold.reduce((sum, t) => sum + t.custodianNet, 0),
    averageExperienceValue: experiences.length ? Math.round(experienceGross / experiences.length) : 0,
  };
}

export interface EarningsPoint {
  label: string;
  net: number;
  bookings: number;
  productSales: number;
  current: boolean;
}

export function earningsSeries(transactions: Transaction[], custodianId: string, now: Date): EarningsPoint[] {
  const past = EARNINGS_HISTORY.map((h) => ({
    label: monthLabel(new Date(now.getFullYear(), now.getMonth() - h.monthsAgo, 1)),
    net: h.net,
    bookings: h.bookings,
    productSales: h.productSales,
    current: false,
  }));
  const current = monthSummary(transactions, custodianId, now);
  return [
    ...past,
    { label: monthLabel(now), net: current.net, bookings: current.bookings, productSales: current.productSales, current: true },
  ];
}

export function controlCounts(experiences: Experience[], custodianId: string) {
  const mine = experiences.filter((e) => e.custodianId === custodianId && e.status === "published");
  return {
    open: mine.filter((e) => e.consent.accessLevel === "open").length,
    guided: mine.filter((e) => e.consent.accessLevel === "guided").length,
    protected: mine.filter((e) => e.consent.accessLevel === "protected").length,
    active: mine.length,
    drafts: experiences.filter((e) => e.custodianId === custodianId && e.status === "draft").length,
  };
}

const SEED_PROTECTED = seedExperiences.filter((e) => e.consent.accessLevel === "protected").length;
const SEED_LISTED = seedExperiences.filter((e) => e.consent.accessLevel !== "protected").length;

/** Network figures: the static base plus everything that happened in this demo session. */
export function impactFigures(experiences: Experience[], bookings: Booking[], transactions: Transaction[]) {
  const live = transactions.filter((t) => t.id.startsWith("txn-live-"));
  const published = experiences.filter((e) => e.status === "published");
  const protectedNow = published.filter((e) => e.consent.accessLevel === "protected").length;
  const listedNow = published.filter((e) => e.consent.accessLevel !== "protected").length;
  return {
    custodianEarnings: IMPACT_BASE.custodianEarnings + live.reduce((sum, t) => sum + t.custodianNet, 0),
    experiences: Math.max(0, IMPACT_BASE.experiences + (listedNow - SEED_LISTED)),
    custodians: IMPACT_BASE.custodians,
    protectedPractices: Math.max(0, IMPACT_BASE.protectedPractices + (protectedNow - SEED_PROTECTED)),
    participants: IMPACT_BASE.participants + bookings.reduce((sum, b) => sum + b.guests, 0),
  };
}
