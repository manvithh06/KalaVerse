"use client";

import { useId, type ReactNode } from "react";
import Image from "next/image";
import type { Motif } from "@/types";
import { MOTIF_PHOTOS, type Photo } from "@/data/photos";
import { cn, hashString, seeded } from "@/lib/utils";

/**
 * Illustrated plates, drawn rather than photographed: materials, landscapes and
 * ornament, never a sacred act. Each scene is composed around the centre of a
 * 400 × 500 field so it survives any crop.
 *
 * A plate shows a photograph instead wherever one exists for its motif (see
 * data/photos.ts), with the illustration left underneath as the fallback.
 * Protected practices have no photograph and never will.
 */

type Ids = (name: string) => string;

interface Scene {
  label: string;
  bg: string;
  draw: (id: Ids) => ReactNode;
}

const TAU = Math.PI * 2;
const r2 = (n: number) => Math.round(n * 100) / 100;
const polar = (cx: number, cy: number, r: number, a: number): [number, number] => [
  r2(cx + Math.cos(a) * r),
  r2(cy + Math.sin(a) * r),
];

function Palm({
  x,
  base,
  height,
  lean = 0,
  color,
  width = 3,
}: {
  x: number;
  base: number;
  height: number;
  lean?: number;
  color: string;
  width?: number;
}) {
  const tx = r2(x + lean);
  const ty = r2(base - height);
  const r = Math.max(16, height * 0.24);
  const fronds = [-1, -0.62, -0.28, 0.28, 0.62, 1];
  return (
    <g stroke={color} fill="none" strokeLinecap="round">
      <path d={`M${x} ${base} Q${r2(x + lean * 0.25)} ${r2(base - height * 0.55)} ${tx} ${ty}`} strokeWidth={width} />
      {fronds.map((k) => (
        <path
          key={k}
          strokeWidth={r2(width * 0.72)}
          d={`M${tx} ${ty} Q${r2(tx + k * r * 0.5)} ${r2(ty - r * (0.62 - Math.abs(k) * 0.42))} ${r2(tx + k * r)} ${r2(ty + r * (Math.abs(k) * 0.62 - 0.06))}`}
        />
      ))}
      <path strokeWidth={r2(width * 0.72)} d={`M${tx} ${ty} Q${r2(tx + 1)} ${r2(ty - r * 0.5)} ${r2(tx + 3)} ${r2(ty - r * 0.85)}`} />
    </g>
  );
}

function Buffalo({ x, y, s = 1, color }: { x: number; y: number; s?: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
      <path d="M-52 -8 C-54 -30 -24 -40 8 -36 C30 -34 44 -30 52 -20 L72 -12 C77 -8 75 1 66 2 L52 2 C47 11 41 14 34 15 L46 40 L37 43 L24 18 L-18 19 L-40 42 L-49 39 L-34 15 C-46 11 -52 3 -52 -8 Z" />
      <path d="M50 -24 C46 -42 32 -48 18 -45" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" />
      <path d="M-52 -6 C-60 2 -62 12 -58 22" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </g>
  );
}

/** One path of counted cross-stitches at the given grid cells. */
function crosses(cells: [number, number][], ox: number, oy: number, pitch: number, size: number) {
  return cells
    .map(([c, r]) => {
      const x = ox + c * pitch;
      const y = oy + r * pitch;
      return `M${x} ${y}l${size} ${size}M${x + size} ${y}l${-size} ${size}`;
    })
    .join("");
}

function towerCells(): [number, number][] {
  const rows = [[5], [4, 5, 6], [4, 6], [3, 4, 5, 6, 7], [3, 7], [2, 3, 4, 5, 6, 7, 8], [2, 5, 8], [1, 2, 3, 4, 5, 6, 7, 8, 9], [1, 4, 6, 9], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [0, 10], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]];
  return rows.flatMap((cols, r) => cols.map((c) => [c, r] as [number, number]));
}

