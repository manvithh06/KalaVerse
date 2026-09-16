"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Lock, Search, SlidersHorizontal, X } from "lucide-react";
import type { AccessLevel, CultureCategory } from "@/types";
import { useKalaverse } from "@/store/kalaverse";
import { useDiscoverableExperiences, useHydrated } from "@/store/hooks";
import { custodians } from "@/data/custodians";
import { HERO_EXPERIENCE_ID } from "@/data/experiences";
import { CATEGORY_LABEL, FORMAT_LABEL } from "@/data/traditions";
import { ExperienceCard, ExperienceCardSkeleton } from "@/components/experience/experience-card";
import { WithheldNotice } from "./withheld-notice";
import { EmptyState } from "@/components/cultural/states";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/field";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip } from "@/components/ui/tooltip";
import { AccessGlyph } from "@/components/consent/access-badge";
import { cn } from "@/lib/utils";

type FilterKey = "district" | "culture" | "format" | "craft" | "language" | "access" | "practice";

const FILTER_LABEL: Record<FilterKey, string> = {
  district: "Location",
  culture: "Culture",
  format: "Experience",
  craft: "Craft",
  language: "Language",
  access: "Access level",
  practice: "Tradition",
};

function uniq(values: (string | undefined)[]) {
  return [...new Set(values.filter(Boolean) as string[])].sort();
}

