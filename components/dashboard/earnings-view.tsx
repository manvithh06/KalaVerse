"use client";

import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { useKalaverse } from "@/store/kalaverse";
import { useNow } from "@/store/hooks";
import { CURRENT_CUSTODIAN_ID } from "@/data/custodians";
import { COMMUNITY_CONTRIBUTION_BASE } from "@/data/seed";
import { COMMUNITY_SHARE } from "@/lib/economics";
import { earningsSeries, monthSummary } from "@/lib/stats";
import { EarningsChart } from "@/components/economics/earnings-chart";
import { PayoutFlow } from "@/components/economics/payout-flow";
import { CountUp } from "@/components/ui/count-up";
import { WorkspaceBody, WorkspaceHeader, WorkspaceSkeleton } from "./workspace";
import { formatDate, formatINR, monthLabel } from "@/lib/utils";

export function EarningsView() {
  const transactions = useKalaverse((s) => s.transactions);
  const communityShareAdded = useKalaverse((s) => s.communityShareAdded);
  const now = useNow();

  const data = useMemo(() => {
    if (!now) return null;
    const summary = monthSummary(transactions, CURRENT_CUSTODIAN_ID, now);
    const live = summary.transactions.filter((t) => t.id.startsWith("txn-live-"));
    return {
      summary,
      series: earningsSeries(transactions, CURRENT_CUSTODIAN_ID, now),
      liveNet: live.reduce((sum, t) => sum + t.custodianNet, 0),
      liveCount: live.length,
      rows: [...summary.transactions].sort((a, b) => b.date.localeCompare(a.date)),
    };
  }, [transactions, now]);

  if (!now || !data) return <WorkspaceSkeleton />;
  const { summary, series, liveNet, liveCount, rows } = data;

  return (
    <div>
      <WorkspaceHeader
        title={
          <>
            Your culture.
            <br />
            Your value.
          </>
        }
        lead="Every rupee from your experiences and crafts, and exactly what the platform keeps."
      />
      <WorkspaceBody className="space-y-10">
        <section aria-label="This month" className="grid gap-px overflow-hidden border border-ink/10 bg-ink/10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <div className="bg-paper p-6 sm:p-8">
            <p className="text-[0.95rem] text-ink-soft">Total custodian earnings, {monthLabel(now, true)}</p>
            <p className="mt-3 text-[clamp(3.2rem,7vw,5.2rem)] font-semibold leading-none tracking-tight">
              <CountUp value={summary.net} format={formatINR} />
            </p>
            {liveNet > 0 && (
              <p className="mt-4 inline-flex items-center gap-2 text-[0.95rem] font-medium text-forest-2">
                <TrendingUp className="size-4" aria-hidden />+{formatINR(liveNet)} from {liveCount} new {liveCount === 1 ? "sale" : "sales"} in this demo
              </p>
            )}
            <EarningsChart points={series} tone="light" className="mt-10" />
          </div>
          <div className="grid gap-px bg-ink/10 sm:grid-cols-2 lg:grid-cols-1">
            {[
              ["Bookings", String(summary.bookings), "Experience bookings this month"],
              ["Product sales", String(summary.productSales), `${formatINR(summary.productNet)} from crafts, sold directly`],
              ["Average experience value", formatINR(summary.averageExperienceValue), "Per booking, before fees"],
              ["Platform fees", formatINR(summary.fees), "10% on experiences, 5% on crafts"],
            ].map(([label, value, note]) => (
              <div key={label} className="bg-paper p-6">
                <p className="text-[0.92rem] text-ink-soft">{label}</p>
                <p className="mt-2 text-[2.2rem] font-semibold leading-none">{value}</p>
                <p className="mt-2 text-[0.84rem] text-ink-faint">{note}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="transactions" className="border border-ink/10 bg-paper">
          <h2 id="transactions" className="border-b border-ink/10 px-6 py-4 text-[1rem] font-medium">
            Transactions this month
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[0.92rem]">
              <caption className="sr-only">Transactions this month, with platform fee and custodian share</caption>
              <thead>
                <tr className="text-[0.8rem] text-ink-faint">
                  <th scope="col" className="px-6 py-3 font-medium">
                    Item
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Visitor paid
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Platform fee
                  </th>
                  <th scope="col" className="px-6 py-3 text-right font-medium">
                    Custodian
                  </th>
                </tr>
              </thead>
              <tbody style={{ fontVariantNumeric: "tabular-nums" }}>
                {rows.map((t) => (
                  <tr key={t.id} className="border-t border-ink/[0.07]">
                    <th scope="row" className="px-6 py-3.5 font-normal">
                      <span className="flex items-center gap-2">
                        {t.id.startsWith("txn-live-") && (
                          <span className="rounded-full bg-forest-2 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wider text-paper">New</span>
                        )}
                        {t.label}
                      </span>
                      <span className="block text-[0.78rem] text-ink-faint">
                        {t.kind === "product" ? "Craft sale" : "Experience"}, {t.reference}
                      </span>
                    </th>
                    <td className="px-4 py-3.5 text-ink-soft">{formatDate(t.date)}</td>
                    <td className="px-4 py-3.5 text-right">{formatINR(t.gross)}</td>
                    <td className="px-4 py-3.5 text-right text-ink-soft">{formatINR(t.platformFee)}</td>
                    <td className="px-6 py-3.5 text-right font-semibold">{formatINR(t.custodianNet)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-ink/15">
                  <th scope="row" className="px-6 py-3.5 text-left font-medium">
                    Total
                  </th>
                  <td />
                  <td className="px-4 py-3.5 text-right font-medium">{formatINR(summary.gross)}</td>
                  <td className="px-4 py-3.5 text-right font-medium text-ink-soft">{formatINR(summary.fees)}</td>
                  <td className="px-6 py-3.5 text-right font-semibold">{formatINR(summary.net)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <section aria-labelledby="where-money" className="grid gap-6 lg:grid-cols-3">
          <h2 id="where-money" className="sr-only">
            Where each payment goes
          </h2>
          <div className="border border-ink/10 bg-paper p-6">
            <p className="text-[0.92rem] text-ink-soft">An experience booking</p>
            <PayoutFlow tone="light" gross={1500} platformFee={150} custodianNet={1350} className="mt-4" />
          </div>
          <div className="border border-ink/10 bg-paper p-6">
            <p className="text-[0.92rem] text-ink-soft">A craft sale</p>
            <PayoutFlow tone="light" gross={1000} platformFee={50} custodianNet={950} className="mt-4" />
          </div>
          <div className="flex flex-col border border-ink/10 bg-night p-6 text-ivory">
            <p className="text-[0.92rem] text-ivory-dim">Community contribution this season</p>
            <p className="mt-3 text-[2.6rem] font-semibold leading-none">
              <CountUp value={COMMUNITY_CONTRIBUTION_BASE + communityShareAdded} format={formatINR} />
            </p>
            <p className="mt-auto pt-6 text-[0.92rem] leading-relaxed text-ivory-dim">
              You chose to share {Math.round(COMMUNITY_SHARE * 100)}% of your payouts with the troupe&apos;s artists and musicians.
            </p>
          </div>
        </section>
      </WorkspaceBody>
    </div>
  );
}
