"use client";

import * as React from "react";
import { Dialog as SheetPrimitive } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Sheet = SheetPrimitive.Root;
export const SheetTrigger = SheetPrimitive.Trigger;
export const SheetClose = SheetPrimitive.Close;
export const SheetTitle = SheetPrimitive.Title;
export const SheetDescription = SheetPrimitive.Description;

const SIDE = {
  right:
    "inset-y-0 right-0 h-full w-[min(88vw,380px)] border-l data-[state=closed]:animate-[slide-out-right_220ms_ease-in] data-[state=open]:animate-[slide-in-right_380ms_var(--ease-kalaverse)]",
  left:
    "inset-y-0 left-0 h-full w-[min(88vw,340px)] border-r data-[state=closed]:animate-[slide-out-left_220ms_ease-in] data-[state=open]:animate-[slide-in-left_380ms_var(--ease-kalaverse)]",
  bottom:
    "inset-x-0 bottom-0 max-h-[88dvh] rounded-t-[10px] border-t data-[state=closed]:animate-[slide-out-bottom_220ms_ease-in] data-[state=open]:animate-[slide-in-bottom_380ms_var(--ease-kalaverse)]",
};

export function SheetContent({
  side = "right",
  className,
  children,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & { side?: keyof typeof SIDE }) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay className="fixed inset-0 z-50 bg-night/70 data-[state=closed]:animate-[fade-out_200ms_ease-in] data-[state=open]:animate-[fade-in_240ms_ease-out]" />
      <SheetPrimitive.Content
        className={cn(
          "fixed z-50 flex flex-col overflow-y-auto border-ivory/10 bg-night-2 text-ivory shadow-2xl outline-none",
          SIDE[side],
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close
          aria-label="Close menu"
          className="absolute right-3 top-3 grid size-11 place-items-center rounded-full text-ivory-dim transition-colors hover:bg-ivory/[0.08] hover:text-ivory"
        >
          <X className="size-5" />
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
}
