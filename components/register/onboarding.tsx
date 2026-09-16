"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, FileText, Users } from "lucide-react";
import type { CustodianApplication, VerificationStatus } from "@/types";
import { useKalaverse } from "@/store/kalaverse";
import { useHydrated } from "@/store/hooks";
import { LANGUAGE_OPTIONS, PRACTICE_OPTIONS } from "@/data/practices";
import { AccessGlyph } from "@/components/consent/access-badge";
import { KireetaLoader } from "@/components/cultural/states";
import { useRoleCrossing } from "@/components/layout/role-switcher";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Chip, Field, Input, Select, Textarea } from "@/components/ui/field";
import { cn } from "@/lib/utils";

const STEPS = ["Your voice", "Verification", "Boundaries", "Status"];

interface FormState {
  name: string;
  location: string;
  practice: string;
  languages: string[];
  community: string;
  verificationMethod: "community" | "document";
  endorserName: string;
  endorserRole: string;
  organizationName: string;
  documentType: string;
  shareDocument: boolean;
  share: string;
  guide: string;
  protect: string;
}

const EMPTY: FormState = {
  name: "",
  location: "",
  practice: PRACTICE_OPTIONS[0].value,
  languages: [],
  community: "",
  verificationMethod: "community",
  endorserName: "",
  endorserRole: "",
  organizationName: "",
  documentType: "Membership letter",
  shareDocument: false,
  share: "",
  guide: "",
  protect: "",
};

