"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Lock } from "lucide-react";
import { traditions, type Tradition } from "@/data/traditions";
import { MOTIF_PHOTOS, TRADITION_PHOTOS } from "@/data/photos";
import { CulturalPlate } from "@/components/cultural/plates";
import { AccessBadge } from "@/components/consent/access-badge";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/lib/use-media-query";
import { cn } from "@/lib/utils";

type Mode = "pinned" | "swipe";

function discoverHref(t: Tradition) {
  if (t.practice) return `/discover?practice=${encodeURIComponent(t.practice)}`;
  if (t.category) return `/discover?culture=${t.category}`;
  return "/discover";
}

function Caption({ t, tone = "dark", link = true }: { t: Tradition; tone?: "dark" | "light"; link?: boolean }) {
  const dark = tone === "dark";
  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h3 className="t-title">{t.name}</h3>
        <AccessBadge level={t.access} size="sm" tone={tone} />
      </div>
      <p className={cn("mt-1.5 text-[0.95rem]", dark ? "text-gold-light" : "text-laterite")}>{t.subtitle}</p>
      <p className={cn("mt-3 max-w-md text-[0.95rem] leading-relaxed", dark ? "text-ivory-dim" : "text-ink-soft")}>{t.body}</p>
      {link && t.access !== "protected" && (
        <Link
          href={discoverHref(t)}
          className={cn("mt-4 inline-flex min-h-10 items-center text-[0.9rem] underline decoration-1 underline-offset-[6px] transition-colors", dark ? "text-ivory decoration-gold/60 hover:decoration-gold-light" : "text-ink decoration-laterite/50 hover:decoration-laterite")}
        >
          See experiences shared by custodians
        </Link>
      )}
    </div>
  );
}

function Panel({ t, mode }: { t: Tradition; mode: Mode }) {
  const pinned = mode === "pinned";
  const size = (pinnedClass: string, swipeClass = "w-[84vw] max-w-[440px]") =>
    cn("relative flex shrink-0 snap-start", pinned ? cn("h-full", pinnedClass) : cn("h-[600px]", swipeClass));

  switch (t.id) {
    case "yakshagana":
      return (
        <article className={size("w-[50vh] flex-col", "w-[84vw] max-w-[440px] flex-col")}>
          <CulturalPlate
            motif="yakshagana"
            sizes="(min-width: 1024px) and (min-height: 640px) 50vh, (min-width: 524px) 440px, 84vw"
            className="min-h-0 flex-1"
          >
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-night/90 via-night/40 to-transparent" />
            <p lang="kn" className="t-kannada absolute bottom-4 left-5 text-[clamp(2.4rem,5vh,3.4rem)] text-ivory/90">
              {t.kannada}
            </p>
          </CulturalPlate>
          {MOTIF_PHOTOS.yakshagana?.credit && (
            <p className="mt-2 text-[0.75rem] text-ash">Photo: {MOTIF_PHOTOS.yakshagana.credit}</p>
          )}
          <div className="pt-4">
            <Caption t={t} />
          </div>
        </article>
      );
    case "daivaradhane":
      return (
        <article className={size("w-[42vh] flex-col", "w-[84vw] max-w-[400px] flex-col")}>
          <CulturalPlate motif="daivaradhane" className="min-h-0 flex-1 border border-protected/25">
            <div className="flex size-full flex-col justify-end bg-gradient-to-t from-night via-night/40 to-transparent p-6">
              <span className="grid size-11 place-items-center rounded-full border border-protected/50 text-protected">
                <Lock className="size-5" aria-hidden />
              </span>
              <p lang="kn" className="t-kannada mt-4 text-[1.9rem] text-ivory/85">
                {t.kannada}
              </p>
              <Caption t={t} link={false} />
            </div>
          </CulturalPlate>
        </article>
      );
    case "kambala":
      return (
        <article className={size("w-[110vh] gap-6", "w-[90vw] max-w-[640px] flex-col")}>
          <CulturalPlate motif="kambala" className={cn(pinned ? "h-full w-[64%]" : "h-[340px] w-full")} />
          <div className={cn("flex flex-col", pinned ? "w-[36%] justify-end pb-2" : "")}>
            <p lang="kn" className="t-kannada text-[2.6rem] text-gold-light/80">
              {t.kannada}
            </p>
            <div className="mt-3">
              <Caption t={t} />
            </div>
          </div>
        </article>
      );
    case "krishi":
      return (
        <article className={size("w-[68vh]")}>
          <CulturalPlate motif="krishi" className="size-full">
            <div className="flex size-full flex-col justify-end bg-gradient-to-t from-night/95 via-night/50 to-transparent p-6 sm:p-8">
              <p lang="kn" className="t-kannada text-[2.6rem] text-ivory/90">
                {t.kannada}
              </p>
              <div className="mt-2">
                <Caption t={t} />
              </div>
            </div>
          </CulturalPlate>
        </article>
      );
    case "tulunadu":
      return (
        <article className={size("w-[60vh] flex-col bg-parchment text-ink", "w-[84vw] max-w-[440px] flex-col bg-parchment text-ink")}>
          <CulturalPlate motif="tulunadu" className="h-[38%] min-h-[160px]" />
          <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
            <p lang="kn" className="t-kannada text-[clamp(2.8rem,6.4vh,4.2rem)] leading-none text-laterite">
              {t.kannada}
            </p>
            <Caption t={t} tone="light" />
          </div>
          <div className="text-laterite">
            <div className="tile-rule" />
          </div>
        </article>
      );
    case "cuisine":
      return (
        <article className={size("w-[72vh] flex-col items-center bg-night-2 px-8 pt-8", "w-[84vw] max-w-[440px] flex-col items-center bg-night-2 px-6 pt-6")}>
          <CulturalPlate motif="cuisine" photo={TRADITION_PHOTOS[t.id]} className="aspect-square h-[48%] min-h-[180px] rounded-full border border-gold/25" />
          <div className="mt-6 flex w-full flex-1 flex-col">
            <ul className="flex flex-wrap gap-x-4 gap-y-1 font-serif text-[1.05rem] italic text-ivory">
              {["Neer dosa", "Kori rotti", "Ghee roast", "Pathrode"].map((dish) => (
                <li key={dish}>{dish}</li>
              ))}
            </ul>
            <div className="mt-4">
              <Caption t={t} />
            </div>
          </div>
        </article>
      );
    case "handicrafts":
      return (
        <article className={size("w-[84vh] flex-col", "w-[90vw] max-w-[560px] flex-col")}>
          <div className="grid min-h-0 flex-1 grid-cols-[1.3fr_1fr] grid-rows-2 gap-3">
            <CulturalPlate motif="kasuti" className="row-span-2" />
            <CulturalPlate motif="pottery" />
            <CulturalPlate motif="weaving" />
          </div>
          <div className="pt-5">
            <Caption t={t} />
          </div>
        </article>
      );
    case "storytelling":
      return (
        <article className={size("w-[58vh] flex-col", "w-[84vw] max-w-[440px] flex-col")}>
          <CulturalPlate motif="storytelling" className="h-[46%] min-h-[200px]" />
          <blockquote className="mt-5 font-serif text-[clamp(1.3rem,2.6vh,1.6rem)] italic leading-snug text-ivory">
            &ldquo;I tell them in Tulu, the way they were told to me.&rdquo;
            <footer className="mt-2 font-sans text-[0.8rem] not-italic text-ash">Leelavathi Salian, storyteller</footer>
          </blockquote>
          <div className="mt-4">
            <Caption t={t} />
          </div>
        </article>
      );
    default:
      return null;
  }
}

