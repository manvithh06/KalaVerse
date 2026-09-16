"use client";

import { useState } from "react";
import Link from "next/link";
import type { Experience } from "@/types";
import { useKalaverse } from "@/store/kalaverse";
import { useUI } from "@/store/ui";
import { ACCESS_META } from "@/lib/consent";
import { AccessGlyph, ACCESS_TEXT } from "@/components/consent/access-badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export function hasPublicDetails(experience: Experience) {
  return Boolean(experience.description.trim()) && experience.price > 0 && experience.languages.length > 0 && experience.schedule.days.length > 0;
}

/** Leaving protection needs the custodian and the community together. Nobody else can do it. */
export function ReleaseDialog({
  experience,
  open,
  onOpenChange,
}: {
  experience: Experience | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const setAccessLevel = useKalaverse((s) => s.setAccessLevel);
  const toast = useUI((s) => s.toast);
  const [level, setLevel] = useState<"guided" | "open">("guided");
  const [community, setCommunity] = useState(false);
  const [understood, setUnderstood] = useState(false);

  if (!experience) return null;
  const ready = community && understood;
  const complete = hasPublicDetails(experience);

  const close = (o: boolean) => {
    onOpenChange(o);
    if (!o) {
      setCommunity(false);
      setUnderstood(false);
      setLevel("guided");
    }
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent tone="vault" className="max-w-lg">
        <DialogTitle>Release from protection?</DialogTitle>
        <DialogDescription>
          &ldquo;{experience.title}&rdquo; would leave your Protected Vault and appear in public discovery.
        </DialogDescription>

        {!complete ? (
          <div className="mt-6 rounded-[4px] border border-guided/40 bg-guided/[0.08] p-4">
            <p className="text-[0.95rem] text-ivory">This practice has no public description, price or schedule yet.</p>
            <p className="mt-1 text-[0.88rem] text-ivory-dim">Add them first. It stays protected while you do.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button asChild variant="ivory" size="sm">
                <Link href={`/custodian/experiences/${experience.id}/edit`} onClick={() => close(false)}>
                  Add public details
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => close(false)}>
                Keep protected
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div role="radiogroup" aria-label="Release as" className="mt-6 grid grid-cols-2 gap-3">
              {(["guided", "open"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  role="radio"
                  aria-checked={level === l}
                  onClick={() => setLevel(l)}
                  className={cn(
                    "rounded-[4px] border p-4 text-left transition-colors",
                    level === l ? (l === "guided" ? "border-guided bg-guided/10" : "border-open bg-open/10") : "border-ivory/15 hover:border-ivory/35",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <AccessGlyph level={l} />
                    <span className={cn("t-caps", ACCESS_TEXT[l])}>{ACCESS_META[l].label}</span>
                  </span>
                  <span className="mt-2 block text-[0.84rem] text-ivory-dim">{ACCESS_META[l].hint}</span>
                </button>
              ))}
            </div>
            <div className="mt-5 space-y-3">
              <label className="flex cursor-pointer items-start gap-3 text-[0.95rem]">
                <Checkbox checked={community} onCheckedChange={(v) => setCommunity(v === true)} className="mt-0.5" />
                The community has agreed to share this practice publicly.
              </label>
              <label className="flex cursor-pointer items-start gap-3 text-[0.95rem]">
                <Checkbox checked={understood} onCheckedChange={(v) => setUnderstood(v === true)} className="mt-0.5" />
                I understand it will be discoverable and bookable. Photography, video, recording and AI stay off until I turn them on.
              </label>
            </div>
            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={() => close(false)}>
                Keep protected
              </Button>
              <Button
                variant={level === "guided" ? "guided" : "open"}
                caps
                disabled={!ready}
                onClick={() => {
                  setAccessLevel(experience.id, level);
                  toast({ title: `Released as ${ACCESS_META[level].label.toLowerCase()}`, body: "It now appears in public discovery.", tone: level });
                  close(false);
                }}
              >
                Release as {ACCESS_META[level].label}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
