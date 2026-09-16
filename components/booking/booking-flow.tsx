"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, CircleSlash, LoaderCircle, Minus, Plus, TriangleAlert } from "lucide-react";
import type { Booking, Experience } from "@/types";
import { useKalaverse } from "@/store/kalaverse";
import { useCustodian, useExperience, useHydrated, useNow } from "@/store/hooks";
import { CURRENT_CUSTODIAN_ID } from "@/data/custodians";
import { isBookable, RESPECT_PLEDGES } from "@/lib/consent";
import { payoutFor } from "@/lib/economics";
import { fromDateKey, upcomingSessions } from "@/lib/availability";
import { CulturalPlate } from "@/components/cultural/plates";
import { KireetaRings } from "@/components/cultural/ornaments";
import { EmptyState, KireetaLoader, ProtectedNotice } from "@/components/cultural/states";
import { ConsentCard } from "@/components/consent/consent-card";
import { PayoutFlow } from "@/components/economics/payout-flow";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { useRoleCrossing } from "@/components/layout/role-switcher";
import { cn, formatDate, formatINR, formatTime } from "@/lib/utils";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function sessionText(dateKey: string, time: string) {
  const d = fromDateKey(dateKey);
  return `${DAYS[d.getDay()].slice(0, 3)} ${d.getDate()} ${MONTHS[d.getMonth()]}, ${formatTime(time)}`;
}

export function BookingFlow({ id }: { id: string }) {
  const hydrated = useHydrated();
  const experience = useExperience(id);
  const params = useSearchParams();
  const confirmedId = params.get("confirmed");
  const booking = useKalaverse((s) => (confirmedId ? s.bookings.find((b) => b.id === confirmedId) : undefined));

  if (!hydrated) {
    return (
      <div className="grid min-h-[90vh] place-items-center bg-night">
        <KireetaLoader label="Preparing the custodian's terms" />
      </div>
    );
  }

  if (booking) return <BookingConfirmed booking={booking} />;

  if (!experience) {
    return (
      <div className="page-gutter mx-auto max-w-3xl pb-24 pt-32">
        <EmptyState
          icon={<CircleSlash className="size-6" aria-hidden />}
          title="This experience isn't listed"
          body="It can't be booked. It may have been removed by its custodian."
          action={
            <Button asChild variant="outline">
              <Link href="/discover">Back to discovery</Link>
            </Button>
          }
        />
      </div>
    );
  }

  if (!isBookable(experience)) {
    return (
      <div className="pt-14 lg:pt-16">
        <ProtectedNotice
          className="min-h-[80vh] py-28"
          title="This practice cannot be booked"
          body="Its custodian keeps it within the community. Kalaverse does not take bookings, payments or requests for protected practices."
          action={
            <Button asChild variant="outline">
              <Link href="/discover">Back to discovery</Link>
            </Button>
          }
        />
      </div>
    );
  }

  return <BookingForm experience={experience} />;
}

function StepHeading({ n, id, title, done }: { n: number; id: string; title: string; done: boolean }) {
  return (
    <div className="flex items-center gap-4 border-b border-ivory/10 pb-4">
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-full border text-[0.9rem] font-semibold transition-colors duration-300",
          done ? "border-gold-light bg-gold-light text-night" : "border-ivory/25 text-ivory",
        )}
      >
        {done ? <Check className="size-4" strokeWidth={3} aria-label="Done" /> : n}
      </span>
      <h2 id={id} className="t-subtitle">
        {title}
      </h2>
    </div>
  );
}