function Header({ className }: { className?: string }) {
  return (
    <div className={cn("mx-auto flex w-full max-w-[1440px] flex-col gap-6 lg:flex-row lg:items-end lg:justify-between", className)}>
      <h2 id="living-traditions" className="font-titling text-[clamp(2.2rem,4.4vw,4.2rem)] uppercase leading-[0.95]">
        A land of
        <br />
        living traditions
      </h2>
      <p className="max-w-md text-[1rem] leading-relaxed text-ivory-dim">
        Eight traditions of Tulunadu and coastal Karnataka. Each is shared differently, because each belongs to someone.
      </p>
    </div>
  );
}

function EndPanel({ mode }: { mode: Mode }) {
  return (
    <article
      className={cn(
        "flex shrink-0 snap-start flex-col justify-end border-l border-ivory/10 pl-8",
        mode === "pinned" ? "h-full w-[46vh]" : "h-[600px] w-[80vw] max-w-[380px]",
      )}
    >
      <p className="font-titling text-[1.9rem] uppercase leading-tight">Every tradition here is shared by someone who carries it.</p>
      <p className="mt-4 text-ivory-dim">Only what custodians choose to share is listed.</p>
      <Button asChild caps size="lg" className="mt-8 self-start">
        <Link href="/discover">Discover Karnataka</Link>
      </Button>
    </article>
  );
}

function PinnedGallery() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => setDistance(Math.max(0, track.scrollWidth - window.innerWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, (p) => -p * distance);

  return (
    <div ref={sectionRef} className="relative" style={{ height: `calc(100vh + ${distance}px)` }}>
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden pb-8 pt-24">
        <Header className="page-gutter" />
        <div className="relative mt-8 min-h-0 flex-1">
          <motion.div ref={trackRef} style={{ x }} className="flex h-full w-max gap-8 px-[clamp(1rem,4vw,3.5rem)]">
            {traditions.map((t) => (
              <Panel key={t.id} t={t} mode="pinned" />
            ))}
            <EndPanel mode="pinned" />
          </motion.div>
        </div>
        <div className="page-gutter mx-auto mt-6 w-full max-w-[1440px]">
          <div className="h-px bg-ivory/10">
            <motion.div className="h-px origin-left bg-gold-light" style={{ scaleX: scrollYProgress }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SwipeGallery() {
  return (
    <div className="py-24">
      <Header className="page-gutter" />
      <div className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-4 px-[clamp(1rem,4vw,3.5rem)] pb-4 scrollbar-none">
        {traditions.map((t) => (
          <Panel key={t.id} t={t} mode="swipe" />
        ))}
        <EndPanel mode="swipe" />
      </div>
      <p className="page-gutter mt-3 text-[0.85rem] text-ash">Swipe to walk through all eight traditions.</p>
    </div>
  );
}

export function LivingTraditions() {
  const desktop = useMediaQuery("(min-width: 1024px) and (min-height: 640px)");
  const reduce = useReducedMotion();
  return (
    <section aria-labelledby="living-traditions" className="relative bg-night text-ivory">
      {desktop && !reduce ? <PinnedGallery /> : <SwipeGallery />}
    </section>
  );
}
