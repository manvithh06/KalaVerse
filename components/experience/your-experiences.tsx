"use client";

import { useMemo } from "react";
import Link from "next/link";
import { Bookmark, Lock, Ticket, X } from "lucide-react";
import type { Booking, Experience } from "@/types";
import { useKalaverse } from "@/store/kalaverse";
import { useCustodian, useExperience, useHydrated } from "@/store/hooks";
import { isDiscoverable } from "@/lib/consent";
import { EmptyState, KireetaLoader } from "@/components/cultural/states";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExperienceCard } from "./experience-card";
import { sessionText } from "@/components/booking/booking-flow";
import { formatDate, formatINR } from "@/lib/utils";

function BookingTicket({ booking }: { booking: Booking }) {
  const experience = useExperience(booking.experienceId);
  const custodian = useCustodian(booking.custodianId);
  const listed = experience && isDiscoverable(experience);

  return (
    <li className="grid overflow-hidden border border-ivory/10 bg-night-2 sm:grid-cols-[minmax(0,1fr)_auto]">
      <div className="p-6">
        <p className="flex items-center gap-2 text-[0.84rem] text-open">
          <span aria-hidden className="size-2 rounded-full bg-open" />
          Confirmed
        </p>
        <h3 className="mt-3 font-titling text-[1.3rem] uppercase leading-tight">{booking.experienceTitle}</h3>
        <p className="mt-1 text-[0.92rem] text-ash">with {custodian?.name}</p>
        <dl className="mt-6 grid gap-4 text-[0.95rem] sm:grid-cols-2">
          <div>
            <dt className="text-[0.78rem] text-ash">Session</dt>
            <dd className="mt-0.5">{sessionText(booking.date, booking.time)}</dd>
          </div>
          <div>
            <dt className="text-[0.78rem] text-ash">Guests</dt>
            <dd className="mt-0.5">{booking.guests}</dd>
          </div>
        </dl>
        <p className="mt-6 text-[0.86rem] text-ivory-dim">
          Terms version {booking.termsVersion} accepted on {formatDate(booking.agreedAt)}
        </p>
        {listed ? (
          <Link
            href={`/experiences/${booking.experienceId}`}
            className="mt-3 inline-flex min-h-10 items-center text-[0.9rem] underline decoration-gold/60 underline-offset-[6px] hover:decoration-gold-light"
          >
            Review the custodian&apos;s terms
          </Link>
        ) : (
          <p className="mt-3 flex items-start gap-2 text-[0.86rem] text-protected">
            <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            The custodian has since protected this practice. They will contact you about this booking.
          </p>
        )}
      </div>
      <div className="flex items-center justify-between gap-6 border-t border-dashed border-ivory/20 p-6 sm:flex-col sm:items-end sm:justify-center sm:border-l sm:border-t-0">
        <div className="sm:text-right">
          <p className="text-[0.76rem] text-ash">Booking ID</p>
          <p className="font-semibold text-gold-light">{booking.id}</p>
        </div>
        <div className="text-right">
          <p className="text-[0.76rem] text-ash">Paid</p>
          <p className="text-[1.15rem] font-semibold">{formatINR(booking.gross)}</p>
          <p className="text-[0.76rem] text-ivory-dim">{formatINR(booking.custodianNet)} to the custodian</p>
        </div>
      </div>
    </li>
  );
}

function WithdrawnSaved({ experience }: { experience: Experience }) {
  const toggleSaved = useKalaverse((s) => s.toggleSaved);
  return (
    <div className="flex h-full min-h-[240px] flex-col justify-between border border-protected/30 bg-vault p-6">
      <div>
        <Lock className="size-6 text-protected" aria-hidden />
        <p className="mt-5 font-medium">No longer listed</p>
        <p className="mt-2 text-[0.92rem] leading-relaxed text-ivory-dim">
          A practice you saved is now protected by its custodian, so it is not shown here.
        </p>
      </div>
      <Button variant="ghost" size="sm" className="mt-6 self-start" onClick={() => toggleSaved(experience.id)}>
        <X aria-hidden />
        Remove from saved
      </Button>
    </div>
  );
}

export function YourExperiences() {
  const hydrated = useHydrated();
  const bookings = useKalaverse((s) => s.bookings);
  const savedIds = useKalaverse((s) => s.savedExperienceIds);
  const experiences = useKalaverse((s) => s.experiences);
  const saved = useMemo(
    () => savedIds.map((id) => experiences.find((e) => e.id === id)).filter((e): e is Experience => Boolean(e)),
    [savedIds, experiences],
  );

  return (
    <div className="bg-night text-ivory">
      <header className="page-gutter mx-auto max-w-[1440px] pb-10 pt-28 lg:pt-36">
        <h1 className="font-titling text-[clamp(2.6rem,6.2vw,5.8rem)] uppercase leading-[0.94]">
          Your
          <br />
          experiences
        </h1>
        <p className="mt-6 max-w-xl text-[1.02rem] leading-relaxed text-ivory-dim">
          Every booking keeps the terms you accepted and a record of your consent.
        </p>
      </header>

      <div className="page-gutter mx-auto max-w-[1440px] pb-28">
        {!hydrated ? (
          <KireetaLoader label="Loading your experiences" />
        ) : (
          <Tabs defaultValue={bookings.length || !saved.length ? "booked" : "saved"}>
            <TabsList aria-label="Your experiences">
              <TabsTrigger value="booked">Booked ({bookings.length})</TabsTrigger>
              <TabsTrigger value="saved">Saved ({saved.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="booked" className="pt-8">
              {bookings.length ? (
                <ul className="grid gap-4 xl:grid-cols-2">
                  {bookings.map((b) => (
                    <BookingTicket key={b.id} booking={b} />
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={<Ticket className="size-6" aria-hidden />}
                  title="No bookings yet"
                  body="When you book an experience, the custodian's terms and your consent record will be kept here."
                  action={
                    <Button asChild caps>
                      <Link href="/discover">Explore Karnataka</Link>
                    </Button>
                  }
                  className="border border-dashed border-ivory/10"
                />
              )}
            </TabsContent>
            <TabsContent value="saved" className="pt-8">
              {saved.length ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {saved.map((e) => (isDiscoverable(e) ? <ExperienceCard key={e.id} experience={e} /> : <WithdrawnSaved key={e.id} experience={e} />))}
                </div>
              ) : (
                <EmptyState
                  icon={<Bookmark className="size-6" aria-hidden />}
                  title="Nothing saved yet"
                  body="Save experiences while you read about them, and decide later."
                  action={
                    <Button asChild variant="outline">
                      <Link href="/discover">Discover experiences</Link>
                    </Button>
                  }
                  className="border border-dashed border-ivory/10"
                />
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