function BookingForm({ experience }: { experience: Experience }) {
  const router = useRouter();
  const custodian = useCustodian(experience.custodianId);
  const bookings = useKalaverse((s) => s.bookings);
  const bookExperience = useKalaverse((s) => s.bookExperience);
  const now = useNow();
  const sessions = useMemo(() => (now ? upcomingSessions(experience, bookings, now, 6) : []), [now, experience, bookings]);

  const [chosenDate, setChosenDate] = useState<string | null>(null);
  const [guests, setGuests] = useState(1);
  const [accepted, setAccepted] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeDate = chosenDate ?? sessions.find((s) => s.left > 0)?.date ?? null;
  const session = sessions.find((s) => s.date === activeDate);
  const maxGuests = Math.max(1, Math.min(experience.consent.maxGroup, session?.left ?? 1));
  const guestCount = Math.min(guests, maxGuests);
  const allAccepted = RESPECT_PLEDGES.every((p) => accepted.includes(p.id));
  const ready = Boolean(session && session.left > 0 && allAccepted);
  const payout = payoutFor(experience.price * guestCount, "experience");

  const toggle = (pledge: string, on: boolean) =>
    setAccepted((list) => (on ? Array.from(new Set([...list, pledge])) : list.filter((x) => x !== pledge)));

  async function submit() {
    if (!session || !ready || submitting) return;
    setError(null);
    setSubmitting(true);
    await new Promise((resolve) => window.setTimeout(resolve, 1500));
    const result = bookExperience({
      experienceId: experience.id,
      date: session.date,
      time: session.time,
      guests: guestCount,
      acceptedPledges: accepted,
    });
    if (!result.ok) {
      setSubmitting(false);
      setError(result.reason);
      return;
    }
    window.scrollTo({ top: 0 });
    router.replace(`/experiences/${experience.id}/book?confirmed=${result.booking.id}`, { scroll: false });
  }

  return (
    <div className="bg-night text-ivory">
      <div className="page-gutter mx-auto max-w-[1440px] pb-28 pt-24 lg:pt-28">
        <Link href={`/experiences/${experience.id}`} className="inline-flex h-10 items-center gap-2 text-[0.9rem] text-ivory-dim hover:text-ivory">
          <ArrowLeft className="size-4" aria-hidden />
          Back to the experience
        </Link>

        <header className="mt-8 grid gap-8 lg:grid-cols-12">
          <h1 className="font-titling text-[clamp(2.8rem,7.4vw,6.6rem)] uppercase leading-[0.9] lg:col-span-7">
            Enter with
            <br />
            respect
          </h1>
          <p className="self-end font-serif text-[clamp(1.25rem,2vw,1.65rem)] italic leading-snug text-ivory-dim lg:col-span-5">
            You&apos;re entering a living cultural practice, not simply attending a tourist attraction.
          </p>
        </header>

        <div className="mt-16 grid gap-12 lg:grid-cols-12">
          <div className="space-y-16 lg:col-span-7">
            <section aria-labelledby="step-session">
              <StepHeading n={1} id="step-session" title="Choose a session" done={Boolean(session)} />
              {!now ? (
                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {Array.from({ length: 6 }, (_, i) => (
                    <Skeleton key={i} className="h-28" />
                  ))}
                </div>
              ) : sessions.length === 0 ? (
                <p className="mt-6 text-ivory-dim">The custodian hasn&apos;t opened any sessions yet.</p>
              ) : (
                <div role="radiogroup" aria-label="Session" className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {sessions.map((s) => {
                    const d = fromDateKey(s.date);
                    const full = s.left <= 0;
                    const on = s.date === activeDate;
                    return (
                      <button
                        key={s.date}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        disabled={full}
                        onClick={() => setChosenDate(s.date)}
                        className={cn(
                          "flex flex-col items-start rounded-[4px] border p-4 text-left transition-colors duration-200",
                          on ? "border-gold-light bg-gold/[0.08]" : "border-ivory/12 hover:border-ivory/35",
                          full && "cursor-not-allowed opacity-40",
                        )}
                      >
                        <span className="text-[0.8rem] text-ash">{DAYS[d.getDay()]}</span>
                        <span className="mt-1 text-[1.15rem] font-medium">
                          {d.getDate()} {MONTHS[d.getMonth()]}
                        </span>
                        <span className="text-[0.88rem] text-ivory-dim">{formatTime(s.time)}</span>
                        <span className={cn("mt-3 text-[0.8rem]", full ? "text-protected" : s.left <= 3 ? "text-guided" : "text-ash")}>
                          {full ? "Full" : `${s.left} ${s.left === 1 ? "place" : "places"} left`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-[4px] border border-ivory/12 p-4">
                <div>
                  <p className="font-medium">Guests</p>
                  <p className="text-[0.86rem] text-ash">Up to {experience.consent.maxGroup} per session, set by the custodian.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="icon" aria-label="Remove a guest" disabled={guestCount <= 1} onClick={() => setGuests(guestCount - 1)}>
                    <Minus aria-hidden />
                  </Button>
                  <output aria-live="polite" aria-label="Guests" className="w-8 text-center text-[1.3rem] font-semibold">
                    {guestCount}
                  </output>
                  <Button variant="outline" size="icon" aria-label="Add a guest" disabled={guestCount >= maxGuests} onClick={() => setGuests(guestCount + 1)}>
                    <Plus aria-hidden />
                  </Button>
                </div>
              </div>
            </section>

            <section aria-labelledby="step-terms">
              <StepHeading n={2} id="step-terms" title="Read the custodian's terms" done={allAccepted} />
              <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                <ConsentCard consent={experience.consent} price={experience.price} languages={experience.languages} custodianName={custodian?.name} compact />
                {experience.consent.rules.length > 0 && (
                  <div>
                    <h3 className="text-[0.95rem] font-medium">Rules for this experience</h3>
                    <ul className="mt-4 divide-y divide-ivory/[0.08] border-y border-ivory/[0.08]">
                      {experience.consent.rules.map((rule) => (
                        <li key={rule.id} className="flex gap-3 py-3.5 text-[0.95rem] text-ivory-dim">
                          <span aria-hidden className="mt-2.5 h-px w-3 shrink-0 bg-gold" />
                          {rule.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>

            <section aria-labelledby="step-commit">
              <StepHeading n={3} id="step-commit" title="Accept the commitments" done={allAccepted} />
              <ul className="mt-6 space-y-3">
                {RESPECT_PLEDGES.map((pledge) => {
                  const on = accepted.includes(pledge.id);
                  return (
                    <li key={pledge.id}>
                      <label
                        className={cn(
                          "flex min-h-16 cursor-pointer items-center gap-4 rounded-[4px] border px-4 py-3 transition-colors duration-200",
                          on ? "border-gold-light/60 bg-gold/[0.06]" : "border-ivory/12 hover:border-ivory/30",
                        )}
                      >
                        <Checkbox checked={on} onCheckedChange={(v) => toggle(pledge.id, v === true)} />
                        <span className="text-[1.02rem] leading-snug">{pledge.text}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          </div>

          <aside className="lg:col-span-5" aria-label="Booking summary">
            <div className="border border-ivory/10 bg-night-2 lg:sticky lg:top-24">
              <div className="flex gap-4 border-b border-ivory/10 p-5">
                <CulturalPlate motif={experience.motif} className="size-20 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[0.82rem] text-gold-light">{experience.practice}</p>
                  <p className="mt-1 font-titling text-[1.05rem] uppercase leading-tight">{experience.title}</p>
                  <p className="mt-1 text-[0.86rem] text-ash">with {custodian?.name}</p>
                </div>
              </div>
              <dl className="space-y-3 p-5 text-[0.95rem]">
                <div className="flex justify-between gap-4">
                  <dt className="text-ivory-dim">Session</dt>
                  <dd className="text-right">{session ? sessionText(session.date, session.time) : "Not chosen"}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ivory-dim">Guests</dt>
                  <dd>{guestCount}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ivory-dim">
                    {formatINR(experience.price)} × {guestCount}
                  </dt>
                  <dd>{formatINR(experience.price * guestCount)}</dd>
                </div>
              </dl>
              <div className="border-t border-ivory/10 p-5">
                <PayoutFlow gross={payout.gross} platformFee={payout.platformFee} custodianNet={payout.custodianNet} />
              </div>
              <div className="border-t border-ivory/10 p-5">
                <Button caps size="lg" className="w-full" disabled={!ready || submitting} onClick={submit}>
                  {submitting ? (
                    <>
                      <LoaderCircle className="animate-spin" aria-hidden />
                      Recording consent
                    </>
                  ) : (
                    "I agree & book"
                  )}
                </Button>
                <p className="mt-3 text-center text-[0.86rem] text-ash" aria-live="polite">
                  {!session
                    ? "Choose a session to continue."
                    : !allAccepted
                      ? `Accept every commitment to continue: ${accepted.length} of ${RESPECT_PLEDGES.length} accepted.`
                      : "Your acceptance is recorded with this booking."}
                </p>
                {error && (
                  <div role="alert" className="mt-4 flex gap-3 rounded-[4px] border border-protected/40 bg-protected/10 p-3.5 text-[0.9rem]">
                    <TriangleAlert className="mt-0.5 size-4 shrink-0 text-protected" aria-hidden />
                    <div>
                      <p className="font-medium text-ivory">Booking not completed</p>
                      <p className="mt-0.5 text-ivory-dim">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <AnimatePresence>
        {submitting && (
          <motion.div
            key="recording"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] grid place-items-center bg-night/85 backdrop-blur-sm"
          >
            <KireetaLoader label="Recording your consent with the custodian's terms" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SuccessSeal() {
  return (
    <div className="relative grid size-32 place-items-center">
      <KireetaRings spin rings={3} studs={30} className="absolute inset-0 text-gold/40" />
      <svg viewBox="0 0 120 120" className="relative size-24" aria-hidden>
        <motion.circle
          cx="60"
          cy="60"
          r="46"
          fill="rgb(94 156 117 / 0.12)"
          stroke="var(--color-open)"
          strokeWidth="1.5"
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ transformOrigin: "60px 60px" }}
        />
        <motion.path
          d="M40 61 L54 75 L82 45"
          fill="none"
          stroke="var(--color-open)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.35, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
    </div>
  );
}

function BookingConfirmed({ booking }: { booking: Booking }) {
  const custodian = useCustodian(booking.custodianId);
  const cross = useRoleCrossing();

  return (
    <div className="relative overflow-hidden bg-night text-ivory">
      <KireetaRings rings={6} studs={60} className="pointer-events-none absolute left-1/2 top-16 size-[min(160vw,1000px)] -translate-x-1/2 text-gold/[0.05]" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="page-gutter relative mx-auto max-w-[1100px] pb-28 pt-28 lg:pt-36"
      >
        <div className="flex flex-col items-center text-center">
          <SuccessSeal />
          <h1 className="mt-8 font-titling text-[clamp(2.2rem,5.2vw,4.4rem)] uppercase leading-[0.98]">
            <span aria-hidden>✓ </span>Experience confirmed
          </h1>
          <p className="mt-5 max-w-xl font-serif text-[clamp(1.25rem,2vw,1.6rem)] italic text-ivory-dim">
            Welcome to a cultural experience on the community&apos;s terms.
          </p>
        </div>

        <div className="mt-16 grid gap-px overflow-hidden border border-ivory/10 bg-ivory/10 md:grid-cols-2">
          <section aria-label="Booking details" className="bg-night-2 p-7 sm:p-9">
            <p className="text-[0.86rem] text-ash">Booking ID</p>
            <p className="mt-2 text-[clamp(2rem,4.4vw,2.9rem)] font-semibold tracking-tight text-gold-light">{booking.id}</p>
            <dl className="mt-8 space-y-4 text-[0.95rem]">
              {[
                ["Experience", booking.experienceTitle],
                ["Hosted by", custodian?.name ?? ""],
                ["Session", sessionText(booking.date, booking.time)],
                ["Guests", String(booking.guests)],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-6">
                  <dt className="shrink-0 text-ivory-dim">{label}</dt>
                  <dd className="text-right">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section aria-labelledby="payment-goes" className="bg-night-2 p-7 sm:p-9">
            <h2 id="payment-goes" className="text-[0.86rem] text-ash">
              Where your payment goes
            </h2>
            <p className="mt-3 text-[clamp(1.9rem,3.6vw,2.6rem)] font-semibold leading-tight">
              {formatINR(booking.custodianNet)} <span className="font-normal text-ivory-dim">→ Custodian</span>
            </p>
            <PayoutFlow className="mt-8" gross={booking.gross} platformFee={booking.platformFee} custodianNet={booking.custodianNet} />
          </section>
        </div>

        <section aria-labelledby="consent-record" className="mt-6 border border-ivory/10 bg-night-2 p-7 sm:p-9">
          <h2 id="consent-record" className="t-subtitle">
            Your consent record
          </h2>
          <p className="mt-2 text-[0.92rem] text-ash">
            Accepted on {formatDate(booking.agreedAt)}, under version {booking.termsVersion} of the custodian&apos;s terms.
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {RESPECT_PLEDGES.map((p) => (
              <li key={p.id} className="flex gap-3 text-[0.95rem]">
                <Check className="mt-0.5 size-4 shrink-0 text-open" strokeWidth={3} aria-hidden />
                {p.text}
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild caps size="lg">
            <Link href="/experiences">View your experiences</Link>
          </Button>
          <Button asChild caps size="lg" variant="outline">
            <Link href="/discover">Discover more</Link>
          </Button>
        </div>

        {booking.custodianId === CURRENT_CUSTODIAN_ID && (
          <aside className="mt-14 flex flex-col gap-5 border-l-2 border-gold pl-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[1.02rem] font-medium">See it from the custodian&apos;s side</p>
              <p className="mt-1 max-w-lg text-[0.92rem] text-ivory-dim">
                {custodian?.name}&apos;s earnings update the moment a booking is confirmed.
              </p>
            </div>
            <Button variant="gold" onClick={() => cross("custodian", "/custodian")}>
              Switch to custodian mode
            </Button>
          </aside>
        )}
      </motion.div>
    </div>
  );
}
