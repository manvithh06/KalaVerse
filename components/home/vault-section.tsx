import { Lock } from "lucide-react";
import { KireetaRings } from "@/components/cultural/ornaments";
import { PROTECTION_LOCKS } from "@/lib/consent";
import { LockedSetting, SealedRecord } from "@/components/vault/vault-parts";

const RECORDS = [
  { title: "Sacred / Restricted Practice", note: "Registered by a Yakshagana custodian" },
  { title: "Community-only Oral Tradition", note: "Held by senior members of a community" },
  { title: "Restricted Cultural Knowledge", note: "Passed on only through apprenticeship" },
];

export function VaultSection() {
  return (
    <section id="protected" aria-labelledby="vault-title" className="relative scroll-mt-16 overflow-hidden bg-vault text-ivory grain">
      <KireetaRings
        rings={7}
        studs={72}
        className="pointer-events-none absolute -right-[20vw] top-10 size-[70vw] max-w-[1000px] text-open/[0.05]"
      />
      <div className="page-gutter relative z-[2] mx-auto max-w-[1440px] py-28 lg:py-40">
        <p className="flex items-center gap-2 text-[0.95rem] text-protected">
          <Lock className="size-4" aria-hidden />
          Protected Culture Vault
        </p>
        <h2 id="vault-title" className="mt-6 max-w-5xl font-titling text-[clamp(2.2rem,5vw,4.8rem)] uppercase leading-[0.98]">
          Preservation doesn&rsquo;t always mean putting culture online.
        </h2>

        <div className="mt-16 grid gap-6 lg:grid-cols-12">
          <div className="grid gap-4 lg:col-span-7">
            {RECORDS.map((r, i) => (
              <SealedRecord key={r.title} title={r.title} note={r.note} index={i} />
            ))}
          </div>
          <aside className="flex flex-col border border-open/[0.14] bg-vault-2 p-6 sm:p-8 lg:col-span-5">
            <h3 className="t-subtitle">What protection switches off</h3>
            <div className="mt-4 divide-y divide-ivory/[0.07] border-y border-ivory/[0.07]">
              {PROTECTION_LOCKS.map((label) => (
                <LockedSetting key={label} label={label} />
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between gap-4 rounded-[4px] border border-protected/30 bg-protected/[0.07] px-4 py-3.5">
              <span className="t-caps text-ivory">Admin override</span>
              <span className="text-[0.72rem] font-bold tracking-[0.16em] text-protected">NOT POSSIBLE</span>
            </div>
            <p className="mt-auto pt-8 font-serif text-[1.1rem] leading-relaxed text-ivory-dim">
              Kalaverse records only that something is protected, so it can be kept out of search, sale and AI. The knowledge itself is never
              uploaded.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
