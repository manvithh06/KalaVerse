import { cn } from "@/lib/utils";

/**
 * Ornaments drawn from the region's material culture:
 * the lotus rosette of temple wood carving, the mirror-studded rings of a
 * Yakshagana crown, Kasuti counted-thread motifs and the brass lamp.
 * They are geometry only. None of them depicts a ritual or a sacred object in use.
 */

/** The brand mark: a threshold with a lamp inside it. Entry is granted, not assumed. */
export function KalaverseMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden fill="none">
      <path d="M6 29V14a10 10 0 0 1 20 0v15" stroke="currentColor" strokeWidth="1.6" />
      <path d="M11 29V15.5a5 5 0 0 1 10 0V29" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
      <path d="M16 18.2c1.4 1.5 1.9 2.6 1.9 3.5a1.9 1.9 0 1 1-3.8 0c0-.9.5-2 1.9-3.5Z" fill="var(--color-gold-light)" />
      <path d="M3 29h26" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/** Eight-petal rosette, as carved on temple ceilings and doorframes. */
export function LotusSeal({ className, petals = 8 }: { className?: string; petals?: number }) {
  const items = Array.from({ length: petals }, (_, i) => (360 / petals) * i);
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden fill="none" stroke="currentColor">
      <circle cx="50" cy="50" r="46" strokeWidth="1" opacity="0.5" />
      <circle cx="50" cy="50" r="41" strokeWidth="0.6" strokeDasharray="1.5 3" opacity="0.6" />
      {items.map((a) => (
        <path
          key={a}
          d="M50 50 C 44 40, 44 24, 50 14 C 56 24, 56 40, 50 50 Z"
          strokeWidth="1"
          transform={`rotate(${a} 50 50)`}
        />
      ))}
      {items.map((a) => (
        <path
          key={`i${a}`}
          d="M50 50 C 47 44, 47 36, 50 30 C 53 36, 53 44, 50 50 Z"
          strokeWidth="0.8"
          opacity="0.6"
          transform={`rotate(${a + 360 / petals / 2} 50 50)`}
        />
      ))}
      <circle cx="50" cy="50" r="5" strokeWidth="1" />
      <circle cx="50" cy="50" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Concentric crown rings with mirror studs, after the halo of a Yakshagana crown. */
export function KireetaRings({
  className,
  rings = 4,
  studs = 36,
  spin = false,
}: {
  className?: string;
  rings?: number;
  studs?: number;
  spin?: boolean;
}) {
  const studItems = Array.from({ length: studs }, (_, i) => (360 / studs) * i);
  const spokes = Array.from({ length: studs * 2 }, (_, i) => (360 / (studs * 2)) * i);
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden fill="none" stroke="currentColor">
      <g className={spin ? "origin-center animate-spin-slow [transform-box:fill-box]" : undefined}>
        {Array.from({ length: rings }, (_, i) => (
          <circle key={i} cx="100" cy="100" r={96 - i * 14} strokeWidth={i === 0 ? 1.2 : 0.7} opacity={1 - i * 0.16} />
        ))}
        {studItems.map((a) => (
          <circle key={a} cx="100" cy="11" r="2.2" fill="currentColor" stroke="none" transform={`rotate(${a} 100 100)`} opacity="0.85" />
        ))}
        {spokes.map((a) => (
          <line key={a} x1="100" y1="30" x2="100" y2="44" strokeWidth="0.6" opacity="0.45" transform={`rotate(${a} 100 100)`} />
        ))}
      </g>
    </svg>
  );
}

/** A Kasuti-style temple tower built from counted cross-stitches. */
export function KasutiTower({ className }: { className?: string }) {
  const rows = [
    [5],
    [4, 5, 6],
    [4, 6],
    [3, 4, 5, 6, 7],
    [3, 7],
    [2, 3, 4, 5, 6, 7, 8],
    [2, 5, 8],
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 4, 6, 9],
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  ];
  return (
    <svg viewBox="0 0 110 100" className={className} aria-hidden stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
      {rows.flatMap((cols, r) =>
        cols.map((c) => {
          const x = c * 10 + 3;
          const y = r * 10 + 3;
          return (
            <g key={`${r}-${c}`}>
              <line x1={x} y1={y} x2={x + 4} y2={y + 4} />
              <line x1={x + 4} y1={y} x2={x} y2={y + 4} />
            </g>
          );
        }),
      )}
    </svg>
  );
}

/** Brass lamp with a live flame. */
export function BrassLamp({ className, lit = true }: { className?: string; lit?: boolean }) {
  return (
    <svg viewBox="0 0 60 120" className={className} aria-hidden>
      <defs>
        <linearGradient id="brass-body" x1="0" x2="1">
          <stop offset="0" stopColor="#6b5129" />
          <stop offset="0.45" stopColor="#d8b774" />
          <stop offset="1" stopColor="#5b4322" />
        </linearGradient>
        <radialGradient id="brass-flame" cx="0.5" cy="0.75" r="0.6">
          <stop offset="0" stopColor="#fff6d8" />
          <stop offset="0.45" stopColor="#f6c35b" />
          <stop offset="1" stopColor="#d9722b" stopOpacity="0" />
        </radialGradient>
      </defs>
      {lit && <circle cx="30" cy="22" r="22" fill="#f0a74a" opacity="0.18" className="animate-breathe" />}
      {lit && (
        <path
          d="M30 6c5 7 7 11 7 15a7 7 0 0 1-14 0c0-4 2-8 7-15Z"
          fill="url(#brass-flame)"
          className="origin-[30px_28px] animate-flame"
        />
      )}
      <path d="M12 32h36c0 6-8 10-18 10s-18-4-18-10Z" fill="url(#brass-body)" />
      <rect x="27" y="42" width="6" height="52" fill="url(#brass-body)" />
      <ellipse cx="30" cy="60" rx="7" ry="3" fill="url(#brass-body)" />
      <ellipse cx="30" cy="78" rx="9" ry="3.5" fill="url(#brass-body)" />
      <path d="M14 112c0-10 7-18 16-18s16 8 16 18Z" fill="url(#brass-body)" />
      <rect x="10" y="111" width="40" height="4" rx="1" fill="#4b3719" />
    </svg>
  );
}

/** Horizontal rules drawn from roof tiles and counted thread. */
export function Rule({ kind = "tile", className }: { kind?: "tile" | "kasuti" | "hair"; className?: string }) {
  if (kind === "hair") return <div aria-hidden className={cn("h-px w-full bg-current opacity-15", className)} />;
  return <div aria-hidden className={cn("w-full", kind === "tile" ? "tile-rule" : "kasuti-rule", className)} />;
}