const SCENES: Record<Motif, Scene> = {
  yakshagana: {
    label: "Illustration: the mirror-studded rings of a Yakshagana crown, lit by lamplight",
    bg: "radial-gradient(120% 90% at 50% 52%, #4a1b17 0%, #22100d 46%, #0e0908 100%)",
    draw: (id) => {
      const studs = Array.from({ length: 44 }, (_, i) => polar(200, 250, 145, (i / 44) * TAU));
      const spokes = Array.from({ length: 72 }, (_, i) => (i / 72) * TAU);
      return (
        <>
          <defs>
            <radialGradient id={id("glow")}>
              <stop offset="0" stopColor="#f2b35c" stopOpacity="0.4" />
              <stop offset="1" stopColor="#f2b35c" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={id("gold")} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#8a6a33" />
              <stop offset="0.5" stopColor="#ecd08e" />
              <stop offset="1" stopColor="#6e5126" />
            </linearGradient>
          </defs>
          <circle cx="200" cy="250" r="210" fill={`url(#${id("glow")})`} />
          {[166, 157, 131, 119].map((r, i) => (
            <circle key={r} cx="200" cy="250" r={r} fill="none" stroke={`url(#${id("gold")})`} strokeWidth={i < 2 ? 2.4 : 1.2} opacity={0.95 - i * 0.14} />
          ))}
          {spokes.map((a, i) => {
            const [x1, y1] = polar(200, 250, 120, a);
            const [x2, y2] = polar(200, 250, 130, a);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d8b774" strokeWidth="1" opacity="0.55" />;
          })}
          {studs.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 2 ? 2.2 : 3.6} fill={i % 2 ? "#d8b774" : "#f7e6b8"} opacity={i % 2 ? 0.6 : 0.95} />
          ))}
          <circle cx="200" cy="250" r="112" fill="#2b0f0f" />
          <circle cx="200" cy="250" r="104" fill="none" stroke="#b4494f" strokeWidth="7" opacity="0.5" />
          <circle cx="200" cy="250" r="92" fill="none" stroke="#1d3a2e" strokeWidth="5" opacity="0.9" />
          <path d="M200 156 L219 200 H181 Z" fill={`url(#${id("gold")})`} />
          <path d="M172 204 H228 L236 232 H164 Z" fill="#7b2a30" stroke="#d8b774" strokeWidth="1.4" />
          <path d="M158 236 H242 L250 266 H150 Z" fill="#1d3a2e" stroke="#d8b774" strokeWidth="1.4" />
          {[176, 188, 200, 212, 224].map((x) => (
            <circle key={x} cx={x} cy="218" r="2.4" fill="#f7e6b8" />
          ))}
          {[166, 183, 200, 217, 234].map((x) => (
            <circle key={x} cx={x} cy="251" r="2.8" fill="#f7e6b8" opacity="0.9" />
          ))}
          <path d="M152 270 H248 L240 300 C228 318 172 318 160 300 Z" fill="#150a09" stroke="#d8b774" strokeWidth="1" opacity="0.95" />
          <circle cx="146" cy="292" r="15" fill="none" stroke="#d8b774" strokeWidth="2" />
          <circle cx="146" cy="292" r="4.5" fill="#f7e6b8" />
          <circle cx="254" cy="292" r="15" fill="none" stroke="#d8b774" strokeWidth="2" />
          <circle cx="254" cy="292" r="4.5" fill="#f7e6b8" />
        </>
      );
    },
  },

  crown: {
    label: "Illustration: construction lines of a hand-made stage crown in wood, mirror and foil",
    bg: "linear-gradient(160deg, #271c14 0%, #130d0a 100%)",
    draw: (id) => {
      const petals = Array.from({ length: 13 }, (_, i) => Math.PI + (i / 12) * Math.PI);
      return (
        <>
          <defs>
            <linearGradient id={id("foil")} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#7d6232" />
              <stop offset="0.5" stopColor="#e6c784" />
              <stop offset="1" stopColor="#7d6232" />
            </linearGradient>
          </defs>
          <g stroke="#f2eadb" opacity="0.05">
            {Array.from({ length: 17 }, (_, i) => (
              <line key={`v${i}`} x1={i * 25} y1="0" x2={i * 25} y2="500" />
            ))}
            {Array.from({ length: 21 }, (_, i) => (
              <line key={`h${i}`} x1="0" y1={i * 25} x2="400" y2={i * 25} />
            ))}
          </g>
          <circle cx="200" cy="318" r="160" fill="none" stroke="#f2eadb" strokeDasharray="3 6" opacity="0.14" />
          {petals.map((a, i) => {
            const [x, y] = polar(200, 318, 150, a);
            return <line key={i} x1="200" y1="318" x2={x} y2={y} stroke="#f2eadb" opacity="0.07" />;
          })}
          <path d="M80 318 A120 120 0 0 1 320 318" fill="none" stroke={`url(#${id("foil")})`} strokeWidth="14" />
          <path d="M96 318 A104 104 0 0 1 304 318" fill="none" stroke="#5a1c21" strokeWidth="10" />
          {petals.map((a, i) => {
            const [bx, by] = polar(200, 318, 127, a);
            const [tx, ty] = polar(200, 318, 162, a);
            const [lx, ly] = polar(200, 318, 132, a - 0.09);
            const [rx, ry] = polar(200, 318, 132, a + 0.09);
            return (
              <path
                key={i}
                d={`M${lx} ${ly} Q${bx} ${by} ${rx} ${ry} L${tx} ${ty} Z`}
                fill={i % 2 ? "#1d3a2e" : `url(#${id("foil")})`}
                stroke="#d8b774"
                strokeWidth="1"
              />
            );
          })}
          {Array.from({ length: 16 }, (_, i) => {
            const [x, y] = polar(200, 318, 110, Math.PI + ((i + 0.5) / 16) * Math.PI);
            return <circle key={i} cx={x} cy={y} r="3" fill="#f7e6b8" />;
          })}
          <rect x="74" y="318" width="252" height="24" fill="#1a120d" stroke="#d8b774" strokeWidth="1.2" />
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x={80 + i * 20.5} y="324" width="10" height="12" fill={i % 2 ? "#7b2a30" : "#d8b774"} opacity="0.85" />
          ))}
          <path d="M300 420 L360 470" stroke="#9a8f80" strokeWidth="4" strokeLinecap="round" />
          <path d="M292 413 L304 424" stroke="#6b4a2a" strokeWidth="9" strokeLinecap="round" />
        </>
      );
    },
  },

  rhythm: {
    label: "Illustration: a chende drum with its sticks and rings of sound",
    bg: "radial-gradient(90% 70% at 50% 58%, #3d1715 0%, #150c0a 70%)",
    draw: (id) => (
      <>
        <defs>
          <linearGradient id={id("body")} x1="0" x2="1">
            <stop offset="0" stopColor="#3a1114" />
            <stop offset="0.45" stopColor="#8a3238" />
            <stop offset="1" stopColor="#2a0c0f" />
          </linearGradient>
        </defs>
        {Array.from({ length: 6 }, (_, i) => (
          <ellipse key={i} cx="200" cy="205" rx={72 + i * 30} ry={22 + i * 9} fill="none" stroke="#d8b774" strokeWidth="1.2" opacity={0.5 - i * 0.075} />
        ))}
        <path d="M138 205 L150 368 A50 14 0 0 0 250 368 L262 205 Z" fill={`url(#${id("body")})`} />
        <polyline
          points={Array.from({ length: 13 }, (_, i) => `${r2(142 + i * 9.7 + (i % 2 ? 0 : 0))},${i % 2 ? 350 : 222}`).join(" ")}
          fill="none"
          stroke="#d8b774"
          strokeWidth="1.6"
          opacity="0.85"
        />
        <rect x="140" y="216" width="120" height="6" fill="#d8b774" opacity="0.8" />
        <rect x="149" y="350" width="102" height="6" fill="#d8b774" opacity="0.7" />
        <ellipse cx="200" cy="205" rx="62" ry="18" fill="#eadcc0" />
        <ellipse cx="200" cy="205" rx="50" ry="13" fill="none" stroke="#b39a74" strokeWidth="1" />
        <path d="M112 112 L208 196" stroke="#c9a36a" strokeWidth="6" strokeLinecap="round" />
        <path d="M300 104 L212 199" stroke="#b58b52" strokeWidth="6" strokeLinecap="round" />
      </>
    ),
  },

  makeup: {
    label: "Illustration: bowls of stage pigment and sweeping lines of colour",
    bg: "radial-gradient(90% 70% at 50% 45%, #2c1813 0%, #0f0a08 80%)",
    draw: () => {
      const dots = Array.from({ length: 15 }, (_, i) => {
        const t = i / 14;
        return [r2(118 + t * 164), r2(262 + Math.sin(t * Math.PI) * 34)] as [number, number];
      });
      return (
        <>
          <path d="M96 196 Q200 120 304 196" fill="none" stroke="#b8403a" strokeWidth="12" strokeLinecap="round" />
          <path d="M112 222 Q200 170 288 222" fill="none" stroke="#e6b64a" strokeWidth="5" strokeLinecap="round" opacity="0.9" />
          <path d="M126 240 Q200 205 274 240" fill="none" stroke="#efe6d4" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          {dots.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 4 : 2.6} fill="#efe6d4" />
          ))}
          {[
            { x: 110, c: "#b8403a" },
            { x: 170, c: "#e6b64a" },
            { x: 230, c: "#efe6d4" },
            { x: 290, c: "#3a3531" },
          ].map((b) => (
            <g key={b.x}>
              <ellipse cx={b.x} cy="382" rx="26" ry="10" fill="#1a110d" stroke="#6d5a47" strokeWidth="1.5" />
              <ellipse cx={b.x} cy="380" rx="19" ry="6.5" fill={b.c} />
            </g>
          ))}
          <path d="M318 330 L360 250" stroke="#6b4a2a" strokeWidth="5" strokeLinecap="round" />
          <path d="M316 334 L310 346" stroke="#b8403a" strokeWidth="6" strokeLinecap="round" />
        </>
      );
    },
  },

  talamaddale: {
    label: "Illustration: three seated artists around a lamp, with lines of spoken dialogue between them",
    bg: "linear-gradient(180deg, #17142a 0%, #100c14 58%, #1b120e 100%)",
    draw: (id) => (
      <>
        <defs>
          <radialGradient id={id("lamp")}>
            <stop offset="0" stopColor="#f5c46a" stopOpacity="0.55" />
            <stop offset="1" stopColor="#f5c46a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="330" r="150" fill={`url(#${id("lamp")})`} />
        <rect x="40" y="340" width="320" height="16" fill="#2d231c" />
        {[92, 200, 308].map((x, i) => (
          <g key={x} fill="#0b0909">
            <circle cx={x} cy={i === 1 ? 236 : 246} r="17" />
            <path d={`M${x - 36} 340 C${x - 34} ${i === 1 ? 282 : 292} ${x - 18} ${i === 1 ? 262 : 272} ${x} ${i === 1 ? 262 : 272} C${x + 18} ${i === 1 ? 262 : 272} ${x + 34} ${i === 1 ? 282 : 292} ${x + 36} 340 Z`} />
          </g>
        ))}
        {[
          "M114 226 C136 206 160 212 178 222",
          "M222 222 C242 208 266 210 288 228",
          "M110 212 C150 170 250 170 290 212",
        ].map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#d8b774" strokeWidth="1.4" strokeDasharray={i === 2 ? "2 6" : undefined} opacity={i === 2 ? 0.5 : 0.8} />
        ))}
        <path d="M200 306c5 7 7 11 7 15a7 7 0 0 1-14 0c0-4 2-8 7-15Z" fill="#f6c35b" />
        <path d="M188 330 h24 l-4 10 h-16 Z" fill="#b48d49" />
      </>
    ),
  },

  daivaradhane: {
    label: "Abstract illustration: a single warm glow with rings of light. Sacred practices are not depicted.",
    bg: "radial-gradient(60% 50% at 50% 55%, #3a1c0e 0%, #140b08 55%, #070605 100%)",
    draw: (id) => {
      const rays = Array.from({ length: 11 }, (_, i) => -Math.PI / 2 + (i - 5) * 0.09);
      return (
        <>
          <defs>
            <radialGradient id={id("glow")}>
              <stop offset="0" stopColor="#f3b25a" stopOpacity="0.55" />
              <stop offset="0.5" stopColor="#c7622c" stopOpacity="0.18" />
              <stop offset="1" stopColor="#c7622c" stopOpacity="0" />
            </radialGradient>
            <linearGradient id={id("ray")} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#f3c27a" stopOpacity="0.35" />
              <stop offset="1" stopColor="#f3c27a" stopOpacity="0" />
            </linearGradient>
          </defs>
          <circle cx="200" cy="270" r="220" fill={`url(#${id("glow")})`} />
          {rays.map((a, i) => {
            const [x, y] = polar(200, 270, 250, a);
            return <line key={i} x1="200" y1="270" x2={x} y2={y} stroke={`url(#${id("ray")})`} strokeWidth={i % 2 ? 1 : 2} />;
          })}
          {Array.from({ length: 8 }, (_, i) => (
            <circle key={i} cx="200" cy="270" r={40 + i * 26} fill="none" stroke="#e0a860" strokeWidth="0.8" opacity={0.22 - i * 0.022} />
          ))}
          <path d="M200 238c11 15 15 24 15 32a15 15 0 0 1-30 0c0-8 4-17 15-32Z" fill="#fbe2a8" opacity="0.85" />
        </>
      );
    },
  },

  kambala: {
    label: "Illustration: two buffaloes racing through a flooded paddy track at dawn",
    bg: "linear-gradient(180deg, #d19462 0%, #86503a 26%, #2f201a 50%, #16100d 100%)",
    draw: () => {
      const rand = seeded(hashString("kambala"));
      return (
        <>
          <circle cx="300" cy="150" r="26" fill="#f6d39a" opacity="0.8" />
          {Array.from({ length: 9 }, (_, i) => (
            <Palm key={i} x={20 + i * 45 + rand() * 20} base={214} height={50 + rand() * 45} lean={rand() * 10 - 5} color="#2a1c17" width={2.4} />
          ))}
          <rect x="0" y="210" width="400" height="16" fill="#241814" />
          {Array.from({ length: 14 }, (_, i) => {
            const y = r2(232 + Math.pow(i, 1.55) * 5.2);
            return <line key={i} x1={r2(60 + rand() * 40)} y1={y} x2={r2(300 + rand() * 60)} y2={y} stroke="#e9b98a" strokeWidth={1 + i * 0.12} opacity={0.12 + rand() * 0.18} />;
          })}
          <path d="M200 222 L20 500" stroke="#3b2a22" strokeWidth="3" />
          <path d="M200 222 L380 500" stroke="#3b2a22" strokeWidth="3" />
          <Buffalo x={168} y={300} s={1.08} color="#0b0807" />
          <Buffalo x={246} y={286} s={0.9} color="#171210" />
          {Array.from({ length: 26 }, (_, i) => (
            <circle key={i} cx={r2(110 + rand() * 200)} cy={r2(318 + rand() * 50)} r={r2(0.8 + rand() * 2.4)} fill="#f2e2c7" opacity={r2(0.3 + rand() * 0.5)} />
          ))}
          <path d="M96 344 Q150 322 210 344 Q260 330 318 346" fill="none" stroke="#f2e2c7" strokeWidth="1.6" opacity="0.5" />
        </>
      );
    },
  },

  krishi: {
    label: "Illustration: terraced paddy fields with areca palms on the horizon",
    bg: "linear-gradient(180deg, #ddd6ba 0%, #b3b995 20%, #6e8a62 38%, #2c4a36 70%, #15251b 100%)",
    draw: (id) => {
      const rand = seeded(hashString("krishi"));
      const bands = [
        { y: 206, fill: "#7f9b6b", shoot: "#b0c98f" },
        { y: 240, fill: "#62905b", shoot: "#93b97b" },
        { y: 280, fill: "#4e7c4d", shoot: "#80a86d" },
        { y: 326, fill: "#3c6b43", shoot: "#6c9c5f" },
        { y: 380, fill: "#2f5939", shoot: "#5c8c53" },
        { y: 440, fill: "#23472e", shoot: "#4d7b48" },
      ];
      const edge = (b: number, i: number, t: number) => {
        const y1 = b - 10 - i * 2;
        const y2 = b + 12 + i * 2;
        const y3 = b - 4;
        return (1 - t) ** 3 * b + 3 * (1 - t) ** 2 * t * y1 + 3 * (1 - t) * t ** 2 * y2 + t ** 3 * y3;
      };
      return (
        <>
          <defs>
            <filter id={id("mist")}>
              <feGaussianBlur stdDeviation="10" />
            </filter>
          </defs>
          <circle cx="110" cy="120" r="40" fill="#f4ecd0" opacity="0.55" />
          {Array.from({ length: 16 }, (_, i) => (
            <Palm key={i} x={r2(8 + i * 25 + rand() * 12)} base={210} height={r2(55 + rand() * 60)} lean={r2(rand() * 8 - 4)} color="#3f5a42" width={2} />
          ))}
          <ellipse cx="200" cy="206" rx="240" ry="18" fill="#e9e4cc" opacity="0.45" filter={`url(#${id("mist")})`} />
          {bands.map((b, i) => {
            const step = 5 + i;
            let shoots = "";
            for (let x = 3; x < 400; x += step) {
              const y = edge(b.y, i, x / 400) + 4 + rand() * 7;
              shoots += `M${x} ${r2(y)}l${r2(rand() * 2 - 1)} ${r2(-6 - rand() * 5)}`;
            }
            return (
              <g key={b.y}>
                <path d={`M0 ${b.y} C120 ${b.y - 10 - i * 2} 280 ${b.y + 12 + i * 2} 400 ${b.y - 4} V500 H0 Z`} fill={b.fill} />
                <path d={shoots} stroke={b.shoot} strokeWidth="1" opacity="0.6" />
              </g>
            );
          })}
          {[0, 1, 2].map((i) => (
            <line key={i} x1={80 + i * 90} y1={300 + i * 6} x2={140 + i * 90} y2={300 + i * 6} stroke="#f4ecd0" strokeWidth="1.2" opacity="0.35" />
          ))}
        </>
      );
    },
  },

  tulunadu: {
    label: "Illustration: a temple-carving rosette above a row of clay roof tiles",
    bg: "linear-gradient(180deg, #efe6d3 0%, #e2d3b4 100%)",
    draw: () => {
      const petals = Array.from({ length: 12 }, (_, i) => (360 / 12) * i);
      return (
        <>
          <g stroke="#9a4a31" fill="none">
            <circle cx="200" cy="232" r="132" strokeWidth="1" opacity="0.4" />
            <circle cx="200" cy="232" r="122" strokeWidth="0.8" strokeDasharray="2 5" opacity="0.6" />
            {petals.map((a) => (
              <path key={a} d="M200 232 C188 212 188 150 200 118 C212 150 212 212 200 232 Z" strokeWidth="1.3" transform={`rotate(${a} 200 232)`} opacity="0.85" />
            ))}
            {petals.map((a) => (
              <path key={`i${a}`} d="M200 232 C194 220 194 190 200 172 C206 190 206 220 200 232 Z" strokeWidth="1" transform={`rotate(${a + 15} 200 232)`} opacity="0.5" />
            ))}
            <circle cx="200" cy="232" r="16" strokeWidth="1.4" />
          </g>
          <circle cx="200" cy="232" r="5" fill="#9a4a31" />
          {Array.from({ length: 4 }, (_, row) => (
            <g key={row}>
              {Array.from({ length: 16 }, (_, c) => (
                <path
                  key={c}
                  d={`M${c * 28 - (row % 2) * 14} ${410 + row * 16} a14 14 0 0 1 28 0`}
                  fill={row % 2 ? "#b9613f" : "#9a4a31"}
                  stroke="#6e2f1d"
                  strokeWidth="1"
                  opacity={0.95 - row * 0.1}
                />
              ))}
            </g>
          ))}
        </>
      );
    },
  },

  cuisine: {
    label: "Illustration: a banana leaf set with neer dosa, rice, pathrode and a coconut curry",
    bg: "radial-gradient(100% 80% at 50% 45%, #2b1e15 0%, #120d0a 100%)",
    draw: (id) => {
      const veins = Array.from({ length: 22 }, (_, i) => i / 21);
      return (
        <>
          <defs>
            <linearGradient id={id("leaf")} x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#1f4d2b" />
              <stop offset="0.55" stopColor="#2f6d3b" />
              <stop offset="1" stopColor="#255a31" />
            </linearGradient>
          </defs>
          <g stroke="#f2eadb" opacity="0.04">
            {Array.from({ length: 9 }, (_, i) => (
              <path key={i} d={`M0 ${40 + i * 55} C140 ${30 + i * 55} 260 ${60 + i * 55} 400 ${45 + i * 55}`} fill="none" />
            ))}
          </g>
          <path d="M28 400 C110 222 250 118 378 88 C338 196 214 342 28 400 Z" fill={`url(#${id("leaf")})`} />
          <path d="M28 400 L378 88" stroke="#6fae6c" strokeWidth="2" opacity="0.55" />
          {veins.map((t, i) => {
            const x = 28 + t * 350;
            const y = 400 - t * 312;
            return <path key={i} d={`M${r2(x)} ${r2(y)} l${r2(34 - t * 10)} ${r2(40 - t * 12)} M${r2(x)} ${r2(y)} l${r2(-34 + t * 10)} ${r2(-38 + t * 12)}`} stroke="#6fae6c" strokeWidth="0.8" opacity="0.28" />;
          })}
          <ellipse cx="166" cy="272" rx="36" ry="25" fill="#efe9da" />
          {Array.from({ length: 18 }, (_, i) => (
            <circle key={i} cx={r2(140 + ((i * 37) % 52))} cy={r2(258 + ((i * 23) % 28))} r="1.4" fill="#cfc6b0" />
          ))}
          <path d="M214 198 L276 176 L258 238 Z" fill="#f1ead9" />
          {Array.from({ length: 10 }, (_, i) => (
            <circle key={i} cx={r2(230 + ((i * 13) % 34))} cy={r2(192 + ((i * 17) % 34))} r="2" fill="#dcd2bc" />
          ))}
          <circle cx="262" cy="292" r="28" fill="#c26a3c" />
          <circle cx="262" cy="292" r="22" fill="#8e2f1c" />
          <ellipse cx="254" cy="284" rx="7" ry="3.5" fill="#e79a5a" opacity="0.6" />
          {[
            [112, 316],
            [136, 332],
            [92, 336],
          ].map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <circle cx={x} cy={y} r="14" fill="#465a2a" />
              <path d={`M${x} ${y} m-8 0 a8 8 0 1 0 8 -8 a5 5 0 1 0 5 5`} fill="none" stroke="#c9a54c" strokeWidth="1.6" />
            </g>
          ))}
        </>
      );
    },
  },

  kasuti: {
    label: "Illustration: Kasuti cross-stitch motifs of a temple tower and lamps on dark cloth",
    bg: "linear-gradient(160deg, #3d141a 0%, #1c0b0e 100%)",
    draw: () => {
      const tower = crosses(towerCells(), 118, 170, 15, 7);
      const lampCells: [number, number][] = [[2, 0], [1, 1], [2, 1], [3, 1], [2, 2], [2, 3], [1, 4], [2, 4], [3, 4], [0, 5], [1, 5], [2, 5], [3, 5], [4, 5]];
      const border: [number, number][] = [];
      for (let c = 0; c < 36; c++) {
        border.push([c, 0]);
        if (c % 4 === 1) border.push([c, 1]);
        if (c % 4 === 2) border.push([c, 1], [c, 2]);
        if (c % 4 === 3) border.push([c, 1]);
      }
      return (
        <>
          <g stroke="#f2eadb" opacity="0.05">
            {Array.from({ length: 50 }, (_, i) => (
              <line key={i} x1="0" y1={i * 10} x2="400" y2={i * 10} />
            ))}
          </g>
          <path d={crosses(border, 22, 64, 10, 5)} stroke="#d8b774" strokeWidth="1.4" opacity="0.9" />
          <path d={crosses(border.map(([c, r]) => [c, -r]), 22, 436, 10, 5)} stroke="#d8b774" strokeWidth="1.4" opacity="0.9" />
          <path d={tower} stroke="#f2eadb" strokeWidth="1.6" strokeLinecap="round" />
          <path d={crosses(lampCells, 40, 250, 12, 6)} stroke="#e6b64a" strokeWidth="1.4" />
          <path d={crosses(lampCells, 302, 250, 12, 6)} stroke="#e6b64a" strokeWidth="1.4" />
        </>
      );
    },
  },

  pottery: {
    label: "Illustration: a round-bellied clay pot turning on a potter's wheel",
    bg: "radial-gradient(90% 70% at 50% 62%, #6d3421 0%, #2b1610 58%, #140b08 100%)",
    draw: (id) => (
      <>
        <defs>
          <linearGradient id={id("clay")} x1="0" x2="1">
            <stop offset="0" stopColor="#6e3320" />
            <stop offset="0.42" stopColor="#c46a43" />
            <stop offset="1" stopColor="#5a2918" />
          </linearGradient>
        </defs>
        {[60, 120, 330].map((x, i) => (
          <path key={x} d={`M${x - 18} 186 C${x - 34} 176 ${x - 34} 146 ${x - 12} 136 L${x - 8} 128 H${x + 8} L${x + 12} 136 C${x + 34} 146 ${x + 34} 176 ${x + 18} 186 Z`} fill="#1d110c" opacity={0.8 - i * 0.1} />
        ))}
        <rect x="0" y="186" width="400" height="4" fill="#1d110c" opacity="0.7" />
        <ellipse cx="200" cy="364" rx="128" ry="28" fill="#23140e" stroke="#b9613f" strokeOpacity="0.5" />
        <path d="M92 372 A118 22 0 0 0 308 372" fill="none" stroke="#e9a57a" strokeWidth="1.2" opacity="0.35" strokeDasharray="30 14" />
        <path d="M158 352 C114 330 112 256 158 232 C171 226 177 220 175 210 H225 C223 220 229 226 242 232 C288 256 286 330 242 352 Z" fill={`url(#${id("clay")})`} />
        {[250, 272, 294, 316, 336].map((y) => (
          <path key={y} d={`M${y < 300 ? 132 : 126} ${y} Q200 ${y + 6} ${y < 300 ? 268 : 274} ${y}`} fill="none" stroke="#f2d2b8" strokeWidth="0.8" opacity="0.18" />
        ))}
        <ellipse cx="200" cy="210" rx="25" ry="6" fill="#4a2214" />
        <ellipse cx="200" cy="209" rx="18" ry="3.5" fill="#1f0e08" />
      </>
    ),
  },

  weaving: {
    label: "Illustration: handloom warp threads with a checked body and a contrast border",
    bg: "linear-gradient(180deg, #221c1a 0%, #141010 100%)",
    draw: () => (
      <>
        <g stroke="#f2eadb" opacity="0.16">
          {Array.from({ length: 56 }, (_, i) => (
            <line key={i} x1={36 + i * 6} y1="40" x2={36 + i * 6} y2="460" />
          ))}
        </g>
        <g opacity="0.85">
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={`h${i}`} x="36" y={96 + i * 30} width="330" height="6" fill={i % 2 ? "#c9a352" : "#3d5f7c"} />
          ))}
          {Array.from({ length: 11 }, (_, i) => (
            <rect key={`v${i}`} x={48 + i * 30} y="90" width="6" height="238" fill={i % 2 ? "#3d5f7c" : "#c9a352"} opacity="0.75" />
          ))}
        </g>
        <rect x="36" y="336" width="330" height="70" fill="#7b2a30" />
        {[346, 356, 386, 396].map((y) => (
          <rect key={y} x="36" y={y} width="330" height="2" fill="#d8b774" />
        ))}
        <path d={Array.from({ length: 22 }, (_, i) => `M${44 + i * 15} 371 l6 -6 l6 6 l-6 6 Z`).join("")} fill="#d8b774" opacity="0.9" />
        <path d="M70 454 C130 420 250 330 338 300 C344 312 340 320 332 324 C250 358 140 436 80 466 C72 468 66 462 70 454 Z" fill="#6b4a2a" />
        <path d="M150 406 L232 352" stroke="#e8d5b0" strokeWidth="4" strokeLinecap="round" />
      </>
    ),
  },

  storytelling: {
    label: "Illustration: rings of sound spreading from a small lamp across a night courtyard",
    bg: "radial-gradient(90% 70% at 50% 82%, #2b203c 0%, #120f1a 60%, #0c0a10 100%)",
    draw: () => {
      const rand = seeded(hashString("storytelling"));
      return (
        <>
          {Array.from({ length: 40 }, (_, i) => (
            <circle key={i} cx={r2(rand() * 400)} cy={r2(rand() * 220)} r={r2(0.5 + rand() * 1.2)} fill="#f2eadb" opacity={r2(0.2 + rand() * 0.6)} />
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <path key={i} d={`M${200 - (36 + i * 34)} 382 A${36 + i * 34} ${36 + i * 34} 0 0 1 ${200 + 36 + i * 34} 382`} fill="none" stroke="#d8b774" strokeWidth={i === 0 ? 1.6 : 1} opacity={0.75 - i * 0.1} strokeDasharray={i % 2 ? "3 7" : undefined} />
          ))}
          <circle cx="200" cy="366" r="36" fill="#f5c46a" opacity="0.14" />
          <path d="M200 350c6 8 8 12 8 17a8 8 0 0 1-16 0c0-5 2-9 8-17Z" fill="#f6c35b" />
          <path d="M186 376 h28 l-5 10 h-18 Z" fill="#b48d49" />
          {[
            { x: 40, s: 1 },
            { x: 62, s: -1 },
            { x: 344, s: 1 },
            { x: 364, s: -1 },
          ].map(({ x, s }) => (
            <g key={x} stroke="#3c4a2e" fill="none" strokeWidth="2">
              <path d={`M${x} 500 Q${x + s * 6} 440 ${x + s * 26} 402`} />
              <path d={`M${x + 6} 500 Q${x + s * 14} 450 ${x + s * 40} 428`} />
              {Array.from({ length: 6 }, (_, j) => (
                <circle key={j} cx={x + s * (22 + j * 3)} cy={406 + j * 5} r="1.8" fill="#8f8a52" stroke="none" />
              ))}
            </g>
          ))}
          <rect x="0" y="470" width="400" height="30" fill="#0a0810" opacity="0.8" />
        </>
      );
    },
  },

  architecture: {
    label: "Illustration: an ancestral house with a clay-tiled roof, laterite walls and timber pillars",
    bg: "linear-gradient(180deg, #cfa77d 0%, #735040 34%, #251a15 68%, #16100d 100%)",
    draw: (id) => {
      const rand = seeded(hashString("architecture"));
      return (
        <>
          <defs>
            <pattern id={id("tiles")} width="14" height="9" patternUnits="userSpaceOnUse">
              <path d="M0 9 A7 7 0 0 1 14 9" fill="none" stroke="#4a1f13" strokeWidth="1.3" />
            </pattern>
            <pattern id={id("laterite")} width="36" height="18" patternUnits="userSpaceOnUse">
              <rect width="36" height="18" fill="#8c4630" />
              <path d="M0 17.5 H36 M18 0 V9 M0 9 H36 M9 9 V18 M27 9 V18" stroke="#5e2c1d" strokeWidth="1" />
              <circle cx="7" cy="4" r="0.9" fill="#4e2317" />
              <circle cx="25" cy="13" r="0.9" fill="#4e2317" />
            </pattern>
            <radialGradient id={id("lamp")}>
              <stop offset="0" stopColor="#f6c46a" stopOpacity="0.8" />
              <stop offset="1" stopColor="#f6c46a" stopOpacity="0" />
            </radialGradient>
          </defs>
          {Array.from({ length: 7 }, (_, i) => (
            <Palm key={i} x={r2(10 + i * 62 + rand() * 20)} base={250} height={r2(110 + rand() * 60)} lean={r2(rand() * 10 - 5)} color="#241915" width={3} />
          ))}
          <path d="M22 250 L118 150 H282 L378 250 Z" fill="#7d3a25" />
          <path d="M22 250 L118 150 H282 L378 250 Z" fill={`url(#${id("tiles")})`} />
          <path d="M118 150 H282" stroke="#3a180e" strokeWidth="4" />
          <path d="M22 250 H378" stroke="#2a130b" strokeWidth="5" />
          <rect x="56" y="252" width="288" height="150" fill={`url(#${id("laterite")})`} />
          <rect x="56" y="252" width="288" height="150" fill="#000" opacity="0.18" />
          <rect x="176" y="290" width="48" height="112" fill="#1e120c" />
          <circle cx="200" cy="336" r="40" fill={`url(#${id("lamp")})`} />
          <path d="M200 324c4 6 6 9 6 12a6 6 0 0 1-12 0c0-3 2-6 6-12Z" fill="#fbd98a" />
          {[70, 118, 150, 250, 282, 330].map((x) => (
            <g key={x}>
              <rect x={x - 5} y="256" width="10" height="146" fill="#3b2416" />
              <rect x={x - 8} y="252" width="16" height="7" fill="#2a1a10" />
            </g>
          ))}
          <rect x="36" y="400" width="328" height="18" fill="#4f2a1d" />
          <rect x="24" y="416" width="352" height="10" fill="#3a1f15" />
        </>
      );
    },
  },

  areca: {
    label: "Illustration: an areca plantation with pressed sheath plates on the ground",
    bg: "linear-gradient(180deg, #dccb95 0%, #83915a 28%, #34502f 58%, #15241a 100%)",
    draw: () => {
      const rand = seeded(hashString("areca"));
      return (
        <>
          <g fill="#fff8dc" opacity="0.07">
            <path d="M120 0 L180 0 L60 500 L0 500 Z" />
            <path d="M260 0 L300 0 L210 500 L160 500 Z" />
          </g>
          {Array.from({ length: 11 }, (_, i) => {
            const x = r2(18 + i * 36 + rand() * 14);
            const h = r2(300 + rand() * 120);
            const near = i % 3 === 0;
            return <Palm key={i} x={x} base={500} height={h} lean={r2(rand() * 12 - 6)} color={near ? "#1c2a18" : "#2e4228"} width={near ? 5 : 3.4} />;
          })}
          {[
            [110, 452, 30],
            [176, 468, 24],
            [262, 456, 32],
            [320, 476, 20],
          ].map(([x, y, r]) => (
            <g key={`${x}`}>
              <ellipse cx={x} cy={y} rx={r} ry={r * 0.38} fill="#b99558" />
              <ellipse cx={x} cy={y - 1} rx={r * 0.72} ry={r * 0.24} fill="#d2b27a" />
            </g>
          ))}
        </>
      );
    },
  },

  coast: {
    label: "Illustration: a fishing boat on the Arabian Sea at sunset, with coconut palms",
    bg: "linear-gradient(180deg, #e8b87b 0%, #cc7a5b 28%, #5c3a4a 51%, #1f1c2c 52%, #11151f 100%)",
    draw: () => {
      const rand = seeded(hashString("coast"));
      return (
        <>
          <circle cx="226" cy="238" r="32" fill="#f7dba6" />
          {Array.from({ length: 24 }, (_, i) => {
            const y = 266 + i * 9;
            const w = 30 + rand() * 70;
            return <line key={i} x1={r2(226 - w / 2)} y1={y} x2={r2(226 + w / 2)} y2={y} stroke="#f0b980" strokeWidth="1.5" opacity={r2(0.55 - i * 0.02)} />;
          })}
          <path d="M34 330 Q60 352 120 352 H210 Q248 352 262 326 L240 334 Q210 340 120 340 Q72 340 34 330 Z" fill="#090b12" />
          <path d="M150 340 V268" stroke="#090b12" strokeWidth="2.5" />
          <path d="M152 272 L198 330 H152 Z" fill="#0d101a" />
          <path d="M400 500 Q360 360 322 214" stroke="#0b0d14" strokeWidth="7" fill="none" />
          <Palm x={372} base={384} height={172} lean={-44} color="#0b0d14" width={0.1} />
          <path d="M400 500 Q392 420 360 318" stroke="#0b0d14" strokeWidth="5" fill="none" />
        </>
      );
    },
  },

  handicrafts: {
    label: "Illustration: counted cross-stitch, a clay pot and handloom threads side by side",
    bg: "linear-gradient(135deg, #2c1a13 0%, #121010 100%)",
    draw: () => (
      <>
        <path d={crosses(towerCells(), 22, 186, 10, 5)} stroke="#f2eadb" strokeWidth="1.3" opacity="0.9" />
        <path d="M200 336 C164 322 162 262 190 246 L194 236 H206 L210 246 C238 262 236 322 200 336 Z" fill="#b9613f" />
        <ellipse cx="200" cy="236" rx="13" ry="3.5" fill="#5a2a1a" />
        <g stroke="#f2eadb" opacity="0.4">
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1={286 + i * 8} y1="180" x2={286 + i * 8} y2="330" />
          ))}
        </g>
        <rect x="282" y="296" width="100" height="22" fill="#7b2a30" />
        <rect x="282" y="302" width="100" height="2" fill="#d8b774" />
        <line x1="133" y1="160" x2="133" y2="360" stroke="#d8b774" opacity="0.25" />
        <line x1="267" y1="160" x2="267" y2="360" stroke="#d8b774" opacity="0.25" />
      </>
    ),
  },

  sacred: {
    label: "Abstract illustration: sealed rings around a keyhole. Protected practices are not depicted.",
    bg: "radial-gradient(70% 60% at 50% 50%, #15271c 0%, #09100c 72%)",
    draw: () => (
      <>
        {Array.from({ length: 7 }, (_, i) => (
          <circle key={i} cx="200" cy="250" r={50 + i * 28} fill="none" stroke="#5e9c75" strokeWidth={i === 0 ? 1.5 : 0.8} opacity={0.3 - i * 0.035} />
        ))}
        <circle cx="200" cy="236" r="18" fill="#060a08" stroke="#5e9c75" strokeOpacity="0.6" strokeWidth="1.5" />
        <path d="M192 248 L186 286 H214 L208 248 Z" fill="#060a08" stroke="#5e9c75" strokeOpacity="0.6" strokeWidth="1.5" />
      </>
    ),
  },
};

