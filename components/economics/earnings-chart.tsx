"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { EarningsPoint } from "@/lib/stats";
import { cn, formatINR } from "@/lib/utils";

/**
 * Monthly custodian earnings. One series, so one hue and no legend: past months use a
 * lighter step of the forest ramp and the current month the full step (emphasis, not a
 * second series). Every value is also in the table view below the chart.
 */
const TONE = {
  light: { past: "#6f8e7a", current: "#1f3a2e", grid: "rgb(28 22 19 / 0.1)", axis: "#8c8074", label: "#1c1613" },
  dark: { past: "#527060", current: "#8fc1a0", grid: "rgb(242 234 219 / 0.1)", axis: "#978b7b", label: "#f2eadb" },
};

function niceScale(maxValue: number) {
  const steps = [2500, 5000, 10000, 20000, 25000, 50000, 100000];
  for (const step of steps) {
    const top = Math.ceil((maxValue * 1.12) / step) * step;
    const count = top / step;
    if (count >= 3 && count <= 5) return { top, step };
  }
  const step = 100000;
  return { top: Math.ceil((maxValue * 1.12) / step) * step, step };
}

const compact = (v: number) => (v >= 1000 ? `₹${Math.round(v / 1000)}k` : `₹${v}`);

export function EarningsChart({
  points,
  tone = "light",
  height = 280,
  title = "Custodian earnings by month",
  className,
}: {
  points: EarningsPoint[];
  tone?: "light" | "dark";
  height?: number;
  title?: string;
  className?: string;
}) {
  const [active, setActive] = useState<number | null>(null);
  // Draw at the container's real pixel width so axis and label text keep their true size on phones.
  const [W, setW] = useState(640);
  const frameRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const colors = TONE[tone];
  const dark = tone === "dark";

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      if (width > 0) setW(Math.max(280, Math.min(960, width)));
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const H = height;
  const narrow = W < 440;
  const pad = { top: 30, right: 8, bottom: 34, left: narrow ? 42 : 52 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;
  const { top, step } = niceScale(Math.max(1, ...points.map((p) => p.net)));
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  const slot = plotW / points.length;
  const barW = Math.min(24, slot * 0.46);
  const y = (v: number) => pad.top + plotH - (v / top) * plotH;

  const activePoint = active !== null ? points[active] : null;

  return (
    <figure className={className}>
      <figcaption className={cn("flex flex-wrap items-baseline justify-between gap-2", dark ? "text-ivory" : "text-ink")}>
        <span id={`${id}-title`} className="text-[0.95rem] font-medium">
          {title}
        </span>
        <span className={cn("text-[0.8rem]", dark ? "text-ash" : "text-ink-faint")}>Last {points.length} months</span>
      </figcaption>

      <div ref={frameRef} className="relative mt-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible" role="group" aria-labelledby={`${id}-title`}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} stroke={colors.grid} strokeWidth="1" />
              <text x={pad.left - 10} y={y(t)} dy="0.32em" textAnchor="end" fontSize="11" fill={colors.axis} style={{ fontVariantNumeric: "tabular-nums" }}>
                {compact(t)}
              </text>
            </g>
          ))}

          {points.map((p, i) => {
            const cx = pad.left + slot * i + slot / 2;
            const x = cx - barW / 2;
            const barTop = y(p.net);
            const h = Math.max(0, pad.top + plotH - barTop);
            const r = Math.min(4, h);
            const fill = p.current ? colors.current : colors.past;
            const dimmed = active !== null && active !== i;
            const labelAtEdge = p.current && cx + 32 > W;
            return (
              <g key={p.label}>
                {h > 0 && (
                  <path
                    d={`M${x} ${barTop + r} a${r} ${r} 0 0 1 ${r} ${-r} h${barW - 2 * r} a${r} ${r} 0 0 1 ${r} ${r} v${h - r} h${-barW} Z`}
                    fill={fill}
                    opacity={dimmed ? 0.55 : 1}
                    style={{ transition: "opacity 160ms ease" }}
                  />
                )}
                {p.current && (
                  <text
                    x={labelAtEdge ? W - 2 : cx}
                    y={barTop - 10}
                    textAnchor={labelAtEdge ? "end" : "middle"}
                    fontSize="12.5"
                    fontWeight="600"
                    fill={colors.label}
                  >
                    {formatINR(p.net)}
                  </text>
                )}
                <text x={cx} y={H - 10} textAnchor="middle" fontSize="12" fill={p.current ? colors.label : colors.axis} fontWeight={p.current ? 600 : 400}>
                  {p.label}
                </text>
                <rect
                  x={pad.left + slot * i}
                  y={pad.top}
                  width={slot}
                  height={plotH}
                  fill="transparent"
                  tabIndex={0}
                  role="img"
                  aria-label={`${p.label}: ${formatINR(p.net)} earned, ${p.bookings} bookings, ${p.productSales} craft sales`}
                  onPointerEnter={() => setActive(i)}
                  onPointerLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  className="cursor-default outline-none"
                />
              </g>
            );
          })}
          <line x1={pad.left} x2={W - pad.right} y1={pad.top + plotH} y2={pad.top + plotH} stroke={colors.axis} strokeOpacity="0.5" strokeWidth="1" />
        </svg>

        {activePoint && active !== null && (
          <div
            role="presentation"
            className={cn(
              "pointer-events-none absolute z-10 w-44 -translate-x-1/2 -translate-y-full rounded-[4px] border px-3 py-2.5 shadow-lg",
              dark ? "border-ivory/10 bg-night-3 text-ivory" : "border-ink/10 bg-paper text-ink",
            )}
            style={{
              left: `${Math.min(Math.max(((pad.left + slot * active + slot / 2) / W) * 100, 16), 84)}%`,
              top: `${(Math.max(pad.top, y(activePoint.net) - 12) / H) * 100}%`,
            }}
          >
            <p className="text-[1.05rem] font-semibold leading-tight">{formatINR(activePoint.net)}</p>
            <p className={cn("text-[0.75rem]", dark ? "text-ash" : "text-ink-faint")}>{activePoint.label}, custodian earnings</p>
            <div className={cn("mt-2 space-y-0.5 border-t pt-2 text-[0.78rem]", dark ? "border-ivory/10" : "border-ink/10")}>
              <p className="flex justify-between">
                <span className={dark ? "text-ash" : "text-ink-faint"}>Bookings</span>
                <span className="font-medium">{activePoint.bookings}</span>
              </p>
              <p className="flex justify-between">
                <span className={dark ? "text-ash" : "text-ink-faint"}>Craft sales</span>
                <span className="font-medium">{activePoint.productSales}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      <details className="group mt-4">
        <summary className={cn("inline-flex min-h-10 cursor-pointer items-center text-[0.85rem] underline underline-offset-4", dark ? "text-ivory-dim hover:text-ivory" : "text-ink-soft hover:text-ink")}>
          View as table
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className={cn("w-full min-w-[420px] text-left text-[0.88rem]", dark ? "text-ivory" : "text-ink")}>
            <caption className="sr-only">{title}</caption>
            <thead>
              <tr className={dark ? "text-ash" : "text-ink-faint"}>
                <th scope="col" className="py-2 pr-4 font-medium">
                  Month
                </th>
                <th scope="col" className="py-2 pr-4 text-right font-medium">
                  Earnings
                </th>
                <th scope="col" className="py-2 pr-4 text-right font-medium">
                  Bookings
                </th>
                <th scope="col" className="py-2 text-right font-medium">
                  Craft sales
                </th>
              </tr>
            </thead>
            <tbody style={{ fontVariantNumeric: "tabular-nums" }}>
              {points.map((p) => (
                <tr key={p.label} className={cn("border-t", dark ? "border-ivory/[0.08]" : "border-ink/[0.08]")}>
                  <th scope="row" className="py-2 pr-4 font-normal">
                    {p.label}
                    {p.current ? " (this month)" : ""}
                  </th>
                  <td className="py-2 pr-4 text-right">{formatINR(p.net)}</td>
                  <td className="py-2 pr-4 text-right">{p.bookings}</td>
                  <td className="py-2 text-right">{p.productSales}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
