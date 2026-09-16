"use client";

import { useMemo, useState } from "react";
import { Lock, RotateCcw, Save } from "lucide-react";
import type { ConsentSettings, Experience } from "@/types";
import { useKalaverse } from "@/store/kalaverse";
import { useCurrentCustodian, useMyExperiences } from "@/store/hooks";
import { useUI } from "@/store/ui";
import type { ConsentCore } from "@/lib/consent";
import { AccessBadge } from "@/components/consent/access-badge";
import { ConsentCard } from "@/components/consent/consent-card";
import { ConsentFields, toConsentCore } from "@/components/consent/consent-fields";
import { EmptyState } from "@/components/cultural/states";
import { Button } from "@/components/ui/button";
import { hasPublicDetails, ReleaseDialog } from "./release-dialog";
import { WorkspaceBody, WorkspaceHeader } from "./workspace";
import { cn } from "@/lib/utils";

function ConsentEditor({ experience }: { experience: Experience }) {
  const custodian = useCurrentCustodian();
  const updateConsent = useKalaverse((s) => s.updateConsent);
  const toast = useUI((s) => s.toast);
  const saved = useMemo(() => toConsentCore(experience.consent), [experience.consent]);
  const [draft, setDraft] = useState<ConsentCore>(saved);
  const [releaseOpen, setReleaseOpen] = useState(false);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const wasProtected = experience.consent.accessLevel === "protected";
  const leavingProtection = wasProtected && draft.accessLevel !== "protected";
  const emptyRule = draft.rules.some((r) => !r.text.trim());
  const groupError = draft.accessLevel !== "protected" && (draft.maxGroup < 1 || draft.maxGroup > 50);

  const preview: ConsentSettings = { ...draft, termsVersion: experience.consent.termsVersion + (dirty ? 1 : 0), updatedAt: dirty ? new Date().toISOString() : experience.consent.updatedAt };

  const save = () => {
    if (leavingProtection) {
      setReleaseOpen(true);
      return;
    }
    updateConsent(experience.id, draft);
    toast({ title: `Terms saved as version ${experience.consent.termsVersion + 1}`, body: "Visitors accept these terms from now on.", tone: draft.accessLevel });
  };

  return (
    <div className="grid grid-cols-1 gap-8 2xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="border border-ink/10 bg-paper p-5 sm:p-8">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-ink/10 pb-6">
          <div>
            <p className="text-[0.84rem] text-ink-faint">Editing terms for</p>
            <h2 className="mt-1 font-titling text-[1.5rem] uppercase leading-tight">{experience.title}</h2>
          </div>
          <span className="text-[0.86rem] text-ink-soft">Current version {experience.consent.termsVersion}</span>
        </div>
        <ConsentFields
          value={draft}
          onChange={setDraft}
          idPrefix={`consent-${experience.id}`}
          errors={{ maxGroup: groupError ? "Allow between 1 and 50 participants." : undefined, rules: emptyRule ? "Fill in or remove empty rules." : undefined }}
        />
        {leavingProtection && (
          <p className="mt-8 flex items-start gap-2 rounded-[4px] border border-guided/50 bg-guided/[0.08] p-4 text-[0.92rem]">
            <Lock className="mt-0.5 size-4 shrink-0 text-guided" aria-hidden />
            {hasPublicDetails(experience)
              ? "Saving will ask you to confirm community consent before this practice leaves protection."
              : "This practice has no public description, price or schedule yet. Saving will ask you to add them first."}
          </p>
        )}
      </div>

      <aside aria-label="Preview and save" className="2xl:sticky 2xl:top-6 2xl:self-start">
        <p className="mb-3 text-[0.85rem] text-ink-soft">{dirty ? "Preview of your new terms" : "Terms visitors see now"}</p>
        <ConsentCard consent={preview} price={experience.price} languages={experience.languages} custodianName={custodian.name} compact />
        <div className="mt-4 grid gap-3">
          <Button variant="ink" caps size="lg" disabled={!dirty || emptyRule || groupError} onClick={save}>
            <Save aria-hidden />
            {dirty ? `Save as version ${experience.consent.termsVersion + 1}` : "No changes to save"}
          </Button>
          <Button variant="ghost-ink" disabled={!dirty} onClick={() => setDraft(saved)}>
            <RotateCcw aria-hidden />
            Discard changes
          </Button>
          <p className="text-[0.84rem] leading-relaxed text-ink-faint">Visitors who already booked keep the version they accepted. New bookings use the latest terms.</p>
        </div>
      </aside>

      <ReleaseDialog
        experience={experience}
        open={releaseOpen}
        onOpenChange={(open) => {
          setReleaseOpen(open);
        }}
      />
    </div>
  );
}

export function ConsentManager() {
  const mine = useMyExperiences();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = mine.find((e) => e.id === selectedId) ?? mine[0];

  return (
    <div>
      <WorkspaceHeader title="Consent" lead="Your terms travel with every experience. Visitors accept them before booking, and every change becomes a new version." />
      <WorkspaceBody>
        {!selected ? (
          <EmptyState tone="light" title="No experiences yet" body="Create an experience to set its terms." />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
            <nav aria-label="Choose an experience" className="lg:sticky lg:top-6 lg:self-start">
              <ul className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-2 lg:mx-0 lg:block lg:space-y-1.5 lg:overflow-visible lg:px-0 lg:pb-0">
                {mine.map((e) => {
                  const on = e.id === selected.id;
                  return (
                    <li key={e.id} className="shrink-0">
                      <button
                        type="button"
                        aria-current={on ? "true" : undefined}
                        onClick={() => setSelectedId(e.id)}
                        className={cn(
                          "flex w-60 flex-col items-start gap-2 rounded-[4px] border p-3.5 text-left transition-colors lg:w-full",
                          on ? "border-ink bg-paper" : "border-ink/10 hover:border-ink/30 hover:bg-paper/60",
                        )}
                      >
                        <span className="line-clamp-2 text-[0.92rem] font-medium leading-snug">{e.title}</span>
                        <span className="flex items-center gap-2">
                          <AccessBadge level={e.consent.accessLevel} size="sm" hint={false} tone="light" />
                          <span className="text-[0.74rem] text-ink-faint">v{e.consent.termsVersion}</span>
                          {e.status === "draft" && <span className="text-[0.74rem] text-ink-faint">Draft</span>}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
            <ConsentEditor key={selected.id} experience={selected} />
          </div>
        )}
      </WorkspaceBody>
    </div>
  );
}
