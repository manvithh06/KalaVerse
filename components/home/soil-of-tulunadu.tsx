"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { CulturalPlate } from "@/components/cultural/plates";
import { useMediaQuery } from "@/lib/use-media-query";
import { cn, hashString, seeded } from "@/lib/utils";
import type { Motif } from "@/types";

const r2 = (n: number) => Math.round(n * 100) / 100;
const STOPS = ["Paddy fields", "Village path", "Traditional house", "Performance space", "Coast"];

function Palm({ x, base, h, lean, color, w = 3 }: { x: number; base: number; h: number; lean: number; color: string; w?: number }) {
  const tx = r2(x + lean);
  const ty = r2(base - h);
  const r = h * 0.24;
  return (
    <g stroke={color} fill="none" strokeLinecap="round">
      <path d={`M${r2(x)} ${base} Q${r2(x + lean * 0.3)} ${r2(base - h * 0.5)} ${tx} ${ty}`} strokeWidth={w} />
      {[-1, -0.6, -0.25, 0.25, 0.6, 1].map((k) => (
        <path
          key={k}
          strokeWidth={r2(w * 0.75)}
          d={`M${tx} ${ty} Q${r2(tx + k * r * 0.5)} ${r2(ty - r * (0.6 - Math.abs(k) * 0.4))} ${r2(tx + k * r)} ${r2(ty + r * (Math.abs(k) * 0.6 - 0.05))}`}
        />
      ))}
    </g>
  );
}

