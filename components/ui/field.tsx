import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "light" | "dark";

const CONTROL: Record<Tone, string> = {
  light:
    "border-ink/15 bg-paper text-ink placeholder:text-ink-faint hover:border-ink/30 focus:border-ink/60 aria-[invalid=true]:border-protected",
  dark:
    "border-ivory/15 bg-night-3/60 text-ivory placeholder:text-ash hover:border-ivory/30 focus:border-ivory/60 aria-[invalid=true]:border-protected",
};

const controlBase =
  "w-full rounded-[3px] border px-3.5 text-[0.95rem] transition-colors outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-50";

export function Field({
  id,
  label,
  hint,
  error,
  optional,
  tone = "light",
  className,
  children,
}: {
  id: string;
  label: React.ReactNode;
  hint?: React.ReactNode;
  error?: string;
  optional?: boolean;
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("grid content-start gap-2", className)}>
      <label htmlFor={id} className={cn("text-[0.875rem] font-medium", tone === "light" ? "text-ink" : "text-ivory")}>
        {label}
        {optional && <span className={tone === "light" ? "font-normal text-ink-faint" : "font-normal text-ash"}> (optional)</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-[0.8125rem] text-protected">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className={cn("text-[0.8125rem] leading-snug", tone === "light" ? "text-ink-faint" : "text-ash")}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Input({ className, tone = "light", ...props }: React.ComponentProps<"input"> & { tone?: Tone }) {
  return <input className={cn(controlBase, "h-12", CONTROL[tone], className)} {...props} />;
}

export function Textarea({ className, tone = "light", ...props }: React.ComponentProps<"textarea"> & { tone?: Tone }) {
  return <textarea className={cn(controlBase, "min-h-28 py-3 leading-relaxed", CONTROL[tone], className)} {...props} />;
}

export function Select({
  className,
  tone = "light",
  children,
  ...props
}: React.ComponentProps<"select"> & { tone?: Tone }) {
  return (
    <div className="relative">
      <select className={cn(controlBase, "h-12 appearance-none pr-10", CONTROL[tone], className)} {...props}>
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className={cn("pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2", tone === "light" ? "text-ink-soft" : "text-ash")}
      />
    </div>
  );
}

/** Toggleable chip for multi-select sets (languages, days). */
export function Chip({
  selected,
  tone = "light",
  className,
  ...props
}: React.ComponentProps<"button"> & { selected: boolean; tone?: Tone }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-full border px-4 text-[0.875rem] transition-colors",
        tone === "light"
          ? selected
            ? "border-ink bg-ink text-paper"
            : "border-ink/15 text-ink-soft hover:border-ink/40 hover:text-ink"
          : selected
            ? "border-ivory bg-ivory text-night"
            : "border-ivory/15 text-ivory-dim hover:border-ivory/40 hover:text-ivory",
        className,
      )}
      {...props}
    />
  );
}