export function plateLabel(motif: Motif) {
  return (SCENES[motif] ?? SCENES.handicrafts).label;
}

export function CulturalPlate({
  motif,
  className,
  children,
  label,
  photo,
  sizes = "(min-width: 1024px) 45vw, 92vw",
}: {
  motif: Motif;
  className?: string;
  children?: ReactNode;
  label?: string;
  /** Overrides the motif's photograph. Pass null to insist on the illustration. */
  photo?: Photo | null;
  sizes?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id: Ids = (name) => `p${uid}${name}`;
  const scene = SCENES[motif] ?? SCENES.handicrafts;
  const shot = photo === null ? undefined : photo ?? MOTIF_PHOTOS[motif];
  return (
    <div role="img" aria-label={label ?? shot?.alt ?? scene.label} className={cn("relative overflow-hidden grain", className)} style={{ background: scene.bg }}>
      <svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
        {scene.draw(id)}
      </svg>
      {/* Some of the photographs carry a thin frame line; the slight scale crops it away. */}
      {shot && (
        <>
          <Image
            src={shot.src}
            alt=""
            fill
            sizes={sizes}
            style={shot.focus ? { objectPosition: shot.focus } : undefined}
            className="scale-[1.02] object-cover"
          />
          {/* Keeps badges and captions legible on pale photographs. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(180deg,rgb(17_13_11/0.5)_0%,transparent_30%,transparent_68%,rgb(17_13_11/0.45)_100%)]"
          />
        </>
      )}
      {children && <div className="relative z-[2] size-full">{children}</div>}
    </div>
  );
}
