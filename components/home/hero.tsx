"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { hashString, seeded } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const TAU = Math.PI * 2;
const r2 = (n: number) => Math.round(n * 100) / 100;
const polar = (cx: number, cy: number, r: number, a: number): [number, number] => [
  r2(cx + Math.cos(a) * r),
  r2(cy + Math.sin(a) * r),
];

/**
 * The opening scene: a Yakshagana-inspired performer on an open-air stage at night,
 * framed by timber posts and a leaf garland, lit from below by brass lamps.
 * It is an illustration of costume and setting, not a portrait of any real artist.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const sceneY = useTransform(scrollYProgress, [0, 1], [0, 150]);
  const groundScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const at = (s: number) => (reduce ? 0 : s);

  return (
    <section ref={ref} aria-labelledby="hero-title" className="relative h-[100svh] min-h-[660px] overflow-hidden bg-night">
      <motion.div
        aria-hidden
        className="absolute inset-0"
        style={{ scale: groundScale }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: at(1.4) }}
      >
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(70% 60% at 76% 84%, #4a2316 0%, #1f120c 44%, #0a0706 100%)" }}
        />
        <DistantPalms />
        <div className="absolute inset-x-0 bottom-[12%] h-[30%] opacity-[0.14] texture-laterite [mask-image:linear-gradient(to_bottom,transparent,black_35%,black_70%,transparent)]" />
      </motion.div>

      <Mist />

      <motion.div
        aria-hidden
        style={{ y: sceneY }}
        className="absolute left-1/2 top-[7%] aspect-[10/9] h-[56%] -translate-x-1/2 sm:top-[5%] sm:h-[62%] lg:bottom-0 lg:left-auto lg:right-[-13%] lg:top-auto lg:h-[94%] lg:translate-x-0 xl:right-[-8%]"
      >
        <StageScene at={at} />
        <Embers />
      </motion.div>

      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(0deg,#0a0706_0%,rgb(10_7_6/0.94)_42%,rgb(10_7_6/0.35)_62%,transparent_80%)] lg:bg-[linear-gradient(90deg,#0a0706_0%,rgb(10_7_6/0.9)_30%,rgb(10_7_6/0.3)_56%,transparent_78%)]"
      />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-night to-transparent" />

      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="page-gutter @container relative z-10 mx-auto flex h-full max-w-[1440px] flex-col justify-end pb-[max(6rem,12svh)] lg:justify-center lg:pb-6"
      >
        <h1 id="hero-title" aria-label="Kalaverse" className="t-inscription whitespace-nowrap text-ivory max-sm:text-[length:min(3.4rem,calc(100cqi/6))] lg:text-[min(8.1vw,9.15rem)]">
          {"KALAVERSE".split("").map((letter, i) => (
            <motion.span
              key={i}
              aria-hidden
              className="inline-block"
              initial={{ opacity: 0, y: reduce ? 0 : 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: at(1.05 + i * 0.06), duration: 0.9, ease: EASE }}
            >
              {letter}
            </motion.span>
          ))}
        </h1>
        <svg viewBox="0 0 520 10" preserveAspectRatio="none" className="mt-3 h-2.5 w-[min(80vw,520px)] text-gold" aria-hidden>
          <motion.path
            d="M0 5 H514"
            stroke="currentColor"
            strokeWidth="1.4"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: at(1.65), duration: 1.3, ease: EASE }}
          />
          <motion.circle cx="515" cy="5" r="3.2" fill="currentColor" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: at(2.85), duration: 0.4 }} />
        </svg>
        <motion.p
          className="mt-6 font-serif text-[clamp(1.65rem,3.3vw,2.7rem)] italic leading-tight text-ivory"
          initial={{ opacity: 0, y: reduce ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: at(1.95), duration: 0.9, ease: EASE }}
        >
          Culture on Their Terms.
        </motion.p>
        <motion.p
          className="mt-4 max-w-[33rem] text-[1.03rem] leading-relaxed text-ivory-dim sm:text-[1.08rem]"
          initial={{ opacity: 0, y: reduce ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: at(2.1), duration: 0.9, ease: EASE }}
        >
          Discover Karnataka through the people who preserve it — with their consent, context, culture and control.
        </motion.p>
        <motion.div
          className="mt-8 flex flex-col gap-3 sm:flex-row"
          initial={{ opacity: 0, y: reduce ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: at(2.3), duration: 0.9, ease: EASE }}
        >
          <Button asChild size="lg" caps>
            <Link href="/discover">Explore Karnataka</Link>
          </Button>
          <Button asChild size="lg" caps variant="outline" className="bg-night/30 backdrop-blur-sm">
            <Link href="/register">Become a custodian</Link>
          </Button>
        </motion.div>
      </motion.div>

      <motion.div
        className="page-gutter absolute inset-x-0 bottom-0 z-10 mx-auto hidden h-16 max-w-[1440px] items-center justify-between text-[0.78rem] text-ash lg:flex"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: at(2.6), duration: 1 }}
      >
        <span className="pl-10">The digital ownership and consent layer for cultural tourism</span>
        <span className="flex items-center gap-3">
          <span className="relative h-8 w-px overflow-hidden bg-ivory/15">
            <span className="absolute inset-x-0 top-0 h-3 bg-gold-light motion-safe:animate-[scroll-cue_2.4s_ease-in-out_infinite]" />
          </span>
          Scroll
        </span>
        <span>Tulunadu, coastal Karnataka</span>
      </motion.div>
    </section>
  );
}

function DistantPalms() {
  const rand = seeded(hashString("hero-palms"));
  const palms = Array.from({ length: 18 }, (_, i) => ({
    x: r2(i * 62 + rand() * 30),
    h: r2(120 + rand() * 150),
    lean: r2(rand() * 24 - 12),
  }));
  return (
    <svg viewBox="0 0 1120 500" preserveAspectRatio="xMidYMax slice" className="absolute inset-x-0 bottom-[22%] h-[48%] w-full opacity-80">
      {palms.map((p, i) => {
        const tx = p.x + p.lean;
        const ty = 500 - p.h;
        const r = p.h * 0.22;
        return (
          <g key={i} stroke="#0e0907" fill="none" strokeLinecap="round">
            <path d={`M${p.x} 500 Q${r2(p.x + p.lean * 0.3)} ${r2(500 - p.h * 0.5)} ${r2(tx)} ${r2(ty)}`} strokeWidth="3" />
            {[-1, -0.6, -0.25, 0.25, 0.6, 1].map((k) => (
              <path
                key={k}
                strokeWidth="2.4"
                d={`M${r2(tx)} ${r2(ty)} Q${r2(tx + k * r * 0.5)} ${r2(ty - r * (0.6 - Math.abs(k) * 0.4))} ${r2(tx + k * r)} ${r2(ty + r * (Math.abs(k) * 0.6 - 0.05))}`}
              />
            ))}
          </g>
        );
      })}
      <rect x="0" y="470" width="1120" height="30" fill="#0e0907" />
    </svg>
  );
}

function Mist() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-1/4 bottom-[6%] h-[36%] w-[150%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(242_234_219/0.08),transparent)] blur-2xl motion-safe:animate-[mist_30s_ease-in-out_infinite_alternate]" />
      <div className="absolute -left-1/3 bottom-[24%] h-[28%] w-[140%] rounded-[50%] bg-[radial-gradient(closest-side,rgb(242_234_219/0.05),transparent)] blur-3xl motion-safe:animate-[mist_38s_ease-in-out_infinite_alternate-reverse]" />
    </div>
  );
}

function Embers() {
  const rand = seeded(hashString("hero-embers"));
  const embers = Array.from({ length: 22 }, (_, i) => ({
    left: r2((i % 2 ? 76 : 24) + (rand() * 8 - 4)),
    top: r2(64 + rand() * 6),
    size: r2(1.4 + rand() * 2.4),
    delay: r2(rand() * 9),
    duration: r2(6 + rand() * 6),
    drift: Math.round(rand() * 50 - 25),
    rise: Math.round(-(26 + rand() * 30)),
  }));
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {embers.map((e, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-[#ffd08a] opacity-0 shadow-[0_0_6px_1px_rgb(255_190_110/0.55)] motion-safe:animate-[ember_8s_linear_infinite]"
          style={
            {
              left: `${e.left}%`,
              top: `${e.top}%`,
              width: e.size,
              height: e.size,
              animationDelay: `${e.delay}s`,
              animationDuration: `${e.duration}s`,
              "--ember-drift": `${e.drift}px`,
              "--ember-rise": `${e.rise}vh`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

function StageScene({ at }: { at: (s: number) => number }) {
  return (
    <svg viewBox="0 0 1000 900" preserveAspectRatio="xMidYMax meet" className="absolute inset-0 size-full">
      <defs>
        <linearGradient id="hero-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6f5429" />
          <stop offset="0.45" stopColor="#e4c47f" />
          <stop offset="1" stopColor="#5f4521" />
        </linearGradient>
        <linearGradient id="hero-wood" x1="0" x2="1">
          <stop offset="0" stopColor="#3b2416" />
          <stop offset="0.35" stopColor="#24160e" />
          <stop offset="1" stopColor="#0f0906" />
        </linearGradient>
        <linearGradient id="hero-costume" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a171b" />
          <stop offset="0.55" stopColor="#5e1c22" />
          <stop offset="1" stopColor="#2a0b0d" />
        </linearGradient>
        <linearGradient id="hero-torso" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c0a0b" />
          <stop offset="1" stopColor="#120607" />
        </linearGradient>
        <radialGradient id="hero-skin" cx="0.4" cy="0.85" r="0.9">
          <stop offset="0" stopColor="#c48a45" />
          <stop offset="0.5" stopColor="#7a4a24" />
          <stop offset="1" stopColor="#24150b" />
        </radialGradient>
        <radialGradient id="hero-halo-glow">
          <stop offset="0" stopColor="#f2a24e" stopOpacity="0.22" />
          <stop offset="1" stopColor="#f2a24e" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hero-lamp-glow">
          <stop offset="0" stopColor="#ffbf66" stopOpacity="0.55" />
          <stop offset="0.4" stopColor="#f08a3a" stopOpacity="0.16" />
          <stop offset="1" stopColor="#f08a3a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hero-flame" cx="0.5" cy="0.78" r="0.62">
          <stop offset="0" stopColor="#fffbe6" />
          <stop offset="0.4" stopColor="#ffd271" />
          <stop offset="1" stopColor="#e0702a" />
        </radialGradient>
        <radialGradient id="hero-floor" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#e7883c" stopOpacity="0.34" />
          <stop offset="1" stopColor="#e7883c" stopOpacity="0" />
        </radialGradient>
        {/* Lamplight comes from below: the upper stage falls away into night. */}
        <linearGradient id="hero-topshade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a0706" stopOpacity="0.72" />
          <stop offset="0.38" stopColor="#0a0706" stopOpacity="0.42" />
          <stop offset="0.66" stopColor="#0a0706" stopOpacity="0.08" />
          <stop offset="1" stopColor="#0a0706" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="hero-vignette" cx="0.5" cy="0.9" r="0.9">
          <stop offset="0" stopColor="#0a0706" stopOpacity="0" />
          <stop offset="0.6" stopColor="#0a0706" stopOpacity="0.2" />
          <stop offset="1" stopColor="#0a0706" stopOpacity="0.8" />
        </radialGradient>
        <filter id="hero-figure" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
          <feColorMatrix in="SourceGraphic" type="matrix" values="0.72 0 0 0 0  0 0.66 0 0 0  0 0 0.6 0 0  0 0 0 1 0" result="dim" />
          <feDropShadow in="dim" dx="-2.5" dy="-2" stdDeviation="4" floodColor="#f3a64f" floodOpacity="0.5" />
        </filter>
      </defs>

      <ellipse cx="500" cy="872" rx="440" ry="70" fill="url(#hero-floor)" />

      <Pillar x={118} />
      <Pillar x={882} />
      <Garland />

      <motion.g initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: at(0.75), duration: at(1.8), ease: EASE }}>
        <Halo />
      </motion.g>

      <motion.g filter="url(#hero-figure)" initial={{ opacity: 0, y: at(28) }} animate={{ opacity: 1, y: 0 }} transition={{ delay: at(0.55), duration: at(1.7), ease: EASE }}>
        <Performer />
      </motion.g>

      <rect width="1000" height="900" fill="url(#hero-topshade)" pointerEvents="none" />

      <Lamp x={236} ignite={at(0.25)} />
      <Lamp x={764} ignite={at(0.4)} />

      <rect width="1000" height="900" fill="url(#hero-vignette)" pointerEvents="none" />
    </svg>
  );
}