function Landscape({ farX, nearX }: { farX?: MotionValue<number>; nearX?: MotionValue<number> }) {
  const rand = seeded(hashString("soil"));
  const farPalms = Array.from({ length: 46 }, (_, i) => ({ x: r2(i * 66 + rand() * 30), h: r2(60 + rand() * 70), lean: r2(rand() * 10 - 5) }));
  const tufts = Array.from({ length: 80 }, (_, i) => ({ x: r2(i * 38 + rand() * 20), h: r2(10 + rand() * 16) }));

  return (
    <svg viewBox="0 0 3000 600" className="block h-full w-auto" preserveAspectRatio="xMinYMid meet" role="img" aria-label="An illustrated walk from paddy fields, along a village path, past a traditional house and an open-air stage, to the coast">
      <defs>
        <linearGradient id="soil-sky" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#cdd2b9" />
          <stop offset="0.2" stopColor="#dccfa9" />
          <stop offset="0.42" stopColor="#d9a676" />
          <stop offset="0.6" stopColor="#6b3b31" />
          <stop offset="0.74" stopColor="#24161b" />
          <stop offset="0.86" stopColor="#b8684f" />
          <stop offset="1" stopColor="#35263a" />
        </linearGradient>
        <linearGradient id="soil-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b0807" stopOpacity="0.5" />
          <stop offset="0.5" stopColor="#0b0807" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="soil-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4d4a66" />
          <stop offset="1" stopColor="#23273a" />
        </linearGradient>
        <pattern id="soil-tiles" width="16" height="10" patternUnits="userSpaceOnUse">
          <path d="M0 10 A8 8 0 0 1 16 10" fill="none" stroke="#4a1f13" strokeWidth="1.4" />
        </pattern>
        <pattern id="soil-laterite" width="40" height="20" patternUnits="userSpaceOnUse">
          <rect width="40" height="20" fill="#8c4630" />
          <path d="M0 19.5 H40 M20 0 V10 M0 10 H40 M10 10 V20 M30 10 V20" stroke="#5e2c1d" strokeWidth="1" />
        </pattern>
        <radialGradient id="soil-lamp">
          <stop offset="0" stopColor="#ffbf66" stopOpacity="0.6" />
          <stop offset="1" stopColor="#ffbf66" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="3000" height="600" fill="url(#soil-sky)" />
      <rect width="3000" height="600" fill="url(#soil-top)" />
      <circle cx="2830" cy="370" r="46" fill="#f6c98a" opacity="0.9" />
      <circle cx="420" cy="150" r="38" fill="#f5efd6" opacity="0.6" />

      <motion.g style={{ x: farX }}>
        <path
          d="M-200 400 C100 350 300 372 600 342 C900 312 1100 360 1400 350 C1700 340 1900 310 2200 330 C2500 350 2700 344 3200 372 V600 H-200 Z"
          fill="#1f2a22"
          opacity="0.55"
        />
        {farPalms.map((p, i) => (
          <Palm key={i} x={p.x} base={395} h={p.h} lean={p.lean} color="#1a211b" w={2} />
        ))}
      </motion.g>

      {/* Paddy fields */}
      <g>
        {[
          [410, "#6f9660"],
          [448, "#5c8854"],
          [496, "#497648"],
          [552, "#3a6440"],
        ].map(([y, fill], i) => (
          <path key={i} d={`M0 ${y} C150 ${Number(y) - 12} 420 ${Number(y) + 10} 640 ${Number(y) - 4} V600 H0 Z`} fill={String(fill)} />
        ))}
        <path
          d={Array.from({ length: 110 }, (_, i) => `M${r2(i * 6 + 2)} ${r2(418 + (i % 7) * 1.4)}l${r2((i % 3) - 1)} -8`).join("")}
          stroke="#a9c48a"
          strokeWidth="1"
          opacity="0.6"
        />
        {[70, 150, 540].map((x, i) => (
          <Palm key={x} x={x} base={414} h={150 + i * 20} lean={i * 6 - 6} color="#2c3b2a" w={4} />
        ))}
        <line x1="210" y1="470" x2="330" y2="470" stroke="#eef0da" strokeWidth="1.5" opacity="0.4" />
      </g>

      {/* Village path */}
      <g transform="translate(600 0)">
        <path d="M0 412 C200 400 400 420 600 408 V600 H0 Z" fill="#4c5a35" />
        <path d="M250 600 C270 540 340 500 330 460 C322 430 350 416 372 412 L392 412 C372 420 356 436 364 462 C378 510 330 548 350 600 Z" fill="#b59568" />
        <rect x="430" y="398" width="170" height="26" fill="url(#soil-laterite)" />
        {[40, 110, 470, 540].map((x, i) => (
          <Palm key={x} x={x} base={420} h={170 + (i % 2) * 40} lean={i % 2 ? 12 : -10} color="#223022" w={4} />
        ))}
        <Palm x={190} base={440} h={220} lean={30} color="#1d271d" w={6} />
      </g>

      {/* Traditional house */}
      <g transform="translate(1200 0)">
        <path d="M0 408 C200 416 400 400 600 412 V600 H0 Z" fill="#5b4a31" />
        {[30, 560].map((x) => (
          <Palm key={x} x={x} base={420} h={210} lean={x > 300 ? -14 : 12} color="#2b2418" w={4} />
        ))}
        <path d="M70 330 L160 240 H440 L530 330 Z" fill="#7d3a25" />
        <path d="M70 330 L160 240 H440 L530 330 Z" fill="url(#soil-tiles)" />
        <path d="M160 240 H440" stroke="#3a180e" strokeWidth="5" />
        <rect x="100" y="330" width="400" height="120" fill="url(#soil-laterite)" />
        <rect x="100" y="330" width="400" height="120" fill="#000" opacity="0.15" />
        {[120, 180, 240, 360, 420, 480].map((x) => (
          <rect key={x} x={x - 5} y="334" width="10" height="116" fill="#3b2416" />
        ))}
        <rect x="276" y="360" width="48" height="90" fill="#1e120c" />
        <circle cx="300" cy="395" r="30" fill="url(#soil-lamp)" />
        <rect x="80" y="448" width="440" height="16" fill="#4f2a1d" />
      </g>

      {/* Performance space */}
      <g transform="translate(1800 0)">
        <path d="M0 412 C200 404 400 418 600 410 V600 H0 Z" fill="#221815" />
        <circle cx="300" cy="360" r="120" fill="none" stroke="#d8b774" strokeOpacity="0.14" strokeWidth="2" />
        <circle cx="300" cy="360" r="96" fill="none" stroke="#d8b774" strokeOpacity="0.1" strokeWidth="1.5" strokeDasharray="3 8" />
        <rect x="130" y="440" width="340" height="26" fill="#140e0b" />
        {[150, 450].map((x) => (
          <rect key={x} x={x - 7} y="270" width="14" height="172" fill="#2d1c12" />
        ))}
        <path d="M150 276 Q300 330 450 276" fill="none" stroke="#1b3324" strokeWidth="3" />
        {Array.from({ length: 11 }, (_, i) => {
          const t = (i + 0.5) / 11;
          const x = r2(150 + t * 300);
          const y = r2(276 + 108 * t * (1 - t));
          return <path key={i} d={`M${x} ${y} c-5 10 -3 22 0 30 c3 -8 5 -20 0 -30Z`} fill="#26422e" />;
        })}
        {[200, 400].map((x) => (
          <g key={x}>
            <circle cx={x} cy="424" r="60" fill="url(#soil-lamp)" />
            <path d={`M${x} 404c5 7 7 11 7 15a7 7 0 0 1-14 0c0-4 2-8 7-15Z`} fill="#ffd271" className="[transform-box:fill-box] [transform-origin:50%_85%] motion-safe:animate-flame" />
            <rect x={x - 3} y="425" width="6" height="17" fill="#b48d49" />
          </g>
        ))}
        {Array.from({ length: 16 }, (_, i) => (
          <circle key={i} cx={r2(40 + i * 36 + (i % 2) * 10)} cy={r2(540 + (i % 3) * 14)} r="15" fill="#0c0908" />
        ))}
      </g>

      {/* Coast */}
      <g transform="translate(2400 0)">
        <rect x="0" y="404" width="600" height="80" fill="url(#soil-sea)" />
        {Array.from({ length: 9 }, (_, i) => (
          <line key={i} x1={r2(400 - (20 + i * 8))} y1={414 + i * 8} x2={r2(460 + (20 + i * 8))} y2={414 + i * 8} stroke="#f0b980" strokeWidth="1.6" opacity={r2(0.6 - i * 0.05)} />
        ))}
        <path d="M0 470 C200 462 400 478 600 466 V600 H0 Z" fill="#c9a57a" />
        <path d="M0 482 C200 474 400 490 600 478" fill="none" stroke="#f2e2c7" strokeWidth="2" opacity="0.5" />
        <path d="M150 440 Q170 456 220 456 H290 Q322 456 332 436 L312 442 Q290 448 220 448 Q182 448 150 440 Z" fill="#0b0d14" />
        <path d="M240 448 V396" stroke="#0b0d14" strokeWidth="3" />
        <path d="M400 420 Q412 430 440 430 H470 Q488 430 494 418 L482 422 Q470 425 440 425 Q420 425 400 420 Z" fill="#12141c" />
        <Palm x={40} base={560} h={250} lean={46} color="#171311" w={7} />
        <Palm x={100} base={530} h={200} lean={24} color="#1d1714" w={5} />
      </g>

      <motion.g style={{ x: nearX }}>
        <path
          d={tufts.map((t) => `M${t.x} 600 l-4 -${t.h} M${t.x} 600 l1 -${r2(t.h * 1.2)} M${t.x} 600 l5 -${r2(t.h * 0.9)}`).join("")}
          stroke="#0b0807"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </motion.g>
    </svg>
  );
}

