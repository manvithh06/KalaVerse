"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Lock, Save, Sparkles, TriangleAlert, Wand2, X } from "lucide-react";
import type { AIContent, ConsentSettings, DescriptionSource, Experience } from "@/types";
import { useKalaverse, type ExperienceInput } from "@/store/kalaverse";
import { useCurrentCustodian } from "@/store/hooks";
import { useUI } from "@/store/ui";
import { DISTRICTS, LANGUAGE_OPTIONS, PRACTICE_OPTIONS, WEEKDAY_OPTIONS, practiceOption } from "@/data/practices";
import { ACCESS_META, visibilityFor, type ConsentCore } from "@/lib/consent";
import { composeDraft } from "@/lib/ai";
import { ConsentCard } from "@/components/consent/consent-card";
import { ConsentFields, toConsentCore } from "@/components/consent/consent-fields";
import { AnimatedLock } from "@/components/consent/animated-lock";
import { AIVetoPanel } from "@/components/ai/ai-veto-panel";
import { useRoleCrossing } from "@/components/layout/role-switcher";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Chip, Field, Input, Select, Textarea } from "@/components/ui/field";
import { cn, formatDuration, uid } from "@/lib/utils";

const REGIONS = ["Coastal Karnataka", "Karnataka", "North Karnataka"];
const DURATIONS = [60, 90, 120, 150, 180, 240, 480];

interface FormState {
  title: string;
  practice: string;
  summary: string;
  description: string;
  descriptionSource: DescriptionSource;
  location: string;
  district: string;
  languages: string[];
  durationMinutes: number;
  price: string;
  days: number[];
  time: string;
  consent: ConsentCore;
}

type ErrorKey = "title" | "summary" | "description" | "languages" | "price" | "days" | "maxGroup" | "rules" | "release";

const EMPTY: FormState = {
  title: "",
  practice: "Yakshagana",
  summary: "",
  description: "",
  descriptionSource: "custodian",
  location: "Coastal Karnataka",
  district: "Udupi",
  languages: ["Kannada"],
  durationMinutes: 120,
  price: "",
  days: [6],
  time: "17:00",
  consent: {
    accessLevel: "guided",
    photography: false,
    video: false,
    recording: false,
    participation: "guided",
    maxGroup: 10,
    eligibility: "everyone",
    aiAssist: true,
    rules: [],
  },
};

const EXAMPLE: FormState = {
  ...EMPTY,
  title: "Yakshagana: Beyond the Stage",
  summary: "An evening with the troupe before the performance begins, explained by the artists.",
  description:
    "Visitors join the troupe while the stage is prepared and the drums warm up. I explain how a night of Yakshagana is built, from the singer who leads the story to the characters who enter from behind the curtain, before a short guided performance.",
  languages: ["Kannada", "English"],
  price: "1500",
  days: [6, 0],
  consent: {
    ...EMPTY.consent,
    rules: [
      { id: uid("rule"), text: "Follow the custodian's instructions throughout the session." },
      { id: uid("rule"), text: "Do not touch costumes, crowns or ornaments." },
    ],
  },
};

function fromExperience(e: Experience): FormState {
  return {
    title: e.title,
    practice: e.practice,
    summary: e.summary,
    description: e.description,
    descriptionSource: e.descriptionSource,
    location: e.location === "Within the community" ? "Coastal Karnataka" : e.location,
    district: e.district,
    languages: e.languages,
    durationMinutes: e.durationMinutes || 120,
    price: e.price ? String(e.price) : "",
    days: e.schedule.days,
    time: e.schedule.time === "00:00" ? "17:00" : e.schedule.time,
    consent: toConsentCore(e.consent),
  };
}