function Pillar({ x }: { x: number }) {
  return (
    <g>
      <rect x={x - 21} y="40" width="42" height="834" fill="url(#hero-wood)" />
      <rect x={x - 30} y="36" width="60" height="26" fill="#150d09" />
      <rect x={x - 32} y="840" width="64" height="40" fill="#150d09" />
      {[230, 450, 670].map((y) => (
        <g key={y}>
          <rect x={x - 25} y={y} width="50" height="12" fill="#2a190f" />
          <line x1={x - 25} y1={y} x2={x + 25} y2={y} stroke="#b48d49" strokeOpacity="0.3" />
        </g>
      ))}
      <line x1={x - 21} y1="62" x2={x - 21} y2="840" stroke="#f3a64f" strokeOpacity="0.2" strokeWidth="2" />
    </g>
  );
}

function Garland() {
  const leaves = Array.from({ length: 29 }, (_, i) => {
    const t = (i + 0.5) / 29;
    return { x: r2(118 + t * 764), y: r2(78 + 190 * t * (1 - t)) };
  });
  return (
    <g>
      <path d="M118 78 Q500 173 882 78" fill="none" stroke="#24170e" strokeWidth="4" />
      {leaves.map(({ x, y }, i) => (
        <path
          key={i}
          d={`M${x} ${y} C${r2(x - 9)} ${r2(y + 18)} ${r2(x - 5)} ${r2(y + 40)} ${x} ${r2(y + 54)} C${r2(x + 5)} ${r2(y + 40)} ${r2(x + 9)} ${r2(y + 18)} ${x} ${y} Z`}
          fill={i % 2 ? "#1b3324" : "#26422e"}
          stroke="#d8b774"
          strokeOpacity="0.2"
        />
      ))}
    </g>
  );
}

