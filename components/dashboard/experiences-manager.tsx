"use client";

import Link from "next/link";
import { Eye, Lock, Pencil, Plus, Ticket } from "lucide-react";
import type { Experience } from "@/types";
import { useKalaverse } from "@/store/kalaverse";
import { useMyExperiences } from "@/store/hooks";
import { useUI } from "@/store/ui";
import { isDiscoverable } from "@/lib/consent";
import { CulturalPlate } from "@/components/cultural/plates";
import { EmptyState } from "@/components/cultural/states";
import { AccessBadge } from "@/components/consent/access-badge";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { WorkspaceBody, WorkspaceHeader } from "./workspace";
import { cn, formatINR } from "@/lib/utils";

function Row({ experience }: { experience: Experience }) {
  const setStatus = useKalaverse((s) => s.setExperienceStatus);
  const toast = useUI((s) => s.toast);
  const level = experience.consent.accessLevel;
  const listed = isDiscoverable(experience);
  const draft = experience.status === "draft";

  return (
    <li className="grid grid-cols-1 gap-4 border-b border-ink/[0.08] py-5 last:border-b-0 md:grid-cols-[minmax(0,2.4fr)_repeat(3,minmax(0,0.8fr))_auto] md:items-center">
      <div className="flex min-w-0 items-center gap-4">
        <CulturalPlate motif={experience.motif} className="size-16 shrink-0" />
        <div className="min-w-0">
          <p className="truncate font-medium">{experience.title}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <AccessBadge level={level} size="sm" tone="light" />
            {draft && <span className="rounded-full border border-ink/20 px-2 py-0.5 text-[0.7rem] font-medium text-ink-soft">Draft</span>}
          </div>
        </div>
      </div>
      <div className="text-[0.92rem]">
        <span className="block text-[0.74rem] text-ink-faint md:hidden">Price</span>
        {level === "protected" ? <span className="text-ink-faint">Not for sale</span> : formatINR(experience.price)}
      </div>
      <div className="text-[0.92rem]">
        <span className="block text-[0.74rem] text-ink-faint md:hidden">Bookings</span>
        {level === "protected" ? <span className="text-ink-faint">None</span> : experience.bookingsCount}
      </div>
      <div className="text-[0.92rem]">
        <span className="block text-[0.74rem] text-ink-faint md:hidden">Terms</span>
        Version {experience.consent.termsVersion}
      </div>
      <div className="flex flex-wrap items-center gap-2 md:justify-end">
        {draft && (
          <Button
            size="sm"
            variant="ink"
            onClick={() => {
              setStatus(experience.id, "published");
              toast({ title: "Published with your terms", tone: level });
            }}
          >
            Publish
          </Button>
        )}
        <Button asChild size="sm" variant="outline-ink">
          <Link href={`/custodian/experiences/${experience.id}/edit`}>
            <Pencil aria-hidden />
            Edit
          </Link>
        </Button>
        {listed ? (
          <Button asChild size="sm" variant="ghost-ink">
            <Link href={`/experiences/${experience.id}`}>
              <Eye aria-hidden />
              Public page
            </Link>
          </Button>
        ) : (
          <Tooltip content={level === "protected" ? "Protected practices have no public page." : "Drafts have no public page until published."}>
            <span tabIndex={0} className="inline-flex h-9 cursor-not-allowed items-center gap-2 px-3 text-[0.8125rem] text-ink-faint">
              <Lock className="size-3.5" aria-hidden />
              No public page
            </span>
          </Tooltip>
        )}
      </div>
    </li>
  );
}

export function ExperiencesManager() {
  const mine = useMyExperiences();
  const published = mine.filter((e) => e.status === "published");
  const drafts = mine.filter((e) => e.status === "draft");
  const order = { open: 0, guided: 1, protected: 2 };
  const sorted = [...published].sort((a, b) => order[a.consent.accessLevel] - order[b.consent.accessLevel]);

  return (
    <div>
      <WorkspaceHeader
        title="Experiences"
        lead="Everything you share, and the terms that travel with it."
        actions={
          <Button asChild variant="ink" caps>
            <Link href="/custodian/experiences/new">
              <Plus aria-hidden />
              Create experience
            </Link>
          </Button>
        }
      />
      <WorkspaceBody className="space-y-10">
        <section aria-labelledby="published-list" className="border border-ink/10 bg-paper px-5 sm:px-6">
          <div className="hidden grid-cols-[minmax(0,2.4fr)_repeat(3,minmax(0,0.8fr))_auto] gap-4 border-b border-ink/10 py-3 text-[0.8rem] text-ink-faint md:grid">
            <span id="published-list">Published ({published.length})</span>
            <span>Price</span>
            <span>Bookings</span>
            <span>Terms</span>
            <span className="w-[260px]" />
          </div>
          <h2 className="border-b border-ink/10 py-3 text-[0.9rem] text-ink-faint md:hidden">Published ({published.length})</h2>
          {sorted.length ? (
            <ul>
              {sorted.map((e) => (
                <Row key={e.id} experience={e} />
              ))}
            </ul>
          ) : (
            <EmptyState tone="light" icon={<Ticket className="size-6" aria-hidden />} title="Nothing published yet" body="Create your first experience and publish it on your terms." />
          )}
        </section>

        <section aria-labelledby="drafts-list" className={cn("border border-dashed border-ink/20 px-5 sm:px-6")}>
          <h2 id="drafts-list" className="border-b border-ink/10 py-3 text-[0.9rem] text-ink-faint">
            Drafts ({drafts.length}), visible only to you
          </h2>
          {drafts.length ? (
            <ul>
              {drafts.map((e) => (
                <Row key={e.id} experience={e} />
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center text-[0.95rem] text-ink-soft">No drafts. Use Save draft when a listing isn&apos;t ready to publish.</p>
          )}
        </section>
      </WorkspaceBody>
    </div>
  );
}
