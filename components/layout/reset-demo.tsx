"use client";

import { useState } from "react";
import { RotateCcw } from "lucide-react";
import { useKalaverse } from "@/store/kalaverse";
import { useUI } from "@/store/ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function ResetDemoButton({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const [open, setOpen] = useState(false);
  const resetDemo = useKalaverse((s) => s.resetDemo);
  const toast = useUI((s) => s.toast);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-[3px] px-3 text-[0.8125rem] transition-colors",
            tone === "dark" ? "text-ash hover:bg-ivory/[0.06] hover:text-ivory" : "text-ink-faint hover:bg-ink/[0.05] hover:text-ink",
            className,
          )}
        >
          <RotateCcw className="size-3.5" aria-hidden />
          Reset demo data
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Reset the demo?</DialogTitle>
        <DialogDescription>
          Bookings, new experiences, consent changes, AI decisions and profile edits return to their starting state. Use this before
          presenting the demo again.
        </DialogDescription>
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Keep my changes
          </Button>
          <Button
            variant="ivory"
            onClick={() => {
              resetDemo();
              setOpen(false);
              toast({ title: "Demo reset", body: "Everything is back to its starting state." });
            }}
          >
            Reset demo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