function Halo() {
  const cx = 500;
  const cy = 252;
  const studs = Array.from({ length: 52 }, (_, i) => polar(cx, cy, 183, (i / 52) * TAU));
  const spokes = Array.from({ length: 96 }, (_, i) => (i / 96) * TAU);
  const dots = Array.from({ length: 40 }, (_, i) => polar(cx, cy, 142, (i / 40) * TAU));
  return (
    <g>
      <circle cx={cx} cy={cy} r="250" fill="url(#hero-halo-glow)" />
      <circle cx={cx} cy={cy} r="193" fill="url(#hero-gold)" opacity="0.85" />
      <circle cx={cx} cy={cy} r="176" fill="#3a1115" />
      {spokes.map((a, i) => {
        const [x1, y1] = polar(cx, cy, 153, a);
        const [x2, y2] = polar(cx, cy, 174, a);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d8b774" strokeWidth="1.2" opacity="0.38" />;
      })}
      <circle cx={cx} cy={cy} r="151" fill="#102017" />
      {dots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.4" fill="#e4c47f" opacity="0.7" />
      ))}
      <circle cx={cx} cy={cy} r="134" fill="#140909" stroke="#d8b774" strokeWidth="2" strokeOpacity="0.8" />
      {studs.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 ? 3 : 4.8} fill={i % 2 ? "#b48d49" : "#fff1c8"} opacity={i % 2 ? 0.65 : 0.9} />
      ))}
    </g>
  );
}