function Progress({ current }: { current: number }) {
  return (
    <nav aria-label="Registration progress">
      <ol className="grid grid-cols-4 gap-2 sm:gap-4">
        {STEPS.map((label, i) => (
          <li key={label} aria-current={i === current ? "step" : undefined}>
            <div className="h-1 overflow-hidden rounded-full bg-ivory/10">
              <motion.div
                className="h-full bg-gold-light"
                initial={false}
                animate={{ width: i < current ? "100%" : i === current ? "45%" : "0%" }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <p className={cn("mt-3 hidden text-[0.78rem] sm:block", i <= current ? "text-gold-light" : "text-ash")}>Step {i + 1}</p>
            <p className={cn("hidden text-[0.92rem] sm:block", i <= current ? "text-ivory" : "text-ash")}>{label}</p>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-[0.88rem] text-ash sm:hidden">
        Step {current + 1} of 4: {STEPS[current]}
      </p>
    </nav>
  );
}

const STATUS_STEPS: { status: VerificationStatus; title: string; body: string }[] = [
  { status: "pending", title: "Pending", body: "Received. Kalaverse checks that your details are complete." },
  { status: "under_review", title: "Under review", body: "Endorsers from your own community are reviewing your application." },
  { status: "verified", title: "Verified", body: "Your community has confirmed you. You can publish on your own terms." },
];

function StatusView({ application }: { application: CustodianApplication }) {
  const advance = useKalaverse((s) => s.advanceApplication);
  const clear = useKalaverse((s) => s.clearApplication);
  const cross = useRoleCrossing();
  const index = STATUS_STEPS.findIndex((s) => s.status === application.status);

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
      <div>
        <h2 className="font-titling text-[clamp(2.2rem,5vw,4.2rem)] uppercase leading-[0.95]">
          Verification
          <br />
          status
        </h2>
        <p className="mt-5 max-w-md text-ivory-dim">Kalaverse never verifies culture on its own. Your community does.</p>
        <ol className="mt-10 space-y-2" aria-live="polite">
          {STATUS_STEPS.map((step, i) => {
            const done = i < index || application.status === "verified";
            const current = i === index;
            return (
              <li key={step.status} className={cn("flex gap-5 rounded-[4px] border p-5 transition-colors duration-500", current ? "border-gold-light/60 bg-gold/[0.06]" : "border-ivory/10")}>
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full border transition-colors duration-500",
                    done ? "border-open bg-open text-night" : current ? "border-gold-light text-gold-light" : "border-ivory/20 text-ash",
                  )}
                >
                  {done ? <Check className="size-4" strokeWidth={3} aria-hidden /> : <span className="text-[0.85rem]">{i + 1}</span>}
                </span>
                <div>
                  <p className="font-sans text-[0.78rem] font-bold uppercase tracking-[0.16em]">{step.title}</p>
                  <p className="mt-1 text-[0.95rem] text-ivory-dim">{step.body}</p>
                </div>
              </li>
            );
          })}
        </ol>
        <div className="mt-8 flex flex-wrap gap-3">
          {application.status !== "verified" ? (
            <Button variant="outline" onClick={advance}>
              {application.status === "pending" ? "Send to community review (demo)" : "Complete community review (demo)"}
            </Button>
          ) : (
            <Button variant="gold" caps onClick={() => cross("custodian", "/custodian")}>
              Open custodian workspace
            </Button>
          )}
          <Button variant="ghost" onClick={clear}>
            Start a new application
          </Button>
        </div>
        <p className="mt-4 text-[0.84rem] text-ash">In the real product, reviewers from your community move this forward. Here you can advance it yourself.</p>
      </div>

      <aside className="self-start border border-ivory/10 bg-night-2 p-6 sm:p-8">
        <p className="text-[0.86rem] text-ash">Application</p>
        <p className="mt-1 font-serif text-[1.6rem] italic">{application.name}</p>
        <dl className="mt-6 space-y-3 text-[0.95rem]">
          {[
            ["Practice", application.practice],
            ["Location", application.location],
            ["Languages", application.languages.join(", ")],
            ["Community", application.community],
            ["Verification", application.verificationMethod === "community" ? `Endorsed by ${application.endorserName}` : `Documents from ${application.organizationName}`],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-6">
              <dt className="shrink-0 text-ivory-dim">{label}</dt>
              <dd className="text-right">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-8 space-y-4 border-t border-ivory/10 pt-6">
          {(
            [
              ["open", "Visitors can see", application.boundaries.share],
              ["guided", "Visitors can experience", application.boundaries.guide],
              ["protected", "Stays protected", application.boundaries.protect],
            ] as const
          ).map(([level, label, value]) => (
            <div key={level}>
              <p className="flex items-center gap-2 text-[0.86rem] text-ivory-dim">
                <AccessGlyph level={level} />
                {label}
              </p>
              <p className="mt-1 text-[0.95rem]">{value}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}

export function Onboarding() {
  const hydrated = useHydrated();
  const application = useKalaverse((s) => s.application);
  const submitApplication = useKalaverse((s) => s.submitApplication);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  function validateStep(s: number) {
    const e: Record<string, string> = {};
    if (s === 0) {
      if (form.name.trim().length < 3) e.name = "Enter your full name.";
      if (form.location.trim().length < 3) e.location = "Enter where you practise, for example Udupi.";
      if (!form.languages.length) e.languages = "Choose at least one language.";
      if (form.community.trim().length < 3) e.community = "Name your community, troupe or collective.";
    }
    if (s === 1) {
      if (form.verificationMethod === "community") {
        if (form.endorserName.trim().length < 3) e.endorserName = "Name someone in your community who can vouch for you.";
        if (form.endorserRole.trim().length < 3) e.endorserRole = "Describe their role in the community.";
      } else {
        if (form.organizationName.trim().length < 3) e.organizationName = "Enter the organisation that issued your document.";
        if (!form.shareDocument) e.shareDocument = "Agree to share the document with reviewers.";
      }
    }
    if (s === 2) {
      if (form.share.trim().length < 10) e.share = "Describe what visitors may see, in at least 10 characters.";
      if (form.guide.trim().length < 10) e.guide = "Describe what visitors may take part in, in at least 10 characters.";
      if (form.protect.trim().length < 5) e.protect = "Name what must stay protected. A label is enough.";
    }
    setErrors(e);
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0];
      document.getElementById(`reg-${first}`)?.focus();
      return false;
    }
    return true;
  }

  function next() {
    if (!validateStep(step)) return;
    if (step < 2) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    submitApplication({
      name: form.name.trim(),
      location: form.location.trim(),
      practice: form.practice,
      languages: form.languages,
      community: form.community.trim(),
      verificationMethod: form.verificationMethod,
      endorserName: form.endorserName.trim(),
      organizationName: form.organizationName.trim(),
      boundaries: { share: form.share.trim(), guide: form.guide.trim(), protect: form.protect.trim() },
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const current = application ? 3 : step;

  return (
    <div className="bg-night text-ivory">
      <div className="page-gutter mx-auto max-w-[1100px] pb-28 pt-28 lg:pt-36">
        <h1 className="sr-only">Become a custodian</h1>
        {!hydrated ? (
          <KireetaLoader label="Loading your application" />
        ) : (
          <>
            <Progress current={current} />
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="mt-14"
              >
                {current === 3 && application ? (
                  <StatusView application={application} />
                ) : (
                  <form
                    noValidate
                    onSubmit={(e) => {
                      e.preventDefault();
                      next();
                    }}
                    className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
                  >
                    <div>
                      <h2 className="font-titling text-[clamp(2.3rem,5.4vw,4.6rem)] uppercase leading-[0.95]">
                        {current === 0 && (
                          <>
                            Your culture.
                            <br />
                            Your voice.
                          </>
                        )}
                        {current === 1 && (
                          <>
                            Verify your
                            <br />
                            custodianship
                          </>
                        )}
                        {current === 2 && (
                          <>
                            Define your
                            <br />
                            boundaries
                          </>
                        )}
                      </h2>
                      <p className="mt-6 max-w-sm text-[1.02rem] leading-relaxed text-ivory-dim">
                        {current === 0 && "Tell us who you are and the practice you carry. You will write everything visitors read."}
                        {current === 1 && "Your community confirms you, not the platform. Choose how they can vouch for you."}
                        {current === 2 && "Before anything is listed, decide what is shared, what is guided and what stays within the community."}
                      </p>
                    </div>

                    <div className="space-y-6">
                      {current === 0 && (
                        <>
                          <Field id="reg-name" tone="dark" label="Name" error={errors.name}>
                            <Input id="reg-name" tone="dark" value={form.name} onChange={(e) => set("name", e.target.value)} aria-invalid={Boolean(errors.name)} autoComplete="name" />
                          </Field>
                          <Field id="reg-location" tone="dark" label="Location" error={errors.location}>
                            <Input id="reg-location" tone="dark" value={form.location} onChange={(e) => set("location", e.target.value)} aria-invalid={Boolean(errors.location)} placeholder="Udupi, Coastal Karnataka" />
                          </Field>
                          <Field id="reg-practice" tone="dark" label="Cultural practice">
                            <Select id="reg-practice" tone="dark" value={form.practice} onChange={(e) => set("practice", e.target.value)}>
                              {PRACTICE_OPTIONS.map((p) => (
                                <option key={p.value}>{p.value}</option>
                              ))}
                            </Select>
                          </Field>
                          <div>
                            <p id="reg-languages-label" className="text-[0.875rem] font-medium">
                              Languages
                            </p>
                            <div id="reg-languages" tabIndex={-1} role="group" aria-labelledby="reg-languages-label" className="mt-2 flex flex-wrap gap-2 outline-none">
                              {LANGUAGE_OPTIONS.map((lang) => {
                                const on = form.languages.includes(lang);
                                return (
                                  <Chip key={lang} tone="dark" selected={on} onClick={() => set("languages", on ? form.languages.filter((l) => l !== lang) : [...form.languages, lang])}>
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
                          <Field id="reg-community" tone="dark" label="Community" error={errors.community} hint="Your troupe, collective, family or village.">
                            <Input id="reg-community" tone="dark" value={form.community} onChange={(e) => set("community", e.target.value)} aria-invalid={Boolean(errors.community)} />
                          </Field>
                        </>
                      )}

                      {current === 1 && (
                        <>
                          <div role="radiogroup" aria-label="Verification method" className="grid gap-3 sm:grid-cols-2">
                            {(
                              [
                                ["community", Users, "Community endorsement", "Someone from your community vouches that you carry this practice."],
                                ["document", FileText, "Document or organisation proof", "A letter or certificate from a cultural organisation."],
                              ] as const
                            ).map(([value, Icon, title, body]) => {
                              const on = form.verificationMethod === value;
                              return (
                                <button
                                  key={value}
                                  type="button"
                                  role="radio"
                                  aria-checked={on}
                                  onClick={() => set("verificationMethod", value)}
                                  className={cn("flex flex-col items-start gap-3 rounded-[4px] border p-5 text-left transition-colors", on ? "border-gold-light bg-gold/[0.07]" : "border-ivory/12 hover:border-ivory/35")}
                                >
                                  <Icon className={cn("size-6", on ? "text-gold-light" : "text-ash")} aria-hidden />
                                  <span className="font-medium">{title}</span>
                                  <span className="text-[0.88rem] text-ivory-dim">{body}</span>
                                </button>
                              );
                            })}
                          </div>
                          {form.verificationMethod === "community" ? (
                            <>
                              <Field id="reg-endorserName" tone="dark" label="Endorser's name" error={errors.endorserName}>
                                <Input id="reg-endorserName" tone="dark" value={form.endorserName} onChange={(e) => set("endorserName", e.target.value)} aria-invalid={Boolean(errors.endorserName)} />
                              </Field>
                              <Field id="reg-endorserRole" tone="dark" label="Their role in the community" error={errors.endorserRole}>
                                <Input id="reg-endorserRole" tone="dark" value={form.endorserRole} onChange={(e) => set("endorserRole", e.target.value)} aria-invalid={Boolean(errors.endorserRole)} placeholder="Senior artist of the troupe" />
                              </Field>
                            </>
                          ) : (
                            <>
                              <Field id="reg-organizationName" tone="dark" label="Organisation" error={errors.organizationName}>
                                <Input id="reg-organizationName" tone="dark" value={form.organizationName} onChange={(e) => set("organizationName", e.target.value)} aria-invalid={Boolean(errors.organizationName)} />
                              </Field>
                              <Field id="reg-documentType" tone="dark" label="Document">
                                <Select id="reg-documentType" tone="dark" value={form.documentType} onChange={(e) => set("documentType", e.target.value)}>
                                  <option>Membership letter</option>
                                  <option>Craft registration</option>
                                  <option>Cultural organisation certificate</option>
                                </Select>
                              </Field>
                              <label id="reg-shareDocument" tabIndex={-1} className="flex cursor-pointer items-start gap-3 text-[0.95rem] outline-none">
                                <Checkbox checked={form.shareDocument} onCheckedChange={(v) => set("shareDocument", v === true)} className="mt-0.5" />
                                I can share this document with community reviewers. It is not published.
                              </label>
                              {errors.shareDocument && (
                                <p role="alert" className="text-[0.8125rem] text-protected">
                                  {errors.shareDocument}
                                </p>
                              )}
                            </>
                          )}
                        </>
                      )}

                      {current === 2 && (
                        <>
                          {(
                            [
                              ["share", "open", "What can visitors see?", "Performances, finished crafts, stories meant for everyone."],
                              ["guide", "guided", "What can visitors experience?", "What visitors may take part in, and under what rules."],
                              ["protect", "protected", "What must remain protected?", "Name it only. Do not describe the practice or its knowledge."],
                            ] as const
                          ).map(([key, level, label, hint]) => (
                            <Field
                              key={key}
                              id={`reg-${key}`}
                              tone="dark"
                              label={
                                <span className="flex items-center gap-2">
                                  <AccessGlyph level={level} />
                                  {label}
                                </span>
                              }
                              hint={hint}
                              error={errors[key]}
                            >
                              <Textarea id={`reg-${key}`} tone="dark" value={form[key]} onChange={(e) => set(key, e.target.value)} aria-invalid={Boolean(errors[key])} className="min-h-24" />
                            </Field>
                          ))}
                        </>
                      )}

                      <div className="flex flex-col-reverse gap-3 border-t border-ivory/10 pt-6 sm:flex-row sm:justify-between">
                        {step > 0 ? (
                          <Button type="button" variant="ghost" onClick={() => { setErrors({}); setStep(step - 1); }}>
                            <ArrowLeft aria-hidden />
                            Back
                          </Button>
                        ) : (
                          <span />
                        )}
                        <Button type="submit" caps size="lg">
                          {step < 2 ? "Continue" : "Submit for verification"}
                        </Button>
                      </div>
                    </div>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}
