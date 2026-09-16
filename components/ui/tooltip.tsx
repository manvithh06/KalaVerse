"use client";

import * as React from "react";
import { Tooltip as TooltipPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

export function Tooltip({
  content,
  children,
  side = "top",
  className,
}: {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          sideOffset={8}
          collisionPadding={12}
          className={cn(
            "z-[60] max-w-64 rounded-[3px] bg-ivory px-3 py-2 text-[0.8125rem] leading-snug text-night shadow-[0_12px_40px_-8px_rgb(0_0_0/0.5)]",
            "data-[state=closed]:animate-[fade-out_100ms_ease-in] data-[state=delayed-open]:animate-[rise-in_180ms_var(--ease-kalaverse)] data-[state=instant-open]:animate-[fade-in_120ms_ease-out]",
            className,
          )}
        >
          {content}
          <TooltipPrimitive.Arrow className="fill-ivory" width={10} height={5} />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