function Performer() {
  const pleats = Array.from({ length: 13 }, (_, i) => i - 6);
  const hemChecks = Array.from({ length: 20 }, (_, i) => {
    const x = 128 + i * 18;
    const k = (x - 300) / 190;
    return { x, y: r2(800 + 12 * (1 - k * k)) };
  });
  return (
    <g transform="translate(200 0)">
      {/* flared lower costume */}
      <path d="M196 560 C146 640 112 742 104 846 C196 880 404 880 496 846 C488 742 454 640 404 560 Z" fill="url(#hero-costume)" />
      {pleats.map((p) => (
        <path key={p} d={`M${300 + p * 14} 572 Q${300 + p * 22} 700 ${300 + p * 33} 858`} fill="none" stroke="#0d0405" strokeWidth="2.2" opacity="0.6" />
      ))}
      <path d="M120 786 C212 812 388 812 480 786 L488 826 C394 854 206 854 112 826 Z" fill="#6a2329" />
      {hemChecks.map(({ x, y }, i) => (
        <rect key={x} x={x} y={y} width="8" height="8" fill={i % 2 ? "#d9ccb0" : "#1d3a2e"} opacity="0.8" />
      ))}
      <path d="M104 846 C196 880 404 880 496 846 L494 860 C400 896 200 896 106 860 Z" fill="url(#hero-gold)" />
      <rect x="264" y="866" width="24" height="24" fill="#1a0f0b" />
      <rect x="312" y="866" width="24" height="24" fill="#1a0f0b" />
      {[258, 265, 272, 279, 286, 293, 307, 314, 321, 328, 335, 342].map((x) => (
        <circle key={x} cx={x} cy="878" r="3.4" fill="#d8b774" />
      ))}

      {/* arms behind torso */}
      <path d="M210 356 C182 380 160 420 158 468 C158 500 180 530 214 546" fill="none" stroke="#120708" strokeWidth="38" strokeLinecap="round" />
      <path d="M390 356 C426 344 456 318 468 284 C476 262 478 240 476 218" fill="none" stroke="#120708" strokeWidth="36" strokeLinecap="round" />

      {/* torso and ornaments */}
      <path d="M206 344 C232 326 270 320 300 320 C330 320 368 326 394 344 L414 424 L396 562 L204 562 L186 424 Z" fill="url(#hero-torso)" />
      <path d="M226 352 L372 556 M374 352 L228 556" stroke="#7a262d" strokeWidth="15" />
      <path d="M226 352 L372 556 M374 352 L228 556" stroke="#e9dcc0" strokeWidth="15" strokeDasharray="5 11" opacity="0.45" />
      <path d="M240 340 C246 410 354 410 360 340 L342 340 C336 388 264 388 258 340 Z" fill="url(#hero-gold)" />
      <path d="M252 342 C258 396 342 396 348 342" fill="none" stroke="#7b2a30" strokeWidth="3" />
      <circle cx="300" cy="404" r="14" fill="#7a262d" stroke="url(#hero-gold)" strokeWidth="4" />
      <circle cx="300" cy="404" r="4" fill="#fff1c8" />
      <rect x="194" y="546" width="212" height="28" rx="6" fill="url(#hero-gold)" />
      {[214, 238, 262, 286, 310, 334, 358, 382].map((x) => (
        <circle key={x} cx={x} cy="560" r="5" fill="#7a262d" />
      ))}

      {/* arm ornaments and hands */}
      <path d="M168 452 l36 9" stroke="url(#hero-gold)" strokeWidth="10" />
      <path d="M210 536 C220 530 236 534 238 546 C236 556 222 560 212 554 Z" fill="#6b4020" />
      <path d="M446 320 l32 15" stroke="url(#hero-gold)" strokeWidth="10" />
      <path d="M458 242 l36 4" stroke="url(#hero-gold)" strokeWidth="9" />
      <path d="M466 236 C462 214 466 196 472 184 L478 204 L482 176 L489 177 L489 203 L496 178 L502 182 L497 208 L507 192 L512 197 L500 228 C494 240 474 244 466 236 Z" fill="#7a4a24" />

      {/* shoulder ornaments */}
      <path d="M214 352 C184 332 164 298 168 254 C196 276 218 300 236 338 Z" fill="url(#hero-gold)" />
      <path d="M208 338 C190 322 180 300 180 276" fill="none" stroke="#7b2a30" strokeWidth="3" />
      <circle cx="190" cy="298" r="7" fill="#fff1c8" stroke="#7b2a30" strokeWidth="2" />
      <path d="M386 352 C416 332 436 298 432 254 C404 276 382 300 364 338 Z" fill="url(#hero-gold)" />
      <path d="M392 338 C410 322 420 300 420 276" fill="none" stroke="#7b2a30" strokeWidth="3" />
      <circle cx="410" cy="298" r="7" fill="#fff1c8" stroke="#7b2a30" strokeWidth="2" />

      {/* head: painted face in shadow, lit from the lamps below */}
      <path d="M280 298 H320 V332 H280 Z" fill="#3a2212" />
      <ellipse cx="300" cy="262" rx="42" ry="52" fill="url(#hero-skin)" />
      <path d="M264 288 C280 322 320 322 336 288" fill="none" stroke="#efe6d4" strokeWidth="2.4" strokeDasharray="0.5 6" strokeLinecap="round" opacity="0.7" />
      <path d="M268 250 C278 241 290 242 297 249" stroke="#0a0504" strokeWidth="3.6" fill="none" strokeLinecap="round" />
      <path d="M303 249 C310 242 322 241 332 250" stroke="#0a0504" strokeWidth="3.6" fill="none" strokeLinecap="round" />
      <path d="M274 262 C281 257 290 257 296 262" stroke="#0a0504" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M304 262 C310 257 319 257 326 262" stroke="#0a0504" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M270 256 L262 252 M330 256 L338 252" stroke="#a8322f" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      <path d="M294 292 Q300 295 306 292" stroke="#8e2a28" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity="0.85" />
      <circle cx="252" cy="270" r="17" fill="url(#hero-gold)" />
      <circle cx="252" cy="270" r="7" fill="#1d3a2e" />
      <circle cx="252" cy="270" r="3" fill="#fff1c8" />
      <circle cx="348" cy="270" r="17" fill="url(#hero-gold)" />
      <circle cx="348" cy="270" r="7" fill="#1d3a2e" />
      <circle cx="348" cy="270" r="3" fill="#fff1c8" />

      {/* crown */}
      <path d="M248 228 H352 L343 200 H257 Z" fill="url(#hero-gold)" />
      {[266, 283, 300, 317, 334].map((x) => (
        <circle key={x} cx={x} cy="214" r="4" fill="#7a262d" />
      ))}
      <path d="M261 200 H339 L328 165 H272 Z" fill="#4a171b" stroke="url(#hero-gold)" strokeWidth="3" />
      {[282, 300, 318].map((x) => (
        <circle key={x} cx={x} cy="183" r="4.5" fill="#fff1c8" />
      ))}
      <path d="M273 165 H327 L315 127 H285 Z" fill="#132a20" stroke="url(#hero-gold)" strokeWidth="3" />
      <circle cx="300" cy="147" r="5" fill="#fff1c8" />
      <path d="M287 127 H313 L300 84 Z" fill="url(#hero-gold)" />
      <circle cx="300" cy="80" r="6" fill="#fff1c8" />
    </g>
  );
}

