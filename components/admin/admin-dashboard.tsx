"use client";

import { useState } from "react";
import { Check, Lock, MessageSquareText, ShieldCheck, TriangleAlert, Users } from "lucide-react";
import { useKalaverse } from "@/store/kalaverse";
import { useHydrated } from "@/store/hooks";
import { COMMUNITY_REPORTS, CONTENT_REVIEWS, FEEDBACK, VERIFICATION_REQUESTS, type VerificationStage } from "@/data/admin";
import { OverrideAttempt } from "@/components/governance/governance-view";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STAGE_LABEL: Record<VerificationStage, string> = {
  new: "New",
  documents_checked: "Documents checked",
  with_community: "With community reviewers",
};

function SectionTitle({ icon: Icon, children, id }: { icon: typeof Users; children: React.ReactNode; id: string }) {
  return (
    <h2 id={id} className="flex items-center gap-2.5 text-[1.05rem] font-medium">
      <Icon className="size-5 text-gold-light" aria-hidden />
      {children}
    </h2>
  );
}

export function AdminDashboard() {
  const hydrated = useHydrated();
  const application = useKalaverse((s) => s.application);
  const experiences = useKalaverse((s) => s.experiences);
  const [stages, setStages] = useState<Record<string, VerificationStage>>(() => Object.fromEntries(VERIFICATION_REQUESTS.map((r) => [r.id, r.stage])));
  const [resolved, setResolved] = useState<Record<string, boolean>>(() => Object.fromEntries(COMMUNITY_REPORTS.map((r) => [r.id, r.resolved])));
  const [reminded, setReminded] = useState<Record<string, boolean>>({});
  const protectedCount = experiences.filter((e) => e.status === "published" && e.consent.accessLevel === "protected").length;

  const requests = [
    ...(hydrated && application
      ? [
          {
            id: application.id,
            name: application.name,
            practice: application.practice,
            location: application.location,
            method: application.verificationMethod,
            detail: application.verificationMethod === "community" ? `Endorser: ${application.endorserName}` : `Documents from ${application.organizationName}`,
            submitted: "From this demo",
            stage: (application.status === "pending" ? "new" : "with_community") as VerificationStage,
            verified: application.status === "verified",
          },
        ]
      : []),
    ...VERIFICATION_REQUESTS.map((r) => ({ ...r, verified: false })),
  ];

  return (
    <div className="bg-night text-ivory">
      <header className="page-gutter mx-auto max-w-[1440px] pb-10 pt-28 lg:pt-36">
        <h1 className="font-titling text-[clamp(2.4rem,5.6vw,5rem)] uppercase leading-[0.95]">Platform admin</h1>
        <p className="mt-5 max-w-2xl text-[1.02rem] leading-relaxed text-ivory-dim">
          Admins keep the platform safe and running. They route requests to communities; they do not approve culture.
        </p>
        <div className="mt-10 flex flex-col gap-3 border border-gold/30 bg-gold/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-titling text-[clamp(1.2rem,2.4vw,1.9rem)] uppercase leading-tight">Custodian authority &gt; platform convenience</p>
          <p className="flex items-center gap-2 text-[0.92rem] text-ivory-dim">
            <Lock className="size-4 text-protected" aria-hidden />
            Admins cannot override cultural protection.
          </p>
        </div>
      </header>

      <div className="page-gutter mx-auto grid max-w-[1440px] gap-6 pb-28 xl:grid-cols-2">
        <section aria-labelledby="admin-verify" className="border border-ivory/10 bg-night-2 p-6 sm:p-7 xl:col-span-2">
          <SectionTitle id="admin-verify" icon={Users}>
            Custodian verification requests
          </SectionTitle>
          <p className="mt-2 text-[0.9rem] text-ash">Final verification belongs to each applicant&apos;s community. Admins check documents and route requests.</p>
          <ul className="mt-6 divide-y divide-ivory/[0.08] border-y border-ivory/[0.08]">
            {requests.map((r) => {
              const stage = r.id in stages ? stages[r.id] : r.stage;
              return (
                <li key={r.id} className="grid gap-4 py-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto] md:items-center">
                  <div>
                    <p className="font-medium">
                      {r.name} <span className="font-normal text-ash">{r.practice}, {r.location}</span>
                    </p>
                    <p className="mt-1 text-[0.86rem] text-ivory-dim">
                      {r.method === "community" ? "Community endorsement" : "Document proof"}. {r.detail}. {r.submitted}.
                    </p>
                  </div>
                  <p className="text-[0.88rem]">
                    <span className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1", r.verified ? "bg-open/15 text-open" : stage === "with_community" ? "bg-guided/15 text-guided" : "bg-ivory/[0.07] text-ivory-dim")}>
                      {r.verified ? "Verified by community" : STAGE_LABEL[stage]}
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    {!r.verified && r.method === "document" && stage === "new" && (
                      <Button size="sm" variant="outline" onClick={() => setStages((s) => ({ ...s, [r.id]: "documents_checked" }))}>
                        Mark documents checked
                      </Button>
                    )}
                    {!r.verified && stage !== "with_community" && (r.method === "community" || stage === "documents_checked") && (
                      <Button size="sm" variant="outline" onClick={() => setStages((s) => ({ ...s, [r.id]: "with_community" }))}>
                        Send to community reviewers
                      </Button>
                    )}
                    <span className="inline-flex h-9 items-center gap-1.5 px-2 text-[0.8rem] text-ash">
                      <Lock className="size-3.5" aria-hidden />
                      Approval: community only
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="admin-content" className="border border-ivory/10 bg-night-2 p-6 sm:p-7">
          <SectionTitle id="admin-content" icon={ShieldCheck}>
            Cultural content approval
          </SectionTitle>
          <p className="mt-2 text-[0.9rem] text-ash">Read-only for admins. Community reviewers approve.</p>
          <ul className="mt-6 space-y-3">
            {CONTENT_REVIEWS.map((c) => (
              <li key={c.id} className="rounded-[4px] border border-ivory/[0.08] p-4">
                <p className="font-medium">{c.title}</p>
                <p className="mt-1 text-[0.86rem] text-ivory-dim">
                  {c.change}, by {c.custodian}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[0.86rem] text-gold-light">{c.state}</span>
                  {!c.state.startsWith("Approved") && (
                    <Button size="sm" variant="ghost" disabled={reminded[c.id]} onClick={() => setReminded((r) => ({ ...r, [c.id]: true }))}>
                      {reminded[c.id] ? "Reviewers reminded" : "Remind reviewers"}
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="admin-reports" className="border border-ivory/10 bg-night-2 p-6 sm:p-7">
          <SectionTitle id="admin-reports" icon={TriangleAlert}>
            Community reports
          </SectionTitle>
          <ul className="mt-6 space-y-3">
            {COMMUNITY_REPORTS.map((r) => (
              <li key={r.id} className="rounded-[4px] border border-ivory/[0.08] p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">{r.title}</p>
                  <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[0.74rem]", resolved[r.id] ? "bg-open/15 text-open" : "bg-guided/15 text-guided")}>
                    {resolved[r.id] ? "Resolved" : "Open"}
                  </span>
                </div>
                <p className="mt-1 text-[0.86rem] text-ash">
                  {r.about}. Reported by {r.reportedBy.toLowerCase()}.
                </p>
                <p className="mt-2 text-[0.9rem] text-ivory-dim">{r.detail}</p>
                {!resolved[r.id] && (
                  <Button size="sm" variant="ghost" className="mt-2 -ml-3" onClick={() => setResolved((s) => ({ ...s, [r.id]: true }))}>
                    <Check aria-hidden />
                    Mark resolved
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="admin-feedback" className="border border-ivory/10 bg-night-2 p-6 sm:p-7">
          <SectionTitle id="admin-feedback" icon={MessageSquareText}>
            Feedback
          </SectionTitle>
          <ul className="mt-6 space-y-5">
            {FEEDBACK.map((f) => (
              <li key={f.id}>
                <p className="font-serif text-[1.15rem] italic leading-snug">&ldquo;{f.quote}&rdquo;</p>
                <p className="mt-1 text-[0.84rem] text-ash">{f.from}</p>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="admin-protected" className="border border-ivory/10 bg-night-2 p-6 sm:p-7">
          <SectionTitle id="admin-protected" icon={Lock}>
            Protected practices
          </SectionTitle>
          <p className="mt-4 text-[3rem] font-semibold leading-none">{hydrated ? protectedCount : "–"}</p>
          <p className="mt-2 text-[0.92rem] text-ivory-dim">Registered by custodians. Admins see a count only: no titles, no contents, no controls.</p>
          <div className="mt-6 flex items-center justify-between gap-4 rounded-[4px] border border-protected/30 bg-protected/[0.07] px-4 py-3.5">
            <span className="t-caps">Override</span>
            <span className="text-[0.72rem] font-bold tracking-[0.16em] text-protected">NOT AVAILABLE</span>
          </div>
        </section>

        <div className="xl:col-span-2">
          <OverrideAttempt />
        </div>
      </div>
    </div>
  );
}
