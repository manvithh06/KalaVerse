"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

export function Checkbox({
  className,
  tone = "dark",
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root> & { tone?: "light" | "dark" }) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer grid size-6 shrink-0 place-items-center rounded-[3px] border transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-45",
        tone === "dark"
          ? "border-ivory/35 text-night data-[state=checked]:border-gold-light data-[state=checked]:bg-gold-light"
          : "border-ink/30 text-paper data-[state=checked]:border-ink data-[state=checked]:bg-ink",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator>
        <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
          <path
            d="M3.2 8.6 6.4 11.6 12.8 4.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="animate-[check-draw_300ms_var(--ease-kalaverse)_both] [stroke-dasharray:16]"
          />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