function StopRail({ active }: { active: number }) {
  return (
    <ol className="grid w-full grid-cols-5">
      {STOPS.map((stop, i) => (
        <li key={stop} className="flex flex-col items-center gap-3 pt-5 text-center">
          <span
            className={cn(
              "size-2.5 rotate-45 border transition-colors duration-500",
              i <= active ? "border-gold-light bg-gold-light" : "border-ivory/30 bg-transparent",
            )}
          />
          <span className={cn("text-[0.95rem] transition-colors duration-500", i === active ? "text-ivory" : "text-ash")}>{stop}</span>
        </li>
      ))}
    </ol>
  );
}

function PinnedPanorama() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [active, setActive] = useState(0);

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
  const farX = useTransform(scrollYProgress, (p) => p * distance * 0.35);
  const nearX = useTransform(scrollYProgress, (p) => -p * distance * 0.12);
  useMotionValueEvent(scrollYProgress, "change", (p) => setActive(Math.min(4, Math.floor(p * 5))));

  return (
    <div ref={sectionRef} className="relative" style={{ height: `calc(100vh + ${distance}px)` }}>
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <motion.div ref={trackRef} style={{ x }} className="flex h-[74vh] w-max flex-col">
          <div className="min-h-0 flex-1">
            <Landscape farX={farX} nearX={nearX} />
          </div>
          <StopRail active={active} />
        </motion.div>
      </div>
    </div>
  );
}

