"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { EyeOff, Lock } from "lucide-react";
import type { AccessLevel, Experience } from "@/types";
import { useKalaverse } from "@/store/kalaverse";
import { useMyExperiences } from "@/store/hooks";
import { useUI } from "@/store/ui";
import { ACCESS_LEVELS, ACCESS_META } from "@/lib/consent";
import { CulturalPlate } from "@/components/cultural/plates";
import { AccessGlyph, ACCESS_TEXT } from "@/components/consent/access-badge";
import { toConsentCore } from "@/components/consent/consent-fields";
import { Switch } from "@/components/ui/switch";
import { ReleaseDialog } from "./release-dialog";
import { WorkspaceBody, WorkspaceHeader } from "./workspace";
import { cn } from "@/lib/utils";

const PILL_ON: Record<AccessLevel, string> = {
  open: "bg-open text-night",
  guided: "bg-guided text-night",
  protected: "bg-protected text-ivory",
};

const LANE_TOP: Record<AccessLevel, string> = {
  open: "border-t-open",
  guided: "border-t-guided",
  protected: "border-t-protected",
};

function Item({ experience, preview, onMove }: { experience: Experience; preview: boolean; onMove: (level: AccessLevel) => void }) {
  const level = experience.consent.accessLevel;
  if (preview && level === "protected") {
    return (
      <div className="flex items-center gap-3 rounded-[4px] border border-dashed border-protected/30 p-4 text-[0.88rem] text-ink-faint">
        <EyeOff className="size-4 shrink-0" aria-hidden />
        Visitors see nothing here.
      </div>
    );
  }
  return (
    <div className="rounded-[4px] border border-ink/10 bg-limewash/50 p-4">
      <div className="flex gap-3">
        <CulturalPlate motif={experience.motif} className="size-14 shrink-0" />
        <div className="min-w-0">
          <p className="font-medium leading-snug">{experience.title}</p>
          <p className="mt-1 text-[0.82rem] text-ink-faint">
            {level === "protected" ? "Kept within the community" : `${experience.bookingsCount} bookings, terms version ${experience.consent.termsVersion}`}
          </p>
        </div>
      </div>
      {preview ? (
        <p className="mt-3 text-[0.84rem] text-ink-soft">
          {level === "guided" ? "Listed, with your rules shown before booking." : "Listed openly, with your terms attached."}
        </p>
      ) : (
        <div role="group" aria-label={`Access level for ${experience.title}`} className="mt-4 grid grid-cols-3 gap-1 rounded-full border border-ink/10 bg-paper p-1">
          {ACCESS_LEVELS.map((l) => {
            const on = l === level;
            return (
              <button
                key={l}
                type="button"
                aria-pressed={on}
                title={ACCESS_META[l].hint}
                onClick={() => !on && onMove(l)}
                className={cn(
                  "inline-flex h-9 items-center justify-center gap-1 rounded-full font-sans text-[0.62rem] font-semibold uppercase tracking-[0.12em] transition-colors [font-stretch:88%]",
                  on ? PILL_ON[l] : "text-ink-soft hover:bg-ink/[0.06] hover:text-ink",
                )}
              >
                {l === "protected" && <Lock className="size-3" aria-hidden />}
                {ACCESS_META[l].label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CultureMap() {
  const mine = useMyExperiences();
  const setAccessLevel = useKalaverse((s) => s.setAccessLevel);
  const updateConsent = useKalaverse((s) => s.updateConsent);
  const toast = useUI((s) => s.toast);
  const [preview, setPreview] = useState(false);
  const [releasing, setReleasing] = useState<Experience | null>(null);

  const published = mine.filter((e) => e.status === "published");
  const drafts = mine.filter((e) => e.status === "draft");

  const move = (experience: Experience, level: AccessLevel) => {
    if (experience.consent.accessLevel === "protected") {
      setReleasing(experience);
      return;
    }
    const previous = toConsentCore(experience.consent);
    setAccessLevel(experience.id, level);
    if (level === "protected") {
      toast({
        title: "Moved into protection",
        body: `${experience.title} left public discovery, booking and AI.`,
        tone: "protected",
        action: { label: "Undo", onClick: () => updateConsent(experience.id, previous) },
      });
    } else {
      toast({ title: `Now ${ACCESS_META[level].label.toLowerCase()}`, body: `${ACCESS_META[level].hint}.`, tone: level });
    }
  };

  return (
    <div>
      <WorkspaceHeader
        title="My culture"
        lead="Decide, practice by practice, what the world gets to see. Changes apply to visitor discovery immediately."
        actions={
          <label className="flex h-11 cursor-pointer items-center gap-3 rounded-full border border-ink/15 bg-paper pl-4 pr-2 text-[0.92rem]">
            Preview as a visitor
            <Switch checked={preview} onCheckedChange={setPreview} />
          </label>
        }
      />
      <WorkspaceBody className="space-y-10">
        <LayoutGroup>
          <div className="grid gap-4 lg:grid-cols-3">
            {ACCESS_LEVELS.map((level) => {
              const items = published.filter((e) => e.consent.accessLevel === level);
              return (
                <section
                  key={level}
                  aria-labelledby={`lane-${level}`}
                  className={cn(
                    "flex min-h-[380px] flex-col border border-t-[3px] bg-paper",
                    LANE_TOP[level],
                    level === "protected" ? "border-x-protected/25 border-b-protected/25" : "border-x-ink/10 border-b-ink/10",
                    preview && level === "protected" && "bg-vault/[0.04]",
                  )}
                >
                  <header className="border-b border-ink/10 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h2 id={`lane-${level}`} className="flex items-center gap-2">
                        <AccessGlyph level={level} className="size-4" />
                        <span className={cn("t-caps", ACCESS_TEXT[level])}>{ACCESS_META[level].label}</span>
                      </h2>
                      <span className="text-[1.4rem] font-semibold leading-none">{items.length}</span>
                    </div>
                    <p className="mt-2 text-[0.86rem] text-ink-soft">{ACCESS_META[level].imperative}</p>
                  </header>
                  <ul className="flex-1 space-y-3 p-4">
                    <AnimatePresence initial={false}>
                      {items.map((e) => (
                        <motion.li
                          key={e.id}
                          layoutId={`culture-${e.id}`}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ type: "spring", stiffness: 360, damping: 34 }}
                        >
                          <Item experience={e} preview={preview} onMove={(l) => move(e, l)} />
                        </motion.li>
                      ))}
                    </AnimatePresence>
                    {items.length === 0 && <li className="py-10 text-center text-[0.9rem] text-ink-faint">Nothing here.</li>}
                  </ul>
                </section>
              );
            })}
          </div>
        </LayoutGroup>

        <section aria-labelledby="culture-drafts" className="border border-dashed border-ink/20 p-5 sm:p-6">
          <h2 id="culture-drafts" className="text-[0.95rem] font-medium">
            Drafts, visible only to you ({drafts.length})
          </h2>
          {drafts.length ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {drafts.map((d) => (
                <li key={d.id}>
                  <Link href={`/custodian/experiences/${d.id}/edit`} className="inline-flex h-10 items-center rounded-full border border-ink/15 bg-paper px-4 text-[0.9rem] hover:border-ink/40">
                    {d.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[0.92rem] text-ink-soft">No drafts right now.</p>
          )}
        </section>
      </WorkspaceBody>

      <ReleaseDialog experience={releasing} open={Boolean(releasing)} onOpenChange={(o) => !o && setReleasing(null)} />
    </div>
  );
}
