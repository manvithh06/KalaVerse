"use client";

import { Camera, Lock, Mic, Plus, Sparkles, Trash2, Video, type LucideIcon } from "lucide-react";
import type { AccessLevel, CulturalRule, Eligibility, ParticipationMode } from "@/types";
import { applyAccessLevel, ELIGIBILITY_LABEL, PARTICIPATION_LABEL, type ConsentCore } from "@/lib/consent";
import { AccessSelector } from "./access-selector";
import { Field, Input, Select } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn, uid } from "@/lib/utils";

export function toConsentCore(consent: ConsentCore): ConsentCore {
  return {
    accessLevel: consent.accessLevel,
    photography: consent.photography,
    video: consent.video,
    recording: consent.recording,
    participation: consent.participation,
    maxGroup: consent.maxGroup,
    eligibility: consent.eligibility,
    aiAssist: consent.aiAssist,
    rules: consent.rules.map((r) => ({ id: r.id, text: r.text })),
  };
}

/** Changing the access level through the form: protection switches everything off; leaving it restores sensible defaults. */
export function withAccessLevel(consent: ConsentCore, level: AccessLevel): ConsentCore {
  const next = applyAccessLevel(consent, level);
  if (consent.accessLevel === "protected" && level !== "protected") {
    return { ...next, participation: "guided", eligibility: "everyone", maxGroup: next.maxGroup || 10 };
  }
  return next;
}

function ToggleRow({
  id,
  icon: Icon,
  label,
  hint,
  checked,
  disabled,
  onChange,
}: {
  id: string;
  icon: LucideIcon;
  label: string;
  hint: string;
  checked: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex min-h-[4.5rem] items-center justify-between gap-4 py-3">
      <label htmlFor={id} className={cn("flex min-w-0 items-start gap-3", disabled ? "cursor-not-allowed" : "cursor-pointer")}>
        <Icon className="mt-0.5 size-5 shrink-0 text-ink-soft" aria-hidden />
        <span>
          <span className="block font-medium">{label}</span>
          <span className="block text-[0.86rem] text-ink-faint">{hint}</span>
        </span>
      </label>
      <span className="flex shrink-0 items-center gap-3">
        <span className={cn("w-8 text-right text-[0.72rem] font-bold tracking-[0.14em]", checked ? "text-forest-2" : "text-ink-faint")}>{checked ? "ON" : "OFF"}</span>
        <Switch id={id} checked={checked} disabled={disabled} onCheckedChange={onChange} />
      </span>
    </div>
  );
}

