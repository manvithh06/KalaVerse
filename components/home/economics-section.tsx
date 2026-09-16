"use client";

import { useMemo } from "react";
import { EARNINGS_HISTORY } from "@/data/seed";
import { useNow } from "@/store/hooks";
import { monthLabel } from "@/lib/utils";
import type { EarningsPoint } from "@/lib/stats";
import { PayoutFlow } from "@/components/economics/payout-flow";
import { EarningsChart } from "@/components/economics/earnings-chart";
import { TrustLadder } from "@/components/cultural/trust-ladder";
import { Skeleton } from "@/components/ui/skeleton";

export function EconomicsSection() {
  const now = useNow();
  const points = useMemo<EarningsPoint[] | null>(() => {
    if (!now) return null;
    return [
      ...EARNINGS_HISTORY.map((h) => ({
        label: monthLabel(new Date(now.getFullYear(), now.getMonth() - h.monthsAgo, 1)),
        net: h.net,
        bookings: h.bookings,
        productSales: h.productSales,
        current: false,
      })),
      { label: monthLabel(now), net: 24800, bookings: 9, productSales: 1, current: true },
    ];
  }, [now]);

  return (
    <section aria-labelledby="economics" className="bg-limewash text-ink">
      <div className="text-laterite">
        <div className="tile-rule" />
      </div>
      <div className="page-gutter mx-auto max-w-[1440px] py-28 lg:py-40">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="economics" className="font-titling text-[clamp(2.3rem,4.8vw,4.6rem)] uppercase leading-[0.96]">
              Your culture.
              <br />
              Your value.
            </h2>
            <p className="mt-6 max-w-md text-[1.02rem] leading-relaxed text-ink-soft">
              Custodians set their own prices. Ninety percent of every experience booking goes to them, and ninety-five percent of every
              craft sale.
            </p>
            <div className="mt-12 border border-ink/10 bg-paper p-6 sm:p-8">
              <p className="text-[0.92rem] text-ink-soft">One booking of Yakshagana — Beyond the Stage</p>
              <PayoutFlow tone="light" gross={1500} platformFee={150} custodianNet={1350} className="mt-5" />
            </div>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <div className="border border-ink/10 bg-paper p-6 sm:p-8">
              <p className="text-[0.92rem] text-ink-soft">Earned this month by one Yakshagana custodian</p>
              <p className="mt-2 text-[clamp(2.8rem,5vw,3.6rem)] font-semibold leading-none tracking-tight">₹24,800</p>
              <p className="mt-2 text-[0.84rem] text-ink-faint">Demo figures for a fictional custodian</p>
              {points ? (
                <EarningsChart points={points} tone="light" className="mt-10" />
              ) : (
                <Skeleton tone="light" className="mt-10 h-[300px]" />
              )}
            </div>
          </div>
        </div>

        <div className="mt-28 border-t border-ink/10 pt-16">
          <div className="grid gap-6 lg:grid-cols-12">
            <h3 className="font-titling text-[clamp(1.9rem,3.2vw,2.8rem)] uppercase leading-none lg:col-span-5">The trust ladder</h3>
            <p className="max-w-xl text-[1.02rem] leading-relaxed text-ink-soft lg:col-span-6 lg:col-start-7">
              Trust is earned from a custodian&apos;s own community and from the visitors they host, one level at a time.
            </p>
          </div>
          <TrustLadder tone="light" className="mt-14" />
        </div>
      </div>
    </section>
  );
}
