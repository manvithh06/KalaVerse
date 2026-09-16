"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ExternalLink, RotateCcw } from "lucide-react";
import { useKalaverse } from "@/store/kalaverse";
import { useCurrentCustodian } from "@/store/hooks";
import { useUI } from "@/store/ui";
import { CURRENT_CUSTODIAN_ID, getCustodianSeed } from "@/data/custodians";
import { LANGUAGE_OPTIONS } from "@/data/practices";
import { TrustBadge } from "@/components/cultural/trust-badge";
import { TrustLadder } from "@/components/cultural/trust-ladder";
import { Button } from "@/components/ui/button";
import { Chip, Field, Input, Textarea } from "@/components/ui/field";
import { WorkspaceBody, WorkspaceHeader } from "./workspace";

export function ProfileEditor() {
  const custodian = useCurrentCustodian();
  const updateProfile = useKalaverse((s) => s.updateProfile);
  const toast = useUI((s) => s.toast);
  const [form, setForm] = useState(() => ({
    name: custodian.name,
    location: custodian.location,
    languages: custodian.languages,
    bio: custodian.bio,
    story: custodian.story.join("\n\n"),
    rules: custodian.rules.join("\n"),
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => setForm((f) => ({ ...f, [key]: value }));

  function save() {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 3) next.name = "Enter your name as you want visitors to see it.";
    if (form.bio.trim().length < 30) next.bio = "Write at least 30 characters about yourself and your practice.";
    if (!form.languages.length) next.languages = "Choose at least one language.";
    setErrors(next);
    if (Object.keys(next).length) return;
    updateProfile({
      name: form.name.trim(),
      location: form.location.trim(),
      languages: form.languages,
      bio: form.bio.trim(),
      story: form.story.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
      rules: form.rules.split("\n").map((r) => r.trim()).filter(Boolean),
    });
    toast({ title: "Profile saved", body: "Your public profile shows these words exactly as you wrote them.", tone: "open" });
  }

  function restore() {
    const seed = getCustodianSeed(CURRENT_CUSTODIAN_ID);
    if (!seed) return;
    updateProfile({ name: undefined, location: undefined, languages: undefined, bio: undefined, story: undefined, rules: undefined });
    setForm({ name: seed.name, location: seed.location, languages: seed.languages, bio: seed.bio, story: seed.story.join("\n\n"), rules: seed.rules.join("\n") });
    setErrors({});
    toast({ title: "Original profile restored" });
  }

  return (
    <div>
      <WorkspaceHeader
        title="Profile"
        lead="Your narrative is yours. Kalaverse publishes it as written and never edits it."
        actions={
          <Button asChild variant="outline-ink">
            <Link href={`/custodians/${CURRENT_CUSTODIAN_ID}`}>
              <ExternalLink aria-hidden />
              See public profile
            </Link>
          </Button>
        }
      />
      <WorkspaceBody className="space-y-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <form
            noValidate
            className="space-y-6 border border-ink/10 bg-paper p-6 sm:p-8"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <div className="grid gap-6 sm:grid-cols-2">
              <Field id="profile-name" label="Name" error={errors.name}>
                <Input id="profile-name" value={form.name} onChange={(e) => set("name", e.target.value)} aria-invalid={Boolean(errors.name)} />
              </Field>
              <Field id="profile-location" label="Location">
                <Input id="profile-location" value={form.location} onChange={(e) => set("location", e.target.value)} />
              </Field>
            </div>
            <div>
              <p id="profile-languages" className="text-[0.875rem] font-medium">
                Languages
              </p>
              <div role="group" aria-labelledby="profile-languages" className="mt-2 flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map((lang) => {
                  const on = form.languages.includes(lang);
                  return (
                    <Chip key={lang} selected={on} onClick={() => set("languages", on ? form.languages.filter((l) => l !== lang) : [...form.languages, lang])}>
                      {on && <Check className="size-3.5" aria-hidden />}
                      {lang}
                    </Chip>
                  );
                })}
              </div>
              {errors.languages && (
                <p role="alert" className="mt-2 text-[0.8125rem] text-protected">
                  {errors.languages}
                </p>
              )}
            </div>
            <Field id="profile-bio" label="About you" error={errors.bio}>
              <Textarea id="profile-bio" value={form.bio} onChange={(e) => set("bio", e.target.value)} aria-invalid={Boolean(errors.bio)} />
            </Field>
            <Field id="profile-story" label="Community story" hint="Separate paragraphs with an empty line.">
              <Textarea id="profile-story" value={form.story} onChange={(e) => set("story", e.target.value)} className="min-h-56 font-serif text-[1.02rem]" />
            </Field>
            <Field id="profile-rules" label="Rules for every visitor" hint="One rule per line. Each experience adds its own terms on top.">
              <Textarea id="profile-rules" value={form.rules} onChange={(e) => set("rules", e.target.value)} className="min-h-36" />
            </Field>
            <div className="flex flex-col-reverse gap-3 border-t border-ink/10 pt-6 sm:flex-row sm:justify-between">
              <Button type="button" variant="ghost-ink" onClick={restore}>
                <RotateCcw aria-hidden />
                Restore original
              </Button>
              <Button type="submit" variant="ink" caps>
                Save profile
              </Button>
            </div>
          </form>

          <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <section aria-labelledby="verification" className="border border-ink/10 bg-paper p-6">
              <h2 id="verification" className="text-[1rem] font-medium">
                Verification
              </h2>
              <ol className="mt-5 space-y-4">
                {[
                  ["Pending", "Details received"],
                  ["Under review", "Reviewed by community endorsers"],
                  ["Verified", `Confirmed in ${custodian.memberSince}`],
                ].map(([title, note]) => (
                  <li key={title} className="flex gap-3">
                    <span className="grid size-6 shrink-0 place-items-center rounded-full bg-forest-2 text-paper">
                      <Check className="size-3.5" strokeWidth={3} aria-hidden />
                    </span>
                    <span>
                      <span className="block text-[0.72rem] font-semibold uppercase tracking-[0.14em]">{title}</span>
                      <span className="block text-[0.86rem] text-ink-soft">{note}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <div className="mt-6 border-t border-ink/10 pt-5">
                <TrustBadge level={custodian.trustLevel} tone="light" />
                <p className="mt-3 text-[0.9rem] text-ink-soft">
                  {custodian.endorsements} community endorsements, including {custodian.endorsedBy.join(" and ").toLowerCase()}.
                </p>
              </div>
            </section>
          </aside>
        </div>

        <section aria-labelledby="trust-ladder" className="border-t border-ink/10 pt-12">
          <h2 id="trust-ladder" className="t-title">
            Your trust ladder
          </h2>
          <TrustLadder tone="light" current={custodian.trustLevel} className="mt-10" />
        </section>
      </WorkspaceBody>
    </div>
  );
}
