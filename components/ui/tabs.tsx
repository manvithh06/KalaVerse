"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({
  className,
  tone = "dark",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & { tone?: "dark" | "light" }) {
  return (
    <TabsPrimitive.List
      className={cn(
        "scrollbar-none -mx-1 flex gap-1 overflow-x-auto border-b px-1",
        tone === "dark" ? "border-ivory/10" : "border-ink/10",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTrigger({
  className,
  tone = "dark",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> & { tone?: "dark" | "light" }) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "relative -mb-px h-12 shrink-0 border-b-2 border-transparent px-4 text-[0.9rem] font-medium transition-colors",
        tone === "dark"
          ? "text-ash hover:text-ivory data-[state=active]:border-gold-light data-[state=active]:text-ivory"
          : "text-ink-faint hover:text-ink data-[state=active]:border-ink data-[state=active]:text-ink",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      className={cn("outline-none data-[state=active]:animate-[fade-in_260ms_ease-out]", className)}
      {...props}
    />
  );
}
