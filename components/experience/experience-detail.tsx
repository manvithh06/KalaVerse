"use client";

import Link from "next/link";
import { BadgeCheck, Bookmark, BookmarkCheck, CircleSlash, MapPin, Sparkles } from "lucide-react";
import type { Experience } from "@/types";
import { useKalaverse } from "@/store/kalaverse";
import { useCustodian, useDiscoverableExperiences, useExperience, useHydrated } from "@/store/hooks";
import { CulturalPlate } from "@/components/cultural/plates";
import { TrustBadge } from "@/components/cultural/trust-badge";
import { EmptyState, KireetaLoader, ProtectedNotice } from "@/components/cultural/states";
import { AccessBadge } from "@/components/consent/access-badge";
import { ConsentCard } from "@/components/consent/consent-card";
import { Button } from "@/components/ui/button";
import { ExperienceCard, splitTitle } from "./experience-card";
import { cn, formatDuration, formatINR, formatLanguages, formatSchedule } from "@/lib/utils";

const PROVENANCE: Record<Experience["descriptionSource"], string> = {
  custodian: "Written by the custodian",
  ai_approved: "Drafted with AI, approved by the custodian",
  ai_edited: "Drafted with AI, edited and approved by the custodian",
};

export function ExperienceDetail({ id }: { id: string }) {
  const hydrated = useHydrated();
  const experience = useExperience(id);

  if (!hydrated) {
    return (
      <div className="grid min-h-[90vh] place-items-center bg-night pt-16">
        <KireetaLoader label="Loading experience" />
      </div>
    );
  }

  if (!experience) {
    return (
      <div className="page-gutter mx-auto max-w-3xl pb-24 pt-32">
        <EmptyState
          icon={<CircleSlash className="size-6" aria-hidden />}
          title="This experience isn't listed"
          body="It may have been removed by its custodian, or the link may be wrong."
          action={
            <Button asChild variant="outline">
              <Link href="/discover">Back to discovery</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (experience.consent.accessLevel === "protected") {
    return (
      <div className="pt-14 lg:pt-16">
        <ProtectedNotice
          className="min-h-[80vh] py-28"
          action={
            <Button asChild variant="outline">
              <Link href="/discover">Back to discovery</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (experience.status !== "published") {
    return (
      <div className="page-gutter mx-auto max-w-3xl pb-24 pt-32">
        <EmptyState
          title="Not published yet"
          body="The custodian is still preparing this experience. It will appear in discovery once they publish it."
          action={
            <Button asChild variant="outline">
              <Link href="/discover">Back to discovery</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return <Detail experience={experience} />;
}

function Detail({ experience }: { experience: Experience }) {
  const custodian = useCustodian(experience.custodianId);
  const saved = useKalaverse((s) => s.savedExperienceIds.includes(experience.id));
  const toggleSaved = useKalaverse((s) => s.toggleSaved);
  const discoverable = useDiscoverableExperiences();
  const more = discoverable.filter((e) => e.custodianId === experience.custodianId && e.id !== experience.id).slice(0, 3);
  const lines = splitTitle(experience.title);
  const bookHref = `/experiences/${experience.id}/book`;
  const initials = custodian?.name.split(" ").map((p) => p[0]).slice(0, 2).join("");

  return (
    <article className="bg-night text-ivory">
      <div className="relative h-[70svh] min-h-[520px] overflow-hidden">
        <CulturalPlate motif={experience.motif} className="absolute inset-0 opacity-70" />
        <div
          aria-hidden
          className="absolute inset-0 z-[2] bg-[linear-gradient(0deg,#110d0b_3%,rgb(17_13_11/0.72)_42%,rgb(17_13_11/0.25)_100%)]"
        />
        <div className="page-gutter relative z-[3] mx-auto flex h-full max-w-[1440px] flex-col justify-end pb-12">
          <nav aria-label="Breadcrumb" className="mb-7 text-[0.88rem] text-ivory-dim">
            <Link href="/discover" className="hover:text-ivory">
              Discover
            </Link>
            <span aria-hidden className="mx-2 text-ash">
              /
            </span>
            <span aria-current="page">{experience.practice}</span>
          </nav>
          <AccessBadge level={experience.consent.accessLevel} size="lg" />
          <h1 className="mt-6 font-titling text-[clamp(2.5rem,7vw,6.6rem)] uppercase leading-[0.92]">
            {lines.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-[1.05rem] text-ivory-dim">
            <MapPin className="size-4" aria-hidden />
            {experience.location}
            <span className="text-ash">{experience.district}</span>
          </p>
        </div>
      </div>

      <div className="page-gutter mx-auto grid max-w-[1440px] gap-14 pb-32 pt-12 lg:grid-cols-12 lg:pb-28">
        <div className="lg:col-span-7">
          {custodian && (
            <section aria-labelledby="hosted-by" className="flex flex-col gap-5 border-b border-ivory/10 pb-10 sm:flex-row sm:items-center">
              <span className="grid size-16 shrink-0 place-items-center rounded-full border border-gold/40 bg-maroon font-titling text-lg tracking-wider text-gold-light">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <p id="hosted-by" className="text-[0.85rem] text-ash">
                  Hosted by
                </p>
                <Link href={`/custodians/${custodian.id}`} className="mt-0.5 inline-block font-serif text-[1.6rem] italic leading-tight hover:underline">
                  {custodian.name}
                </Link>
                <p className="mt-1.5 flex items-center gap-2 text-[0.92rem]">
                  <BadgeCheck className="size-4 text-open" aria-hidden />
                  Verified Cultural Custodian
                </p>
              </div>
              <TrustBadge level={custodian.trustLevel} />
            </section>
          )}

          <dl className="grid grid-cols-2 gap-x-6 gap-y-8 border-b border-ivory/10 py-10 sm:grid-cols-4">
            {[
              ["Duration", formatDuration(experience.durationMinutes)],
              ["Price", formatINR(experience.price)],
              ["Languages", formatLanguages(experience.languages)],
              ["Group size", `Up to ${experience.consent.maxGroup}`],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-[0.82rem] text-ash">{label}</dt>
                <dd className="mt-1.5 text-[1.1rem] text-ivory">{value}</dd>
              </div>
            ))}
            <div className="col-span-2 sm:col-span-4">
              <dt className="text-[0.82rem] text-ash">Availability</dt>
              <dd className="mt-1.5 text-[1.05rem] text-ivory">{formatSchedule(experience.schedule.days, experience.schedule.time)}</dd>
            </div>
          </dl>

          <section aria-labelledby="in-their-words" className="border-b border-ivory/10 py-12">
            <h2 id="in-their-words" className="t-subtitle">
              In the custodian&apos;s words
            </h2>
            <p className="mt-6 max-w-[62ch] font-serif text-[1.2rem] leading-[1.75] text-ivory">{experience.description}</p>
            <p className="mt-5 inline-flex items-center gap-2 text-[0.84rem] text-ash">
              {experience.descriptionSource === "custodian" ? (
                <BadgeCheck className="size-4 text-open" aria-hidden />
              ) : (
                <Sparkles className="size-4 text-indigo-light" aria-hidden />
              )}
              {PROVENANCE[experience.descriptionSource]}
            </p>
          </section>

          {experience.itinerary.length > 0 && (
            <section aria-labelledby="what-happens" className="border-b border-ivory/10 py-12">
              <h2 id="what-happens" className="t-subtitle">
                What happens
              </h2>
              <ol className="mt-8 space-y-6">
                {experience.itinerary.map((step, i) => (
                  <li key={step.title} className="grid grid-cols-[2.5rem_1fr] gap-4">
                    <span className="t-num pt-0.5 text-[1.3rem] text-gold-light">{i + 1}</span>
                    <div>
                      <p className="text-[1.05rem] font-medium">{step.title}</p>
                      <p className="mt-1 text-ivory-dim">{step.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {experience.learnBefore.length > 0 && (
            <section aria-labelledby="learn-before" className="border-b border-ivory/10 py-12">
              <h2 id="learn-before" className="t-subtitle">
                Before you arrive
              </h2>
              <p className="mt-2 text-[0.92rem] text-ash">Context the custodian asks visitors to read first.</p>
              <ul className="mt-6 space-y-4">
                {experience.learnBefore.map((line) => (
                  <li key={line} className="flex gap-4 font-serif text-[1.1rem] leading-relaxed text-ivory-dim">
                    <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rotate-45 bg-gold" />
                    {line}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {experience.consent.rules.length > 0 && (
            <section aria-labelledby="community-rules" className="py-12">
              <h2 id="community-rules" className="t-subtitle">
                Community rules
              </h2>
              <ul className="mt-6 divide-y divide-ivory/[0.08] border-y border-ivory/[0.08]">
                {experience.consent.rules.map((rule) => (
                  <li key={rule.id} className="flex gap-4 py-4 text-[1rem] text-ivory">
                    <span aria-hidden className="mt-2 h-px w-4 shrink-0 bg-gold" />
                    {rule.text}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="lg:col-span-5" aria-label="Terms and booking">
          <div className="lg:sticky lg:top-24">
            <ConsentCard
              consent={experience.consent}
              price={experience.price}
              languages={experience.languages}
              custodianName={custodian?.name}
            />
            <div className="mt-4 border border-ivory/10 bg-night-2 p-6">
              <div className="flex items-baseline justify-between gap-4">
                <span className="text-ivory-dim">Per person</span>
                <span className="t-num text-[2rem]">{formatINR(experience.price)}</span>
              </div>
              <Button asChild caps size="lg" className="mt-5 w-full">
                <Link href={bookHref}>Continue to book</Link>
              </Button>
              <p className="mt-3 text-center text-[0.86rem] text-ash">You&apos;ll read and accept the custodian&apos;s terms before booking.</p>
              <button
                type="button"
                onClick={() => toggleSaved(experience.id)}
                aria-pressed={saved}
                className="mx-auto mt-3 flex h-10 items-center gap-2 px-3 text-[0.88rem] text-ivory-dim hover:text-ivory"
              >
                {saved ? <BookmarkCheck className="size-4 text-gold-light" aria-hidden /> : <Bookmark className="size-4" aria-hidden />}
                {saved ? "Saved to your experiences" : "Save for later"}
              </button>
            </div>
          </div>
        </aside>
      </div>

      {more.length > 0 && (
        <section aria-labelledby="more-from" className="border-t border-ivory/[0.08] bg-night-2">
          <div className="page-gutter mx-auto max-w-[1440px] py-20">
            <h2 id="more-from" className="t-title">
              More from {custodian?.name}
            </h2>
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {more.map((e) => (
                <ExperienceCard key={e.id} experience={e} />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-ivory/10 bg-night-2/95 backdrop-blur-md lg:hidden">
        <div className="page-gutter flex h-[4.5rem] items-center justify-between gap-4">
          <div>
            <p className="t-num text-[1.4rem]">{formatINR(experience.price)}</p>
            <p className={cn("text-[0.78rem] text-ash")}>per person, custodian&apos;s terms apply</p>
          </div>
          <Button asChild caps>
            <Link href={bookHref}>Continue to book</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
