"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  Bell,
  IndianRupee,
  Lock,
  Package,
  Plus,
  ScrollText,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import type { AccessLevel } from "@/types";
import { useKalaverse } from "@/store/kalaverse";
import { useCurrentCustodian, useNow } from "@/store/hooks";
import { CURRENT_CUSTODIAN_ID } from "@/data/custodians";
import { COMMUNITY_CONTRIBUTION_BASE, PROFILE_COMPLETENESS } from "@/data/seed";
import { TRUST_LEVELS } from "@/data/trust";
import { ACCESS_LEVELS, ACCESS_META } from "@/lib/consent";
import { controlCounts, isSameMonth, monthSummary } from "@/lib/stats";
import { KireetaRings } from "@/components/cultural/ornaments";
import { TrustBadge } from "@/components/cultural/trust-badge";
import { AccessGlyph, ACCESS_TEXT } from "@/components/consent/access-badge";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/ui/count-up";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateProductDialog } from "./create-product-dialog";
import { RingMeter } from "./workspace";
import { cn, formatINR, timeAgo } from "@/lib/utils";

const LANE_TOP: Record<AccessLevel, string> = {
  open: "border-t-open",
  guided: "border-t-guided",
  protected: "border-t-protected",
};

function QuickAction({ icon: Icon, title, body, href, tone }: { icon: LucideIcon; title: string; body: string; href?: string; tone?: "protected" | "ai" }) {
  const inner = (
    <>
      <span
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-full border",
          tone === "protected" ? "border-protected/40 text-protected" : tone === "ai" ? "border-indigo-2/40 text-indigo-2" : "border-ink/15 text-ink",
        )}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block font-sans text-[0.74rem] font-semibold uppercase tracking-[0.16em] [font-stretch:90%]">{title}</span>
        <span className="mt-1 block text-[0.9rem] leading-snug text-ink-soft">{body}</span>
      </span>
    </>
  );
  const classes = "flex h-full w-full items-start gap-4 border border-ink/10 bg-paper p-5 text-left transition-colors hover:border-ink/30 hover:bg-white/60";
  return href ? (
    <Link href={href} className={classes}>
      {inner}
    </Link>
  ) : (
    <button type="button" className={classes}>
      {inner}
    </button>
  );
}

