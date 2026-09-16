"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { AccessLevel } from "@/types";
import { HERO_EXPERIENCE_ID, seedExperiences } from "@/data/experiences";
import { applyAccessLevel } from "@/lib/consent";
import { ConsentCard } from "@/components/consent/consent-card";
import { AccessSelector } from "@/components/consent/access-selector";
import { Switch } from "@/components/ui/switch";

const hero = seedExperiences.find((e) => e.id === HERO_EXPERIENCE_ID)!;

export function ConsentShowcase() {
  const [level, setLevel] = useState<AccessLevel>("guided");
  const [photography, setPhotography] = useState(false);
  const consent = useMemo(() => applyAccessLevel({ ...hero.consent, photography }, level), [level, photography]);

  return (
    <section aria-labelledby="consent-title" className="relative overflow-hidden bg-night-2 text-ivory">
      <div className="page-gutter mx-auto grid max-w-[1440px] items-start gap-16 py-28 lg:grid-cols-12 lg:py-40">
        <div className="lg:col-span-6 lg:pt-6">
          <h2 id="consent-title" className="font-titling text-[clamp(2.3rem,4.8vw,4.6rem)] uppercase leading-[0.96]">
            Every experience
            <br />
            carries its terms.
          </h2>
          <p className="t-voice mt-8 max-w-lg text-ivory-dim">
            Every experience is published on the custodian&apos;s terms. Visitors read them before they book, and accept them before they
            enter.
          </p>

          <div className="mt-14 max-w-xl">
            <p className="text-[0.9rem] text-ash">Try the custodian&apos;s controls. The card updates as you change them.</p>
            <div className="mt-4">
              <AccessSelector tone="dark" value={level} onChange={setLevel} showExplanation={false} />
            </div>
            <label className="mt-3 flex min-h-14 items-center justify-between gap-4 rounded-[4px] border border-ivory/12 px-4">
              <span className="text-[0.95rem]">
                Allow photography
                {level === "protected" && <span className="ml-2 text-[0.82rem] text-ash">Locked by protection</span>}
              </span>
              <Switch tone="dark" checked={consent.photography} disabled={level === "protected"} onCheckedChange={setPhotography} />
            </label>
          </div>
        </div>

        <div className="lg:col-span-5 lg:col-start-8">
          <ConsentCard consent={consent} price={hero.price} languages={hero.languages} custodianName="Vasudeva Poojary" />
          <p className="mt-4 text-[0.88rem] text-ash">
            Terms for Yakshagana — Beyond the Stage.{" "}
            <Link href={`/experiences/${hero.id}`} className="text-ivory underline decoration-gold/60 underline-offset-4 hover:decoration-gold-light">
              Open this experience
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
