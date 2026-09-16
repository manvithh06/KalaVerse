"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { KireetaRings } from "@/components/cultural/ornaments";
import { BoundaryCards } from "@/components/consent/boundary-cards";
import { Reveal } from "./reveal";

export function Tagline() {
  return (
    <section aria-label="The Kalaverse principle" className="relative bg-night text-ivory">
      <div className="page-gutter mx-auto max-w-[1440px] py-24 lg:py-36">
        <p className="font-titling text-[clamp(2.2rem,6vw,6rem)] uppercase leading-[0.98]">
          <Reveal className="text-ivory/40">The tourist chooses the experience.</Reveal>
          <Reveal delay={0.25}>The custodian chooses the terms.</Reveal>
        </p>
      </div>
    </section>
  );
}

export function CultureIsNotContent() {
  return (
    <section aria-labelledby="not-content" className="relative bg-limewash text-ink">
      <div className="text-laterite">
        <div className="kasuti-rule" />
      </div>
      <div className="page-gutter mx-auto grid max-w-[1440px] gap-12 py-24 lg:grid-cols-12 lg:py-36">
        <h2 id="not-content" className="font-titling text-[clamp(3.4rem,9.6vw,9.4rem)] uppercase leading-[0.9] lg:col-span-7">
          <Reveal>Culture</Reveal>
          <Reveal delay={0.1}>is not</Reveal>
          <Reveal delay={0.2}>content.</Reveal>
        </h2>
        <div className="flex flex-col justify-end lg:col-span-5 lg:pb-3">
          <p className="max-w-md text-[1.2rem] leading-relaxed text-ink-soft">Most cultural tourism platforms begin with the tourist.</p>
          <p className="mt-2 font-serif text-[clamp(1.9rem,3vw,2.7rem)] italic leading-tight text-ink">We begin with the custodian.</p>
          <p className="mt-8 max-w-md text-[1rem] leading-relaxed text-ink-soft">
            The performer, the farmer, the cook and the weaver: the people who carry a tradition decide how it is shared, who may enter,
            and what stays theirs.
          </p>
        </div>
      </div>
    </section>
  );
}

export function BoundariesSection() {
  return (
    <section aria-labelledby="boundaries" className="bg-night text-ivory">
      <div className="page-gutter mx-auto max-w-[1440px] pb-14 pt-28 lg:pt-40">
        <h2 id="boundaries" className="font-titling text-[clamp(3.4rem,9vw,8.6rem)] uppercase leading-[0.9]">
          <Reveal>Culture</Reveal>
          <Reveal delay={0.1}>has</Reveal>
          <Reveal delay={0.2}>boundaries.</Reveal>
        </h2>
      </div>
      <BoundaryCards />
      <div className="page-gutter mx-auto max-w-[1440px] py-20 lg:py-28">
        <p className="max-w-3xl font-serif text-[clamp(1.5rem,2.6vw,2.25rem)] italic leading-snug text-ivory-dim">
          Kalaverse lets custodians decide what the world gets to see — and what should remain theirs.
        </p>
      </div>
    </section>
  );
}

const CLOSING = [
  {
    lines: ["Culture is not content."],
    after: ["It is identity.", "It is memory.", "It is livelihood.", "It is community."],
  },
  { lines: ["You decide what", "the world gets to see."] },
  { lines: ["AI never defines culture.", "The custodian does."] },
  { lines: ["If a community cannot control it,", "Kalaverse does not publish it."] },
];

export function FinalStatement() {
  return (
    <section aria-label="Closing statement" className="relative overflow-hidden bg-night text-ivory">
      {CLOSING.map((block, i) => (
        <div key={i} className="border-t border-ivory/[0.06]">
          <div className="page-gutter mx-auto flex min-h-[72svh] max-w-[1440px] flex-col justify-center py-24">
            <h2 className="font-titling text-[clamp(2.3rem,5.8vw,5.6rem)] uppercase leading-[0.98]">
              {block.lines.map((line, j) => (
                <Reveal key={line} delay={j * 0.14}>
                  {line}
                </Reveal>
              ))}
            </h2>
            {block.after && (
              <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {block.after.map((line, j) => (
                  <Reveal key={line} delay={0.35 + j * 0.14} className="font-serif text-[clamp(1.45rem,2.3vw,2.1rem)] italic text-ivory-dim">
                    {line}
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}

      <div className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden border-t border-ivory/[0.06] px-4 py-28 text-center">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "radial-gradient(55% 45% at 50% 100%, rgb(240 138 58 / 0.24), transparent 72%)" }}
        />
        <KireetaRings rings={6} studs={64} className="pointer-events-none absolute left-1/2 top-1/2 size-[min(140vw,1100px)] -translate-x-1/2 -translate-y-1/2 text-gold/[0.08]" />
        <p className="relative font-titling text-[clamp(2.1rem,5.6vw,5.4rem)] uppercase leading-[0.98]">
          <Reveal className="text-ivory/40">The tourist chooses the experience.</Reveal>
          <Reveal delay={0.25}>The custodian chooses the terms.</Reveal>
        </p>
        <p className="relative mt-10 font-serif text-[1.35rem] italic text-ivory-dim">Culture on Their Terms.</p>
        <div className="relative mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" caps>
            <Link href="/discover">Explore Karnataka</Link>
          </Button>
          <Button asChild size="lg" caps variant="outline">
            <Link href="/register">Become a custodian</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