export function DashboardView() {
  const custodian = useCurrentCustodian();
  const experiences = useKalaverse((s) => s.experiences);
  const transactions = useKalaverse((s) => s.transactions);
  const notifications = useKalaverse((s) => s.notifications);
  const aiContents = useKalaverse((s) => s.aiContents);
  const communityShareAdded = useKalaverse((s) => s.communityShareAdded);
  const now = useNow();

  const counts = useMemo(() => controlCounts(experiences, CURRENT_CUSTODIAN_ID), [experiences]);
  const month = useMemo(() => (now ? monthSummary(transactions, CURRENT_CUSTODIAN_ID, now) : null), [transactions, now]);
  const live = useMemo(
    () => (now ? transactions.filter((t) => t.id.startsWith("txn-live-") && t.custodianId === CURRENT_CUSTODIAN_ID && isSameMonth(t.date, now)) : []),
    [transactions, now],
  );
  const liveNet = live.reduce((sum, t) => sum + t.custodianNet, 0);
  const mine = useMemo(() => experiences.filter((e) => e.custodianId === CURRENT_CUSTODIAN_ID && e.status === "published"), [experiences]);
  const pendingDrafts = aiContents.filter(
    (c) => c.status === "draft" && mine.some((e) => e.id === c.experienceId && e.consent.accessLevel !== "protected"),
  ).length;
  const firstName = custodian.name.split(" ")[0];
  const trust = TRUST_LEVELS[custodian.trustLevel];

  return (
    <div>
      <section className="relative overflow-hidden bg-night text-ivory grain">
        <KireetaRings rings={6} studs={60} className="pointer-events-none absolute -right-40 -top-48 size-[640px] text-gold/[0.08]" />
        <div className="page-gutter relative z-[2] mx-auto max-w-[1280px] py-12 lg:py-16">
          <p className="flex flex-wrap items-baseline gap-x-3 text-ivory-dim">
            <span lang="kn" className="t-kannada text-[1.5rem] text-gold-light">
              ನಮಸ್ಕಾರ
            </span>
            <span>Namaskara, {firstName}</span>
          </p>
          <h1 className="mt-4 font-titling text-[clamp(2.6rem,6.4vw,5.6rem)] uppercase leading-[0.92]">
            Your culture.
            <br />
            Your rules.
          </h1>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild variant="gold" caps>
              <Link href="/custodian/experiences/new">
                <Plus aria-hidden />
                Create experience
              </Link>
            </Button>
            <Button asChild variant="outline" caps>
              <Link href="/custodian/consent">Manage consent</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="page-gutter mx-auto max-w-[1280px] space-y-14 py-10 lg:py-14">
        <section aria-label="Your practice at a glance" className="grid gap-px overflow-hidden border border-ink/10 bg-ink/10 md:grid-cols-2 xl:grid-cols-4">
          <div className="flex flex-col bg-paper p-6 sm:p-8 md:col-span-2 xl:row-span-2">
            <p className="text-[0.92rem] text-ink-soft">This month&apos;s earnings</p>
            <p className="mt-3 text-[clamp(3rem,6.2vw,4.8rem)] font-semibold leading-none tracking-tight">
              {month ? <CountUp value={month.net} format={formatINR} /> : <Skeleton tone="light" className="h-16 w-56" />}
            </p>
            {liveNet > 0 && (
              <p className="mt-4 inline-flex items-center gap-2 text-[0.95rem] font-medium text-forest-2">
                <TrendingUp className="size-4" aria-hidden />+{formatINR(liveNet)} from {live.length} new {live.length === 1 ? "sale" : "sales"} since the demo began
              </p>
            )}
            <dl className="mt-auto grid grid-cols-3 gap-4 border-t border-ink/10 pt-6 text-[0.9rem]">
              <div>
                <dt className="text-ink-faint">Bookings</dt>
                <dd className="mt-1 text-[1.25rem] font-semibold">{month?.bookings ?? "–"}</dd>
              </div>
              <div>
                <dt className="text-ink-faint">Craft sales</dt>
                <dd className="mt-1 text-[1.25rem] font-semibold">{month?.productSales ?? "–"}</dd>
              </div>
              <div>
                <dt className="text-ink-faint">Platform fees</dt>
                <dd className="mt-1 text-[1.25rem] font-semibold">{month ? formatINR(month.fees) : "–"}</dd>
              </div>
            </dl>
            <Link href="/custodian/earnings" className="mt-6 self-start text-[0.9rem] underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
              View earnings
            </Link>
          </div>

          <div className="flex items-center justify-between gap-4 bg-paper p-6">
            <div>
              <p className="text-[0.92rem] text-ink-soft">Profile completeness</p>
              <p className="mt-2 text-[0.84rem] text-ink-faint">Add a second endorser to finish</p>
            </div>
            <RingMeter value={PROFILE_COMPLETENESS} className="text-ink" />
          </div>
          <div className="bg-paper p-6">
            <p className="text-[0.92rem] text-ink-soft">Trust level</p>
            <TrustBadge level={custodian.trustLevel} tone="light" className="mt-3" />
            <p className="mt-3 text-[0.84rem] text-ink-faint">
              Level {trust.level} of 4: {trust.basis.toLowerCase()}
            </p>
          </div>
          <div className="bg-paper p-6">
            <p className="text-[0.92rem] text-ink-soft">Active experiences</p>
            <p className="mt-2 text-[2.4rem] font-semibold leading-none">
              <CountUp value={counts.active} />
            </p>
            <p className="mt-2 text-[0.84rem] text-ink-faint">
              {counts.open} open, {counts.guided} guided, {counts.protected} protected
            </p>
          </div>
          <div className="bg-paper p-6">
            <p className="text-[0.92rem] text-ink-soft">Community contribution</p>
            <p className="mt-2 text-[2.4rem] font-semibold leading-none">
              <CountUp value={COMMUNITY_CONTRIBUTION_BASE + communityShareAdded} format={formatINR} />
            </p>
            <p className="mt-2 text-[0.84rem] text-ink-faint">Shared with troupe artists this season</p>
          </div>
        </section>

        <section aria-labelledby="cultural-control">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="cultural-control" className="t-title">
              Cultural control
            </h2>
            <Link href="/custodian/culture" className="text-[0.92rem] underline decoration-ink/30 underline-offset-4 hover:decoration-ink">
              Change what the world sees
            </Link>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {ACCESS_LEVELS.map((level) => {
              const items = mine.filter((e) => e.consent.accessLevel === level);
              const noun = level === "protected" ? (items.length === 1 ? "practice" : "practices") : items.length === 1 ? "experience" : "experiences";
              return (
                <div key={level} className={cn("border border-t-[3px] border-ink/10 bg-paper p-6", LANE_TOP[level])}>
                  <p className="flex items-center gap-2">
                    <AccessGlyph level={level} className="size-4" />
                    <span className={cn("t-caps", ACCESS_TEXT[level])}>{ACCESS_META[level].label}</span>
                  </p>
                  <p className="mt-5 text-[2.8rem] font-semibold leading-none">{items.length}</p>
                  <p className="mt-1 text-ink-soft">{noun}</p>
                  <ul className="mt-5 space-y-1.5 border-t border-ink/10 pt-4 text-[0.9rem] text-ink-soft">
                    {items.slice(0, 4).map((e) => (
                      <li key={e.id} className="flex items-center gap-2 truncate">
                        {level === "protected" && <Lock className="size-3.5 shrink-0 text-protected" aria-hidden />}
                        <span className="truncate">{e.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <section className="border-y border-ink/10 py-14" aria-label="Principle">
          <p className="font-titling text-[clamp(2rem,5.2vw,4.6rem)] uppercase leading-[0.96]">
            You decide what
            <br />
            the world gets to see.
          </p>
        </section>

        <section aria-labelledby="quick-actions">
          <h2 id="quick-actions" className="t-title">
            Quick actions
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <QuickAction icon={Plus} title="Create experience" body="Publish a new experience with your own terms." href="/custodian/experiences/new" />
            <CreateProductDialog trigger={<div className="h-full"><QuickAction icon={Package} title="Create product" body="List a piece you make, sold directly by you." /></div>} />
            <QuickAction icon={ScrollText} title="Manage consent" body="Change photography, participation and group rules." href="/custodian/consent" />
            <QuickAction icon={Lock} title="Protected vault" body="See what stays within the community." href="/custodian/vault" tone="protected" />
            <QuickAction
              icon={Sparkles}
              title="AI assistant"
              body={pendingDrafts ? `${pendingDrafts} ${pendingDrafts === 1 ? "draft is" : "drafts are"} waiting for your decision.` : "Review drafts before anything is published."}
              href="/custodian/ai"
              tone="ai"
            />
            <QuickAction icon={IndianRupee} title="View earnings" body="Every booking, fee and payout in one place." href="/custodian/earnings" />
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section aria-labelledby="recent-earnings" className="border border-ink/10 bg-paper">
            <h2 id="recent-earnings" className="border-b border-ink/10 px-6 py-4 text-[1rem] font-medium">
              Recent earnings
            </h2>
            <ul className="divide-y divide-ink/[0.07]">
              {transactions
                .filter((t) => t.custodianId === CURRENT_CUSTODIAN_ID)
                .slice(0, 5)
                .map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-4 px-6 py-3.5">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate text-[0.95rem]">
                        {t.id.startsWith("txn-live-") && (
                          <span className="rounded-full bg-forest-2 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wider text-paper">New</span>
                        )}
                        <span className="truncate">{t.label}</span>
                      </p>
                      <p className="text-[0.8rem] text-ink-faint">
                        {t.reference}, {timeAgo(t.date).toLowerCase()}
                      </p>
                    </div>
                    <p className="shrink-0 text-right">
                      <span className="block font-semibold">{formatINR(t.custodianNet)}</span>
                      <span className="block text-[0.76rem] text-ink-faint">of {formatINR(t.gross)}</span>
                    </p>
                  </li>
                ))}
            </ul>
          </section>

          <section aria-labelledby="latest-notes" className="border border-ink/10 bg-paper">
            <h2 id="latest-notes" className="flex items-center gap-2 border-b border-ink/10 px-6 py-4 text-[1rem] font-medium">
              <Bell className="size-4" aria-hidden />
              What changed
            </h2>
            <ul className="divide-y divide-ink/[0.07]">
              {notifications.slice(0, 5).map((n) => (
                <li key={n.id} className="px-6 py-3.5">
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-[0.95rem] font-medium leading-snug">{n.title}</p>
                    <span className="shrink-0 text-[0.76rem] text-ink-faint">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-[0.86rem] leading-snug text-ink-soft">{n.body}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
