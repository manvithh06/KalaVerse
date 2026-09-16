"use client";

import { useMemo } from "react";
import { useKalaverse } from "@/store/kalaverse";
import { useHydrated } from "@/store/hooks";
import { isDiscoverable } from "@/lib/consent";
import { impactFigures } from "@/lib/stats";
import { CountUp } from "@/components/ui/count-up";
import { Skeleton } from "@/components/ui/skeleton";
import { formatINR } from "@/lib/utils";

export function ImpactView() {
  const hydrated = useHydrated();
  const experiences = useKalaverse((s) => s.experiences);
  const bookings = useKalaverse((s) => s.bookings);
  const transactions = useKalaverse((s) => s.transactions);

  const figures = useMemo(() => impactFigures(experiences, bookings, transactions), [experiences, bookings, transactions]);
  const listed = experiences.filter(isDiscoverable);
  const custodianWritten = listed.filter((e) => e.descriptionSource === "custodian" || e.descriptionSource === "ai_approved" || e.descriptionSource === "ai_edited").length;
  const exposed = experiences.filter((e) => e.consent.accessLevel === "protected" && isDiscoverable(e)).length;

  const tiles = [
    { value: figures.experiences, label: "Cultural experiences", note: "Listed on their custodians' terms" },
    { value: figures.custodians, label: "Active custodians", note: "Verified by their own communities" },
    { value: figures.protectedPractices, label: "Protected practices", note: "Kept out of discovery, sale and AI" },
    { value: figures.participants, label: "Respectful participants", note: "Each accepted a custodian's terms first" },
  ];

  const pillars = [
    {
      name: "Economic",
      claim: "More direct community income",
      evidence: "90% of every experience booking and 95% of every craft sale goes to the custodian.",
    },
    {
      name: "Cultural",
      claim: "Custodians control representation",
      evidence: `${custodianWritten} of ${listed.length} listed descriptions were written or approved by their custodians.`,
    },
    {
      name: "Social",
      claim: "Visitors learn before participating",
      evidence: `${figures.participants} participants read the custodian's terms and context before they arrived.`,
    },
    {
      name: "Preservation",
      claim: "Protected knowledge stays protected",
      evidence: `${exposed} protected practices listed, sold or described by AI.`,
    },
  ];

  return (
    <div className="bg-night text-ivory">
      <header className="page-gutter mx-auto max-w-[1440px] pb-14 pt-28 lg:pt-36">
        <h1 className="font-titling text-[clamp(2.6rem,6.4vw,6rem)] uppercase leading-[0.94]">
          Measure
          <br />
          what matters.
        </h1>
        <p className="t-voice mt-6 max-w-2xl text-ivory-dim">
          Not how many people consumed a culture, but whether it stayed in the hands of the people who carry it.
        </p>
      </header>

      <section aria-label="Network figures" className="page-gutter mx-auto max-w-[1440px]">
        <div className="grid gap-px overflow-hidden border border-ivory/10 bg-ivory/10 md:grid-cols-2 xl:grid-cols-[1.5fr_1fr_1fr]">
          <div className="flex flex-col justify-between bg-night-2 p-7 sm:p-9 md:col-span-2 xl:col-span-1 xl:row-span-2">
            <p className="text-[0.95rem] text-ivory-dim">Custodian earnings</p>
            <div>
              <p className="mt-6 text-[clamp(3.4rem,7vw,5.6rem)] font-semibold leading-none tracking-tight">
                {hydrated ? <CountUp value={figures.custodianEarnings} format={formatINR} /> : <Skeleton className="h-20 w-72" />}
              </p>
              <p className="mt-3 text-[0.9rem] text-ash">Paid directly to custodians across the network</p>
            </div>
          </div>
          {tiles.map((t) => (
            <div key={t.label} className="bg-night-2 p-7">
              <p className="text-[0.95rem] text-ivory-dim">{t.label}</p>
              <p className="mt-4 text-[2.8rem] font-semibold leading-none">{hydrated ? <CountUp value={t.value} /> : <Skeleton className="h-11 w-24" />}</p>
              <p className="mt-3 text-[0.86rem] text-ash">{t.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="pillars" className="page-gutter mx-auto max-w-[1440px] py-24 lg:py-32">
        <h2 id="pillars" className="t-title">
          Four measures of impact
        </h2>
        <div className="mt-10 grid gap-px overflow-hidden border border-ivory/10 bg-ivory/10 md:grid-cols-2 xl:grid-cols-4">
          {pillars.map((p) => (
            <article key={p.name} className="flex min-h-72 flex-col bg-night p-7">
              <h3 className="font-titling text-[1.6rem] uppercase leading-none">{p.name}</h3>
              <p className="mt-3 text-[1.02rem] text-gold-light">{p.claim}</p>
              <p className="mt-auto pt-10 font-serif text-[1.12rem] leading-snug text-ivory-dim">{hydrated ? p.evidence : "Loading"}</p>
            </article>
          ))}
        </div>
        <p className="mt-8 text-[0.86rem] text-ash">Network figures are demo data. Bookings and protections made in this session are added live.</p>
      </section>
    </div>
  );
}