function SwipePanorama() {
  const [active, setActive] = useState(0);
  return (
    <div>
      <div
        className="overflow-x-auto scrollbar-none"
        onScroll={(e) => {
          const el = e.currentTarget;
          const p = el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth);
          setActive(Math.min(4, Math.floor(p * 5)));
        }}
      >
        <div className="flex h-[62vh] min-h-[380px] w-max flex-col">
          <div className="min-h-0 flex-1">
            <Landscape />
          </div>
          <StopRail active={active} />
        </div>
      </div>
      <p className="page-gutter mt-4 text-[0.85rem] text-ash">Swipe to walk from the fields to the coast.</p>
    </div>
  );
}

const PILLARS: { name: string; kannada: string; line: string; motif: Motif }[] = [
  { name: "Krishi", kannada: "ಕೃಷಿ", line: "Agriculture as inherited knowledge.", motif: "krishi" },
  { name: "Food", kannada: "ಊಟ", line: "Recipes, ingredients and stories passed through generations.", motif: "cuisine" },
  { name: "Performance", kannada: "ಪ್ರದರ್ಶನ", line: "Living traditions carried by performers and communities.", motif: "yakshagana" },
  { name: "Craft", kannada: "ಕರಕುಶಲ", line: "Skills preserved by makers.", motif: "kasuti" },
];

export function SoilOfTulunadu() {
  const desktop = useMediaQuery("(min-width: 1024px) and (min-height: 640px)");
  const reduce = useReducedMotion();

  return (
    <section aria-labelledby="soil" className="relative bg-night text-ivory">
      <div className="page-gutter mx-auto max-w-[1440px] pb-14 pt-28 lg:pb-6 lg:pt-40">
        <h2 id="soil" className="font-titling text-[clamp(2.4rem,5.6vw,5.4rem)] uppercase leading-[0.95]">
          From the soil
          <br />
          of Tulunadu
        </h2>
        <blockquote className="mt-10 max-w-3xl font-serif text-[clamp(1.45rem,2.7vw,2.35rem)] italic leading-snug text-ivory-dim">
          &ldquo;Culture does not live inside museums.
          <br />
          It lives in fields, kitchens, homes, stages and communities.&rdquo;
        </blockquote>
      </div>

      {desktop && !reduce ? <PinnedPanorama /> : <SwipePanorama />}

      <div className="page-gutter mx-auto grid max-w-[1440px] gap-px bg-ivory/10 py-px sm:grid-cols-2 lg:grid-cols-4">
        {PILLARS.map((p) => (
          <article key={p.name} className="flex flex-col bg-night pb-10 pt-8 sm:px-6 lg:px-8">
            <CulturalPlate motif={p.motif} className="aspect-[4/3] w-full" />
            <div className="mt-6 flex items-baseline justify-between gap-4">
              <h3 className="t-title">{p.name}</h3>
              <span lang="kn" className="t-kannada text-[1.5rem] text-gold-light/85">
                {p.kannada}
              </span>
            </div>
            <p className="mt-3 font-serif text-[1.1rem] leading-snug text-ivory-dim">{p.line}</p>
          </article>
        ))}
      </div>
      <div className="h-24 lg:h-32" />
    </section>
  );
}
