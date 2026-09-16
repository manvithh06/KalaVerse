"use client";

import Link from "next/link";
import { BadgeCheck, Bookmark, BookmarkCheck, Clock, Languages } from "lucide-react";
import type { Experience } from "@/types";
import { useKalaverse } from "@/store/kalaverse";
import { useCustodian } from "@/store/hooks";
import { CulturalPlate } from "@/components/cultural/plates";
import { AccessBadge } from "@/components/consent/access-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDuration, formatINR, formatLanguages } from "@/lib/utils";

export function ExperienceCard({
  experience,
  featured = false,
  className,
}: {
  experience: Experience;
  featured?: boolean;
  className?: string;
}) {
  const custodian = useCustodian(experience.custodianId);
  const saved = useKalaverse((s) => s.savedExperienceIds.includes(experience.id));
  const toggleSaved = useKalaverse((s) => s.toggleSaved);
  const level = experience.consent.accessLevel;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden bg-night-2 text-ivory transition-colors duration-500 hover:bg-night-3",
        featured && "md:flex-row",
        className,
      )}
    >
      <div className={cn("relative overflow-hidden", featured ? "aspect-[4/3] md:aspect-auto md:w-[56%]" : "aspect-[4/3]")}>
        <CulturalPlate
          motif={experience.motif}
          className="absolute inset-0 transition-transform duration-[1.4s] ease-[var(--ease-kalaverse)] group-hover:scale-[1.04]"
        />
        <div className="absolute left-4 top-4 z-[3]">
          <AccessBadge level={level} />
        </div>
      </div>

      <div className={cn("flex flex-1 flex-col p-5 sm:p-6", featured && "md:justify-between md:p-9")}>
        <div>
          <p className="text-[0.84rem] text-gold-light">{experience.practice}</p>
          <h3
            className={cn(
              "mt-2 font-titling uppercase leading-[1.08]",
              featured ? "text-[clamp(1.7rem,2.8vw,2.6rem)]" : "text-[1.22rem]",
            )}
          >
            <Link
              href={`/experiences/${experience.id}`}
              className="outline-none after:absolute after:inset-0 after:z-[2] focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-gold-light"
            >
              {featured
                ? splitTitle(experience.title).map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))
                : experience.title.replace(" — ", " — ")}
            </Link>
          </h3>
          <p className="mt-2 text-[0.92rem] text-ivory-dim">{experience.location}</p>
          {featured && <p className="mt-5 max-w-md text-[1rem] leading-relaxed text-ivory-dim">{experience.summary}</p>}
        </div>

        <div className="mt-6">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.86rem] text-ivory">
            <BadgeCheck className="size-4 text-open" aria-hidden />
            Verified Cultural Custodian
            {custodian && <span className="text-ash">{custodian.name}</span>}
          </p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
            <span className="t-num text-[1.65rem]">{formatINR(experience.price)}</span>
            <span className="flex flex-wrap gap-x-4 gap-y-1 text-[0.86rem] text-ivory-dim">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-3.5" aria-hidden />
                {formatDuration(experience.durationMinutes)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Languages className="size-3.5" aria-hidden />
                {formatLanguages(experience.languages)}
              </span>
            </span>
          </div>
          <p className="mt-4 border-t border-ivory/[0.08] pt-3 text-[0.84rem] text-ash">
            {level === "guided" ? "Community rules apply." : "The custodian's terms apply to every visit."}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => toggleSaved(experience.id)}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${experience.title} from saved` : `Save ${experience.title}`}
        className="absolute right-3 top-3 z-[3] grid size-10 place-items-center rounded-full bg-night/60 text-ivory backdrop-blur transition-colors hover:bg-night/85"
      >
        {saved ? <BookmarkCheck className="size-4 text-gold-light" aria-hidden /> : <Bookmark className="size-4" aria-hidden />}
      </button>
    </article>
  );
}

export function ExperienceCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <div className={cn("flex flex-col bg-night-2", featured && "md:col-span-2 md:flex-row")} aria-hidden>
      <Skeleton className={cn("aspect-[4/3] rounded-none", featured && "md:aspect-auto md:min-h-[380px] md:w-[56%]")} />
      <div className="flex-1 space-y-3 p-6">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-8 h-3 w-48" />
        <Skeleton className="h-7 w-20" />
      </div>
    </div>
  );
}

export function splitTitle(title: string) {
  const parts = title.split(/\s+—\s+|:\s+/);
  return parts.length > 1 ? parts : [title];
}