function validate(form: FormState, releasing: boolean, communityConsent: boolean) {
  const errors: Partial<Record<ErrorKey, string>> = {};
  const isProtected = form.consent.accessLevel === "protected";
  if (form.title.trim().length < 4) errors.title = "Name the experience in at least 4 characters.";
  if (!isProtected) {
    if (form.summary.trim().length < 20) errors.summary = "Write a one-line summary of at least 20 characters for discovery cards.";
    if (form.description.trim().length < 40) errors.description = "Describe the experience in your own words, in at least 40 characters.";
    if (!form.languages.length) errors.languages = "Choose at least one language.";
    const price = Number(form.price);
    if (!Number.isFinite(price) || price < 100) errors.price = "Set a price of at least ₹100.";
    if (!form.days.length) errors.days = "Choose at least one day when sessions run.";
    if (form.consent.maxGroup < 1 || form.consent.maxGroup > 50) errors.maxGroup = "Allow between 1 and 50 participants.";
  }
  if (form.consent.rules.some((r) => !r.text.trim())) errors.rules = "Fill in or remove empty rules.";
  if (releasing && !communityConsent) errors.release = "Confirm the community has agreed before this practice leaves protection.";
  return errors;
}

const FIELD_ORDER: ErrorKey[] = ["title", "summary", "description", "languages", "price", "days", "maxGroup", "rules", "release"];
const FIELD_ID: Record<ErrorKey, string> = {
  title: "exp-title",
  summary: "exp-summary",
  description: "exp-description",
  languages: "exp-languages",
  price: "exp-price",
  days: "exp-days",
  maxGroup: "exp-consent-max",
  rules: "exp-rules",
  release: "exp-release",
};