function Lamp({ x, ignite }: { x: number; ignite: number }) {
  return (
    <g>
      <motion.circle cx={x} cy="616" r="150" fill="url(#hero-lamp-glow)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: ignite + 0.2, duration: 1.2 }} />
      <motion.g
        initial={{ opacity: 0, scale: 0.2 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: ignite, duration: 0.9, ease: EASE }}
        style={{ transformOrigin: `${x}px 630px` }}
      >
        <path
          d={`M${x} 578c11 16 16 25 16 34a16 16 0 0 1-32 0c0-9 5-18 16-34Z`}
          fill="url(#hero-flame)"
          className="[transform-box:fill-box] [transform-origin:50%_85%] motion-safe:animate-flame"
        />
      </motion.g>
      <path d={`M${x - 40} 630 H${x + 40} C${x + 40} 648 ${x + 22} 660 ${x} 660 C${x - 22} 660 ${x - 40} 648 ${x - 40} 630 Z`} fill="url(#hero-gold)" />
      <rect x={x - 6} y="660" width="12" height="176" fill="url(#hero-gold)" />
      <ellipse cx={x} cy="706" rx="16" ry="6" fill="url(#hero-gold)" />
      <ellipse cx={x} cy="770" rx="20" ry="7" fill="url(#hero-gold)" />
      <path d={`M${x - 46} 880 C${x - 46} 850 ${x - 22} 830 ${x} 830 C${x + 22} 830 ${x + 46} 850 ${x + 46} 880 Z`} fill="url(#hero-gold)" />
    </g>
  );
}