export function ConsentFields({
  value,
  onChange,
  idPrefix,
  errors = {},
}: {
  value: ConsentCore;
  onChange: (value: ConsentCore) => void;
  idPrefix: string;
  errors?: Partial<Record<"maxGroup" | "rules", string>>;
}) {
  const isProtected = value.accessLevel === "protected";
  const set = <K extends keyof ConsentCore>(key: K, v: ConsentCore[K]) => onChange({ ...value, [key]: v });

  const updateRule = (id: string, text: string) => set("rules", value.rules.map((r) => (r.id === id ? { ...r, text } : r)));
  const removeRule = (id: string) => set("rules", value.rules.filter((r) => r.id !== id));
  const addRule = () => set("rules", [...value.rules, { id: uid("rule"), text: "" } satisfies CulturalRule]);

  return (
    <div className="space-y-12">
      <fieldset>
        <legend className="t-subtitle">Access control</legend>
        <p className="mt-2 text-[0.92rem] text-ink-soft">Choose how far this practice reaches beyond your community.</p>
        <div className="mt-5">
          <AccessSelector value={value.accessLevel} aiAssist={value.aiAssist} onChange={(level) => onChange(withAccessLevel(value, level))} />
        </div>
      </fieldset>

      <fieldset>
        <legend className="t-subtitle">Cultural rules</legend>
        <p className="mt-2 text-[0.92rem] text-ink-soft">Visitors see these on the Consent Card and accept them before booking.</p>
        {isProtected && (
          <p className="mt-4 flex items-start gap-2 rounded-[4px] border border-protected/30 bg-protected/[0.06] p-3 text-[0.9rem] text-ink">
            <Lock className="mt-0.5 size-4 shrink-0 text-protected" aria-hidden />
            Photography, video, recording, participation and AI stay off while this practice is protected.
          </p>
        )}
        <div className="mt-4 divide-y divide-ink/[0.08] border-y border-ink/[0.08]">
          <ToggleRow id={`${idPrefix}-photo`} icon={Camera} label="Photography" hint="Visitors may take photographs" checked={value.photography} disabled={isProtected} onChange={(v) => set("photography", v)} />
          <ToggleRow id={`${idPrefix}-video`} icon={Video} label="Video" hint="Visitors may film any part of the session" checked={value.video} disabled={isProtected} onChange={(v) => set("video", v)} />
          <ToggleRow id={`${idPrefix}-recording`} icon={Mic} label="Recording" hint="Audio recording of songs, stories or speech" checked={value.recording} disabled={isProtected} onChange={(v) => set("recording", v)} />
          <ToggleRow id={`${idPrefix}-ai`} icon={Sparkles} label="AI assistance" hint="Allow AI to draft descriptions for your approval" checked={value.aiAssist} disabled={isProtected} onChange={(v) => set("aiAssist", v)} />
        </div>

        <div className="mt-8">
          <p id={`${idPrefix}-participation`} className="text-[0.875rem] font-medium">
            Participation
          </p>
          <div role="radiogroup" aria-labelledby={`${idPrefix}-participation`} className="mt-2 grid grid-cols-3 gap-1 rounded-[4px] border border-ink/15 bg-paper p-1">
            {(Object.keys(PARTICIPATION_LABEL) as ParticipationMode[]).map((mode) => {
              const on = value.participation === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  disabled={isProtected}
                  onClick={() => set("participation", mode)}
                  className={cn(
                    "h-11 rounded-[3px] px-2 text-[0.86rem] transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                    on ? "bg-ink text-paper" : "text-ink-soft hover:bg-ink/[0.05] hover:text-ink",
                  )}
                >
                  {mode === "guided" ? "Guided" : PARTICIPATION_LABEL[mode]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <Field id={`${idPrefix}-max`} label="Maximum participants" error={errors.maxGroup} hint="Per session">
            <Input
              id={`${idPrefix}-max`}
              inputMode="numeric"
              disabled={isProtected}
              value={isProtected ? "" : String(value.maxGroup || "")}
              placeholder={isProtected ? "Not applicable" : "10"}
              onChange={(e) => set("maxGroup", Number(e.target.value.replace(/[^\d]/g, "")) || 0)}
              aria-invalid={Boolean(errors.maxGroup)}
            />
          </Field>
          <Field id={`${idPrefix}-eligibility`} label="Visitor eligibility">
            <Select id={`${idPrefix}-eligibility`} value={value.eligibility} disabled={isProtected} onChange={(e) => set("eligibility", e.target.value as Eligibility)}>
              {(Object.keys(ELIGIBILITY_LABEL) as Eligibility[]).map((k) => (
                <option key={k} value={k}>
                  {ELIGIBILITY_LABEL[k]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="mt-8">
          <p className="text-[0.875rem] font-medium">Community rules</p>
          <p className="mt-1 text-[0.84rem] text-ink-faint">Specific rules visitors must follow, in your own words.</p>
          <ul className="mt-3 space-y-2">
            {value.rules.map((rule, i) => (
              <li key={rule.id} className="flex items-center gap-2">
                <label htmlFor={`${idPrefix}-rule-${rule.id}`} className="sr-only">
                  Rule {i + 1}
                </label>
                <Input id={`${idPrefix}-rule-${rule.id}`} value={rule.text} onChange={(e) => updateRule(rule.id, e.target.value)} placeholder="Do not touch costumes or ornaments." />
                <Button type="button" variant="ghost-ink" size="icon" aria-label={`Remove rule ${i + 1}`} onClick={() => removeRule(rule.id)}>
                  <Trash2 aria-hidden />
                </Button>
              </li>
            ))}
          </ul>
          {errors.rules && (
            <p role="alert" className="mt-2 text-[0.8125rem] text-protected">
              {errors.rules}
            </p>
          )}
          {value.rules.length < 6 && (
            <Button type="button" variant="outline-ink" size="sm" className="mt-3" onClick={addRule}>
              <Plus aria-hidden />
              Add a rule
            </Button>
          )}
        </div>
      </fieldset>
    </div>
  );
}