export function ExperienceForm({ experience }: { experience?: Experience }) {
  const router = useRouter();
  const custodian = useCurrentCustodian();
  const aiEnabled = useKalaverse((s) => s.aiEnabled);
  const createExperience = useKalaverse((s) => s.createExperience);
  const updateExperience = useKalaverse((s) => s.updateExperience);
  const toast = useUI((s) => s.toast);

  const [form, setForm] = useState<FormState>(() => (experience ? fromExperience(experience) : EMPTY));
  const [errors, setErrors] = useState<Partial<Record<ErrorKey, string>>>({});
  const [attempted, setAttempted] = useState(false);
  const [communityConsent, setCommunityConsent] = useState(false);
  const [done, setDone] = useState<Experience | null>(null);
  const [aiDraft, setAiDraft] = useState<AIContent | null>(null);
  const [generating, setGenerating] = useState(false);

  const editing = Boolean(experience);
  const wasProtected = experience?.consent.accessLevel === "protected";
  const isProtected = form.consent.accessLevel === "protected";
  const releasing = Boolean(wasProtected && !isProtected);
  const aiBlocked = isProtected || !form.consent.aiAssist || !aiEnabled;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (attempted) setErrors(validate(next, Boolean(wasProtected && next.consent.accessLevel !== "protected"), communityConsent));
      return next;
    });
  };

  const previewConsent: ConsentSettings = useMemo(
    () => ({
      ...form.consent,
      termsVersion: experience ? experience.consent.termsVersion + 1 : 1,
      updatedAt: new Date().toISOString(),
    }),
    [form.consent, experience],
  );

  const pseudoExperience = useMemo<Experience>(
    () => ({
      ...(experience ?? ({} as Experience)),
      id: experience?.id ?? "new-experience",
      title: form.title || "New experience",
      consent: previewConsent,
    }),
    [experience, form.title, previewConsent],
  );

  const toInput = (): ExperienceInput => ({
    title: form.title,
    practice: form.practice,
    summary: form.summary,
    description: form.description,
    descriptionSource: form.descriptionSource,
    district: form.district,
    location: form.location,
    languages: form.languages,
    durationMinutes: form.durationMinutes,
    price: Number(form.price) || 0,
    days: form.days,
    time: form.time,
    consent: form.consent,
  });

  function save(publish: boolean) {
    setAttempted(true);
    const found = validate(form, releasing, communityConsent);
    // Drafts only need a name; everything else is checked when publishing.
    const blocking = publish ? found : Object.fromEntries(Object.entries(found).filter(([k]) => k === "title" || k === "release"));
    setErrors(blocking);
    if (Object.keys(blocking).length) {
      const first = FIELD_ORDER.find((k) => blocking[k]);
      if (first) document.getElementById(FIELD_ID[first])?.focus();
      return;
    }
    if (experience) {
      updateExperience(experience.id, toInput(), publish);
      const updated = useKalaverse.getState().experiences.find((e) => e.id === experience.id)!;
      toast({ title: publish ? "Saved and published" : "Changes saved", body: `Terms are now version ${updated.consent.termsVersion}.`, tone: updated.consent.accessLevel });
      setDone(updated);
    } else {
      const created = createExperience(toInput(), publish);
      setDone(created);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function draftWithAI() {
    if (aiBlocked) return;
    setGenerating(true);
    await new Promise((r) => window.setTimeout(r, 1300));
    const option = practiceOption(form.practice);
    setAiDraft({
      id: uid("ai-form"),
      experienceId: pseudoExperience.id,
      draft: composeDraft({
        title: form.title,
        practice: form.practice,
        format: option.format,
        custodianName: custodian.name,
        district: form.district,
        location: form.location,
        summary: form.summary,
        durationMinutes: form.durationMinutes,
        languages: form.languages,
        consent: form.consent,
      }),
      status: "draft",
      generatedAt: new Date().toISOString(),
      grounded: true,
    });
    setGenerating(false);
  }

  if (done) return <FormResult experience={done} editing={editing} onCreateAnother={() => { setDone(null); setForm(EMPTY); setAttempted(false); setErrors({}); setAiDraft(null); }} />;

  const errorList = FIELD_ORDER.filter((k) => errors[k]);
  const visibility = visibilityFor(form.consent.accessLevel, form.consent.aiAssist);

  return (
    <div>
      <header className="page-gutter mx-auto max-w-[1280px] pb-6 pt-8 lg:pt-12">
        <Link href="/custodian/experiences" className="inline-flex h-10 items-center gap-2 text-[0.9rem] text-ink-soft hover:text-ink">
          <ArrowLeft className="size-4" aria-hidden />
          Experiences
        </Link>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h1 className="font-titling text-[clamp(2.1rem,4.4vw,3.8rem)] uppercase leading-[0.95]">{editing ? "Edit experience" : "Create experience"}</h1>
            <p className="mt-4 max-w-2xl text-[1.02rem] leading-relaxed text-ink-soft">
              You set the description, the price, who may come and what they may do. Nothing is published until you choose to.
            </p>
          </div>
          {!editing && (
            <Button type="button" variant="outline-ink" size="sm" onClick={() => { setForm(EXAMPLE); setErrors({}); }}>
              <Wand2 aria-hidden />
              Fill with an example
            </Button>
          )}
        </div>
      </header>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          save(true);
        }}
        className="page-gutter mx-auto grid max-w-[1280px] gap-10 pb-24 xl:grid-cols-[minmax(0,1fr)_400px]"
      >
        <div className="space-y-12">
          {errorList.length > 0 && (
            <div role="alert" className="flex gap-3 border border-protected/40 bg-protected/[0.07] p-5">
              <TriangleAlert className="mt-0.5 size-5 shrink-0 text-protected" aria-hidden />
              <div>
                <p className="font-medium">Not published yet. Fix {errorList.length === 1 ? "this" : `these ${errorList.length} things`} first:</p>
                <ul className="mt-2 space-y-1 text-[0.92rem]">
                  {errorList.map((k) => (
                    <li key={k}>
                      <a href={`#${FIELD_ID[k]}`} className="underline underline-offset-4" onClick={(e) => { e.preventDefault(); document.getElementById(FIELD_ID[k])?.focus(); }}>
                        {errors[k]}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <fieldset className="space-y-6">
            <legend className="t-subtitle">The experience</legend>
            <Field id="exp-title" label="Experience name" error={errors.title}>
              <Input id="exp-title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Yakshagana: Beyond the Stage" aria-invalid={Boolean(errors.title)} />
            </Field>
            <Field id="exp-practice" label="Cultural practice">
              <Select id="exp-practice" value={form.practice} onChange={(e) => set("practice", e.target.value)}>
                {PRACTICE_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.value}
                  </option>
                ))}
              </Select>
            </Field>
            <Field id="exp-summary" label="One-line summary" hint="Shown on discovery cards." error={errors.summary} optional={isProtected}>
              <Input id="exp-summary" value={form.summary} onChange={(e) => set("summary", e.target.value)} placeholder="An evening with the troupe before the performance begins." aria-invalid={Boolean(errors.summary)} />
            </Field>
            <Field
              id="exp-description"
              label="Description"
              hint={isProtected ? "Optional. Protected practices are never shown publicly." : "In your own words. This is what visitors read."}
              error={errors.description}
            >
              <Textarea id="exp-description" value={form.description} onChange={(e) => set("description", e.target.value)} className="min-h-40" aria-invalid={Boolean(errors.description)} />
            </Field>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" variant="outline-ink" size="sm" disabled={aiBlocked || generating} onClick={draftWithAI}>
                <Sparkles aria-hidden />
                Draft with AI
              </Button>
              <p className="text-[0.84rem] text-ink-faint">
                {isProtected ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Lock className="size-3.5 text-protected" aria-hidden />
                    AI assistance is disabled for protected practices.
                  </span>
                ) : !form.consent.aiAssist || !aiEnabled ? (
                  "AI assistance is off for this experience."
                ) : (
                  "Drafts use only the details on this page, and need your approval."
                )}
              </p>
            </div>
            <AnimatePresence>
              {(generating || aiDraft) && !isProtected && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <AIVetoPanel
                    experience={pseudoExperience}
                    content={aiDraft}
                    aiEnabled={aiEnabled}
                    generating={generating}
                    onGenerate={draftWithAI}
                    onDecide={(decision, text) => {
                      if (!aiDraft) return;
                      const finalText = decision === "edited" ? (text ?? aiDraft.draft) : aiDraft.draft;
                      setAiDraft({ ...aiDraft, status: decision, decidedAt: new Date().toISOString(), finalText: decision === "rejected" ? undefined : finalText });
                      if (decision !== "rejected") {
                        setForm((f) => ({ ...f, description: finalText, descriptionSource: decision === "edited" ? "ai_edited" : "ai_approved" }));
                      }
                    }}
                    onReopen={() => aiDraft && setAiDraft({ ...aiDraft, status: "draft", decidedAt: undefined, finalText: undefined })}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </fieldset>

          <fieldset className="space-y-6">
            <legend className="t-subtitle">Place and time</legend>
            <div className="grid gap-6 sm:grid-cols-2">
              <Field id="exp-location" label="Location">
                <Select id="exp-location" value={form.location} onChange={(e) => set("location", e.target.value)}>
                  {REGIONS.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </Select>
              </Field>
              <Field id="exp-district" label="District">
                <Select id="exp-district" value={form.district} onChange={(e) => set("district", e.target.value)}>
                  {DISTRICTS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div>
              <p id="exp-languages-label" className="text-[0.875rem] font-medium">
                Language
              </p>
              <div id="exp-languages" tabIndex={-1} role="group" aria-labelledby="exp-languages-label" className="mt-2 flex flex-wrap gap-2 outline-none">
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
            <div className="grid gap-6 sm:grid-cols-2">
              <Field id="exp-duration" label="Duration">
                <Select id="exp-duration" value={form.durationMinutes} onChange={(e) => set("durationMinutes", Number(e.target.value))}>
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>
                      {formatDuration(d)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field id="exp-time" label="Start time">
                <Input id="exp-time" type="time" value={form.time} onChange={(e) => set("time", e.target.value)} />
              </Field>
            </div>
            <div>
              <p id="exp-days-label" className="text-[0.875rem] font-medium">
                Availability
              </p>
              <div id="exp-days" tabIndex={-1} role="group" aria-labelledby="exp-days-label" className="mt-2 flex flex-wrap gap-2 outline-none">
                {WEEKDAY_OPTIONS.map((d) => {
                  const on = form.days.includes(d.value);
                  return (
                    <Chip key={d.value} selected={on} className="min-w-14 justify-center" onClick={() => set("days", on ? form.days.filter((x) => x !== d.value) : [...form.days, d.value])}>
                      {d.label}
                    </Chip>
                  );
                })}
              </div>
              {errors.days && (
                <p role="alert" className="mt-2 text-[0.8125rem] text-protected">
                  {errors.days}
                </p>
              )}
            </div>
          </fieldset>

          <fieldset className="space-y-6">
            <legend className="t-subtitle">Price</legend>
            <Field
              id="exp-price"
              label="Price per person (₹)"
              error={errors.price}
              hint={isProtected ? "Commercial access is off for protected practices." : "You keep 90% of every booking."}
              className="sm:max-w-xs"
            >
              <Input
                id="exp-price"
                inputMode="numeric"
                disabled={isProtected}
                value={isProtected ? "" : form.price}
                placeholder={isProtected ? "Not for sale" : "1500"}
                onChange={(e) => set("price", e.target.value.replace(/[^\d]/g, ""))}
                aria-invalid={Boolean(errors.price)}
              />
            </Field>
          </fieldset>

          <div id="exp-rules" tabIndex={-1} className="outline-none">
            <ConsentFields value={form.consent} onChange={(consent) => set("consent", consent)} idPrefix="exp-consent" errors={{ maxGroup: errors.maxGroup, rules: errors.rules }} />
          </div>

          {releasing && (
            <div className="border border-guided/50 bg-guided/[0.08] p-5">
              <p className="font-medium">This practice is leaving protection</p>
              <label id="exp-release" tabIndex={-1} className="mt-3 flex cursor-pointer items-start gap-3 text-[0.95rem] outline-none">
                <Checkbox tone="light" checked={communityConsent} onCheckedChange={(v) => setCommunityConsent(v === true)} className="mt-0.5" />
                The community has agreed to share this practice publicly.
              </label>
              {errors.release && (
                <p role="alert" className="mt-2 text-[0.8125rem] text-protected">
                  {errors.release}
                </p>
              )}
            </div>
          )}
        </div>

        <aside aria-label="Live preview" className="xl:sticky xl:top-6 xl:self-start">
          <p className="mb-3 text-[0.85rem] text-ink-soft">What visitors will see</p>
          <ConsentCard consent={previewConsent} price={Number(form.price) || 0} languages={form.languages} custodianName={custodian.name} compact />
          <div className={cn("mt-4 border p-5", isProtected ? "border-protected/35 bg-protected/[0.05]" : "border-ink/10 bg-paper")}>
            <p className="text-[0.92rem] font-medium">{ACCESS_META[form.consent.accessLevel].label}: where this appears</p>
            <ul className="mt-3 space-y-2 text-[0.9rem]">
              {[
                ["Public discovery", visibility.discovery],
                ["Booking", visibility.booking],
                ["AI description", visibility.ai],
                ["Search indexing", visibility.indexing],
              ].map(([label, on]) => (
                <li key={String(label)} className="flex items-center justify-between gap-3">
                  <span className="text-ink-soft">{label}</span>
                  <span className={cn("inline-flex items-center gap-1.5 font-semibold", on ? "text-forest-2" : "text-protected")}>
                    {on ? <Check className="size-4" aria-hidden /> : <X className="size-4" aria-hidden />}
                    {on ? "On" : "Off"}
                  </span>
                </li>
              ))}
            </ul>
            {isProtected && <p className="mt-4 text-[0.88rem] text-ink">This experience will not appear in public discovery.</p>}
          </div>
          <div className="mt-4 grid gap-3">
            <Button type="submit" variant="ink" caps size="lg" className="w-full">
              Publish with my terms
            </Button>
            <Button type="button" variant="outline-ink" caps size="lg" className="w-full" onClick={() => save(false)}>
              <Save aria-hidden />
              Save draft
            </Button>
            <button type="button" onClick={() => router.push("/custodian/experiences")} className="h-10 text-[0.88rem] text-ink-faint hover:text-ink">
              Cancel
            </button>
          </div>
        </aside>
      </form>
    </div>
  );
}

function FormResult({ experience, editing, onCreateAnother }: { experience: Experience; editing: boolean; onCreateAnother: () => void }) {
  const cross = useRoleCrossing();
  const isProtected = experience.consent.accessLevel === "protected";
  const published = experience.status === "published";
  const visibility = visibilityFor(experience.consent.accessLevel, experience.consent.aiAssist);
  const heading = !published ? "Saved as a draft." : isProtected ? "Sealed with your terms." : "Published with your terms.";

  return (
    <div className="page-gutter mx-auto max-w-[1280px] py-10 lg:py-14">
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn("relative grid gap-10 overflow-hidden p-7 text-ivory sm:p-12 lg:grid-cols-[minmax(0,1fr)_380px]", isProtected ? "bg-vault" : "bg-night")}
      >
        <div>
          <span className={cn("grid size-16 place-items-center rounded-full border", isProtected ? "border-protected/50 text-protected" : "border-open/50 text-open")}>
            {isProtected ? <AnimatedLock className="size-9" /> : published ? <Check className="size-8" strokeWidth={2.5} aria-hidden /> : <Save className="size-7" aria-hidden />}
          </span>
          <p className={cn("t-caps mt-8", isProtected ? "text-protected" : "text-gold-light")}>
            {!published ? "Draft" : isProtected ? "Sealed in your Protected Vault" : editing ? "Updated" : "Published"}
          </p>
          <h1 className="mt-3 font-titling text-[clamp(2rem,4.6vw,3.8rem)] uppercase leading-[0.96]">{heading}</h1>
          <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-ivory-dim">
            {!published
              ? "Only you can see it. Publish when your terms are ready."
              : isProtected
                ? "It will not appear in public discovery. It cannot be booked, sold, described by AI or indexed by search. Only you can change that."
                : "Visitors can now discover it, and every booking begins with your terms."}
          </p>
          <ul className="mt-8 grid max-w-xl grid-cols-2 gap-3">
            {[
              ["Public discovery", published && visibility.discovery],
              ["Booking", published && visibility.booking],
              ["AI description", published && visibility.ai],
              ["Search indexing", published && visibility.indexing],
            ].map(([label, on]) => (
              <li key={String(label)} className="flex items-center gap-2.5 text-[0.95rem]">
                <span className={cn("grid size-6 place-items-center rounded-full", on ? "bg-open/15 text-open" : "bg-protected/15 text-protected")}>
                  {on ? <Check className="size-3.5" strokeWidth={3} aria-hidden /> : <X className="size-3.5" strokeWidth={3} aria-hidden />}
                </span>
                {label}
              </li>
            ))}
          </ul>
          <div className="mt-10 flex flex-wrap gap-3">
            {published && (
              <Button variant="ivory" caps onClick={() => cross("visitor", "/discover")}>
                Check visitor discovery
              </Button>
            )}
            {isProtected && published && (
              <Button asChild variant="outline" caps>
                <Link href="/custodian/vault">Open Protected Vault</Link>
              </Button>
            )}
            <Button asChild variant="ghost">
              <Link href="/custodian/experiences">Back to experiences</Link>
            </Button>
            {!editing && (
              <Button variant="ghost" onClick={onCreateAnother}>
                Create another
              </Button>
            )}
          </div>
        </div>
        <ConsentCard consent={experience.consent} price={experience.price} languages={experience.languages} compact className="self-start" />
      </motion.section>
    </div>
  );
}