export function DiscoverView() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const hydrated = useHydrated();
  const discoverable = useDiscoverableExperiences();
  const experiences = useKalaverse((s) => s.experiences);
  const withheld = useKalaverse((s) => s.withheldNotice);
  const markWithheldSeen = useKalaverse((s) => s.markWithheldSeen);

  const [query, setQuery] = useState(params.get("q") ?? "");
  const filters = useMemo(() => {
    const f: Partial<Record<FilterKey, string>> = {};
    (Object.keys(FILTER_LABEL) as FilterKey[]).forEach((k) => {
      const v = params.get(k);
      if (v) f[k] = v;
    });
    return f;
  }, [params]);

  const replaceParams = useCallback(
    (mutate: (p: URLSearchParams) => void) => {
      const next = new URLSearchParams(params.toString());
      mutate(next);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  useEffect(() => {
    const current = params.get("q") ?? "";
    if (query.trim() === current) return;
    const timer = window.setTimeout(() => replaceParams((p) => (query.trim() ? p.set("q", query.trim()) : p.delete("q"))), 250);
    return () => window.clearTimeout(timer);
  }, [query, params, replaceParams]);

  const setFilter = (key: FilterKey, value: string) => replaceParams((p) => (value ? p.set(key, value) : p.delete(key)));
  const clearAll = () => {
    setQuery("");
    router.replace(pathname, { scroll: false });
  };

  // Options come from saved demo data, so they wait for hydration like everything else that reads it.
  const options = useMemo(() => {
    const source = hydrated ? discoverable : [];
    return {
      district: uniq(source.map((e) => e.district)),
      culture: uniq(source.map((e) => e.category)),
      format: uniq(source.map((e) => e.format)),
      craft: uniq(source.map((e) => e.craft)),
      language: uniq(source.flatMap((e) => e.languages)),
    };
  }, [discoverable, hydrated]);

  const results = useMemo(() => {
    const terms = (params.get("q") ?? "").toLowerCase().split(/\s+/).filter(Boolean);
    return discoverable
      .filter((e) => {
        if (terms.length) {
          const host = custodians.find((c) => c.id === e.custodianId)?.name ?? "";
          const haystack = [e.title, e.practice, e.location, e.district, e.summary, host, CATEGORY_LABEL[e.category], FORMAT_LABEL[e.format], e.craft ?? "", ...e.languages]
            .join(" ")
            .toLowerCase();
          if (!terms.every((t) => haystack.includes(t))) return false;
        }
        if (filters.district && e.district !== filters.district) return false;
        if (filters.culture && e.category !== filters.culture) return false;
        if (filters.format && e.format !== filters.format) return false;
        if (filters.craft && e.craft !== filters.craft) return false;
        if (filters.language && !e.languages.includes(filters.language)) return false;
        if (filters.access && e.consent.accessLevel !== filters.access) return false;
        if (filters.practice && e.practice !== filters.practice) return false;
        return true;
      })
      .sort((a, b) => Number(b.id === HERO_EXPERIENCE_ID) - Number(a.id === HERO_EXPERIENCE_ID) || b.bookingsCount - a.bookingsCount);
  }, [discoverable, filters, params]);

  const protectedCount = useMemo(
    () => experiences.filter((e) => e.status === "published" && e.consent.accessLevel === "protected").length,
    [experiences],
  );
  const activeFilters = Object.entries(filters) as [FilterKey, string][];
  const unfiltered = !activeFilters.length && !(params.get("q") ?? "");
  const showWithheld = hydrated && withheld && !withheld.seen;

  const filterControls = (layout: "row" | "stack") => (
    <div className={cn(layout === "row" ? "grid grid-cols-5 gap-3" : "grid gap-5")}>
      {(
        [
          ["district", options.district, (v: string) => v],
          ["culture", options.culture, (v: string) => CATEGORY_LABEL[v as CultureCategory] ?? v],
          ["format", options.format, (v: string) => FORMAT_LABEL[v] ?? v],
          ["craft", options.craft, (v: string) => v],
          ["language", options.language, (v: string) => v],
        ] as [FilterKey, string[], (v: string) => string][]
      ).map(([key, values, label]) => (
        <div key={key} className="grid gap-1.5">
          <label htmlFor={`filter-${key}-${layout}`} className="text-[0.78rem] text-ash">
            {FILTER_LABEL[key]}
          </label>
          <Select id={`filter-${key}-${layout}`} tone="dark" value={filters[key] ?? ""} onChange={(e) => setFilter(key, e.target.value)} className="h-11">
            <option value="">All</option>
            {values.map((v) => (
              <option key={v} value={v}>
                {label(v)}
              </option>
            ))}
          </Select>
        </div>
      ))}
    </div>
  );

  const accessControl = (
    <div role="group" aria-label="Access level" className="flex flex-wrap items-center gap-2">
      {(["", "open", "guided"] as ("" | AccessLevel)[]).map((level) => {
        const active = (filters.access ?? "") === level;
        return (
          <button
            key={level || "all"}
            type="button"
            aria-pressed={active}
            onClick={() => setFilter("access", level)}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-[0.85rem] transition-colors",
              active ? "border-ivory bg-ivory text-night" : "border-ivory/15 text-ivory-dim hover:border-ivory/40 hover:text-ivory",
            )}
          >
            {level && <AccessGlyph level={level} className={cn(active && "text-night")} />}
            {level === "" ? "All access levels" : level === "open" ? "Open" : "Guided"}
          </button>
        );
      })}
      <Tooltip content="Protected practices are never listed. Only their custodians can see them.">
        <span
          tabIndex={0}
          aria-disabled
          className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-full border border-dashed border-protected/40 px-4 text-[0.85rem] text-protected/80"
        >
          <Lock className="size-3.5" aria-hidden />
          Protected
          <span className="sr-only">, not available: protected practices are never listed</span>
        </span>
      </Tooltip>
    </div>
  );

  return (
    <div className="bg-night text-ivory">
      <header className="page-gutter mx-auto max-w-[1440px] pb-10 pt-28 lg:pt-36">
        <h1 className="font-titling text-[clamp(2.6rem,6.4vw,6rem)] uppercase leading-[0.94]">
          Discover Karnataka.
          <span className="block text-ivory/40">Respectfully.</span>
        </h1>
        <div className="mt-10 grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="relative lg:col-span-7">
            <label htmlFor="discover-search" className="sr-only">
              Search experiences
            </label>
            <Search className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-ash" aria-hidden />
            <input
              id="discover-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search traditions, crafts, performances..."
              className="h-16 w-full rounded-[4px] border border-ivory/15 bg-night-2 pl-14 pr-5 text-[1.05rem] text-ivory placeholder:text-ash transition-colors hover:border-ivory/30 focus:border-ivory/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
            />
          </div>
          <p className="max-w-md text-[0.95rem] leading-relaxed text-ivory-dim lg:col-span-5">
            Everything listed here was published by the people who carry it, on their own terms.
          </p>
        </div>
      </header>

      <div className="sticky top-14 z-30 border-y border-ivory/[0.08] bg-night/90 backdrop-blur-md lg:static lg:bg-night lg:backdrop-blur-none">
        <div className="page-gutter mx-auto max-w-[1440px] py-4">
          <div className="hidden lg:block">
            {filterControls("row")}
            <div className="mt-4">{accessControl}</div>
          </div>
          <div className="flex items-center gap-3 lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="md">
                  <SlidersHorizontal aria-hidden />
                  Filters{activeFilters.length ? ` (${activeFilters.length})` : ""}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-7">
                <SheetTitle className="t-subtitle">Filter experiences</SheetTitle>
                <SheetDescription className="mt-1 text-[0.9rem] text-ash">Only what custodians chose to share is listed.</SheetDescription>
                <div className="mt-6">{filterControls("stack")}</div>
                <div className="mt-6">{accessControl}</div>
              </SheetContent>
            </Sheet>
            <p className="text-[0.88rem] text-ash" aria-live="polite">
              {hydrated ? `${results.length} ${results.length === 1 ? "experience" : "experiences"}` : "Loading"}
            </p>
          </div>
        </div>
      </div>

      <div className="page-gutter mx-auto max-w-[1440px] pb-28 pt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="hidden text-[0.95rem] text-ivory-dim lg:block" aria-live="polite">
            {hydrated ? `${results.length} ${results.length === 1 ? "experience" : "experiences"} shared by custodians` : "Loading experiences"}
          </p>
          {hydrated && protectedCount > 0 && (
            <p className="flex items-center gap-2 text-[0.88rem] text-ash">
              <Lock className="size-3.5 text-protected" aria-hidden />
              {protectedCount} {protectedCount === 1 ? "practice is" : "practices are"} kept within their communities and not listed.
            </p>
          )}
        </div>

        {activeFilters.length > 0 && (
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {activeFilters.map(([key, value]) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key, "")}
                className="inline-flex h-9 items-center gap-2 rounded-full bg-ivory/[0.08] pl-3.5 pr-2.5 text-[0.84rem] text-ivory hover:bg-ivory/[0.14]"
              >
                <span className="text-ash">{FILTER_LABEL[key]}:</span>
                {key === "culture" ? CATEGORY_LABEL[value as CultureCategory] : key === "format" ? FORMAT_LABEL[value] : value}
                <X className="size-3.5" aria-label={`Remove ${FILTER_LABEL[key]} filter`} />
              </button>
            ))}
            <button type="button" onClick={clearAll} className="h-9 px-2 text-[0.84rem] text-ash underline underline-offset-4 hover:text-ivory">
              Clear all
            </button>
          </div>
        )}

        <div className="mt-8">
          {!hydrated ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading experiences">
              <ExperienceCardSkeleton featured />
              {Array.from({ length: 4 }, (_, i) => (
                <ExperienceCardSkeleton key={i} />
              ))}
            </div>
          ) : results.length === 0 && !showWithheld ? (
            <EmptyState
              icon={<Search className="size-6" aria-hidden />}
              title="No experiences match"
              body="Try a different word or remove a filter. Some practices are never listed, because their custodians keep them within the community."
              action={
                <Button variant="outline" onClick={clearAll}>
                  Clear search and filters
                </Button>
              }
              className="border border-dashed border-ivory/10"
            />
          ) : (
            <motion.div layout className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout" initial={false}>
                {showWithheld && (
                  <motion.div
                    key="withheld"
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.94, filter: "blur(10px)", transition: { duration: 0.9 } }}
                  >
                    <WithheldNotice onDone={markWithheldSeen} />
                  </motion.div>
                )}
                {results.map((experience, i) => {
                  const featured = unfiltered && i === 0 && experience.id === HERO_EXPERIENCE_ID;
                  return (
                    <motion.div
                      key={experience.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.4 }}
                      className={cn(featured && "md:col-span-2")}
                    >
                      <ExperienceCard experience={experience} featured={featured} />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
