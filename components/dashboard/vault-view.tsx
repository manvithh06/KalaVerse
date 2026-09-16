"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Unlock } from "lucide-react";
import type { Experience, VaultRecord } from "@/types";
import { useKalaverse } from "@/store/kalaverse";
import { useMyExperiences } from "@/store/hooks";
import { useUI } from "@/store/ui";
import { KireetaRings } from "@/components/cultural/ornaments";
import { EmptyState } from "@/components/cultural/states";
import { AnimatedLock } from "@/components/consent/animated-lock";
import { PROTECTION_LOCKS } from "@/lib/consent";
import { LockedSetting, SealedRecord } from "@/components/vault/vault-parts";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, Input, Select } from "@/components/ui/field";
import { ReleaseDialog } from "./release-dialog";
import { formatDate } from "@/lib/utils";

const KIND_LABEL: Record<VaultRecord["kind"], string> = {
  sacred: "Sacred practice",
  oral: "Oral tradition",
  knowledge: "Restricted knowledge",
};

function AddRecordDialog() {
  const addVaultRecord = useKalaverse((s) => s.addVaultRecord);
  const toast = useUI((s) => s.toast);
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [kind, setKind] = useState<VaultRecord["kind"]>("oral");
  const [keepers, setKeepers] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (label.trim().length < 4) {
      setError("Give the record a label of at least 4 characters.");
      return;
    }
    addVaultRecord(label, kind, keepers || "Held within the community");
    toast({ title: "Sealed record added", body: "Only its label is stored.", tone: "protected" });
    setLabel("");
    setKeepers("");
    setError("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus aria-hidden />
          Add a sealed record
        </Button>
      </DialogTrigger>
      <DialogContent tone="vault">
        <DialogTitle>Add a sealed record</DialogTitle>
        <DialogDescription>
          Record that something must stay within your community. Write a label only. Do not describe the practice or its knowledge.
        </DialogDescription>
        <form
          noValidate
          className="mt-6 grid gap-5"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Field id="vault-label" tone="dark" label="Label" error={error} hint="For example: “Songs sung only at family occasions”">
            <Input id="vault-label" tone="dark" value={label} onChange={(e) => setLabel(e.target.value)} aria-invalid={Boolean(error)} />
          </Field>
          <Field id="vault-kind" tone="dark" label="Kind">
            <Select id="vault-kind" tone="dark" value={kind} onChange={(e) => setKind(e.target.value as VaultRecord["kind"])}>
              {(Object.keys(KIND_LABEL) as VaultRecord["kind"][]).map((k) => (
                <option key={k} value={k}>
                  {KIND_LABEL[k]}
                </option>
              ))}
            </Select>
          </Field>
          <Field id="vault-keepers" tone="dark" label="Held by" optional>
            <Input id="vault-keepers" tone="dark" value={keepers} onChange={(e) => setKeepers(e.target.value)} placeholder="Senior members of the troupe" />
          </Field>
          <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="protected" caps>
              Seal record
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function VaultView() {
  const mine = useMyExperiences();
  const records = useKalaverse((s) => s.vaultRecords);
  const [releasing, setReleasing] = useState<Experience | null>(null);
  const protectedItems = mine.filter((e) => e.consent.accessLevel === "protected");

  return (
    <div className="relative overflow-hidden text-ivory">
      <KireetaRings rings={7} studs={72} className="pointer-events-none absolute -right-60 -top-40 size-[900px] text-open/[0.05]" />
      <header className="page-gutter relative mx-auto max-w-[1280px] pb-12 pt-10 lg:pt-14">
        <div className="flex items-center gap-4 text-protected">
          <AnimatedLock className="size-12" />
          <span className="t-caps">Protected Vault</span>
        </div>
        <h1 className="mt-8 max-w-4xl font-titling text-[clamp(2rem,4.6vw,4rem)] uppercase leading-[0.98]">
          Preservation doesn&rsquo;t always mean putting culture online.
        </h1>
        <p className="mt-6 max-w-2xl text-[1.02rem] leading-relaxed text-ivory-dim">
          Kalaverse records that these exist so it can keep them out of discovery, sale, search and AI. What they contain is never stored here.
        </p>
      </header>

      <div className="page-gutter relative mx-auto grid max-w-[1280px] gap-8 pb-20 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-14">
          <section aria-labelledby="protected-practices">
            <h2 id="protected-practices" className="t-subtitle">
              Protected practices ({protectedItems.length})
            </h2>
            {protectedItems.length ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {protectedItems.map((e, i) => (
                  <SealedRecord
                    key={e.id}
                    index={i}
                    title={e.title}
                    note={`Protected since ${formatDate(e.consent.updatedAt)}, terms version ${e.consent.termsVersion}`}
                    footer={
                      <div className="flex flex-wrap gap-2">
                        <Button variant="ghost" size="sm" onClick={() => setReleasing(e)}>
                          <Unlock aria-hidden />
                          Release
                        </Button>
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/custodian/experiences/${e.id}/edit`}>Edit private details</Link>
                        </Button>
                      </div>
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="Nothing is protected yet"
                body="Move a practice into protection from My Culture, or choose Protected when you create an experience."
                action={
                  <Button asChild variant="outline">
                    <Link href="/custodian/culture">Open My Culture</Link>
                  </Button>
                }
                className="mt-5 border border-dashed border-ivory/15"
              />
            )}
          </section>

          <section aria-labelledby="sealed-records">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 id="sealed-records" className="t-subtitle">
                Sealed records ({records.length})
              </h2>
              <AddRecordDialog />
            </div>
            <p className="mt-2 max-w-2xl text-[0.92rem] text-ash">
              Knowledge that is not an experience at all: songs, stories or skills that stay within the community. Only the label is kept.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {records.map((r, i) => (
                <SealedRecord key={r.id} index={i} title={r.label} note={`${KIND_LABEL[r.kind]}. ${r.keepers}. Sealed ${formatDate(r.sealedAt)}`} />
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="border border-open/[0.14] bg-vault-2 p-6">
            <h2 className="t-subtitle">Applied to everything here</h2>
            <div className="mt-4 divide-y divide-ivory/[0.07] border-y border-ivory/[0.07]">
              {PROTECTION_LOCKS.map((label) => (
                <LockedSetting key={label} label={label} />
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between gap-4 rounded-[4px] border border-protected/30 bg-protected/[0.07] px-4 py-3.5">
              <span className="t-caps text-ivory">Admin override</span>
              <span className="text-[0.72rem] font-bold tracking-[0.16em] text-protected">NOT POSSIBLE</span>
            </div>
          </div>
          <div className="border border-ivory/10 p-6">
            <h2 className="text-[0.95rem] font-medium">Who can change this</h2>
            <p className="mt-2 text-[0.92rem] leading-relaxed text-ivory-dim">
              Only you, with your community&apos;s consent. Platform administrators have no control for it, so there is nothing to approve and
              nothing to bypass.
            </p>
          </div>
        </aside>
      </div>

      <ReleaseDialog experience={releasing} open={Boolean(releasing)} onOpenChange={(o) => !o && setReleasing(null)} />
    </div>
  );
}
