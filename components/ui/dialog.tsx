"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

type Tone = "dark" | "light" | "vault";

const TONE: Record<Tone, string> = {
  dark: "border-ivory/10 bg-night-2 text-ivory",
  light: "border-ink/10 bg-paper text-ink",
  vault: "border-open/15 bg-vault-2 text-ivory",
};

export function DialogContent({
  className,
  children,
  tone = "dark",
  hideClose = false,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & { tone?: Tone; hideClose?: boolean }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-night/75 backdrop-blur-[2px] data-[state=closed]:animate-[fade-out_160ms_ease-in] data-[state=open]:animate-[fade-in_220ms_ease-out]" />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[6px] border p-6 shadow-[0_40px_120px_-20px_rgb(0_0_0/0.6)] outline-none sm:p-8",
          "data-[state=closed]:animate-[sink-out_180ms_ease-in] data-[state=open]:animate-[rise-in_340ms_var(--ease-kalaverse)]",
          TONE[tone],
          className,
        )}
        {...props}
      >
        {children}
        {!hideClose && (
          <DialogPrimitive.Close
            aria-label="Close"
            className={cn(
              "absolute right-3 top-3 grid size-10 place-items-center rounded-full transition-colors",
              tone === "light" ? "text-ink-soft hover:bg-ink/[0.06] hover:text-ink" : "text-ivory-dim hover:bg-ivory/[0.08] hover:text-ivory",
            )}
          >
            <X className="size-4" />
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("t-title pr-8", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn("mt-3 text-[0.95rem] leading-relaxed opacity-75", className)} {...props} />;
}
