"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

export function Switch({
  className,
  tone = "light",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & { tone?: "light" | "dark" }) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-45",
        tone === "light"
          ? "border-ink/15 data-[state=checked]:border-forest-2 data-[state=checked]:bg-forest-2 data-[state=unchecked]:bg-ink/[0.08]"
          : "border-ivory/15 data-[state=checked]:border-open/70 data-[state=checked]:bg-open/70 data-[state=unchecked]:bg-ivory/[0.07]",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          "pointer-events-none block size-5 rounded-full shadow-sm transition-transform duration-300 ease-[var(--ease-kalaverse)] data-[state=checked]:translate-x-[23px] data-[state=unchecked]:translate-x-[3px]",
          tone === "light" ? "bg-paper" : "bg-ivory",
        )}
      />
    </SwitchPrimitive.Root>
  );
}
