"use client";

import Link from "next/link";
import { CircleSlash, Feather, Lock, MapPin, Package } from "lucide-react";
import { useKalaverse } from "@/store/kalaverse";
import { useCustodian, useHydrated } from "@/store/hooks";
import { isDiscoverable } from "@/lib/consent";
import { CulturalPlate } from "@/components/cultural/plates";
import { EmptyState, KireetaLoader } from "@/components/cultural/states";
import { TrustBadge } from "@/components/cultural/trust-badge";
import { ExperienceCard } from "@/components/experience/experience-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatINR, formatLanguages } from "@/lib/utils";

export function PublicProfile({ id }: { id: string }) {
  const hydrated = useHydrated();
  const custodian = useCustodian(id);
  const experiences = useKalaverse((s) => s.experiences);
  const products = useKalaverse((s) => s.products);

  if (!hydrated) {
    return (
      <div className="grid min-h-[90vh] place-items-center bg-night">
        <KireetaLoader label="Loading profile" />
      </div>
    );
  }

  if (!custodian) {
    return (
      <div className="page-gutter mx-auto max-w-3xl pb-24 pt-32">
        <EmptyState
          icon={<CircleSlash className="size-6" aria-hidden />}
          title="Custodian not found"
          body="This profile doesn't exist, or its custodian has removed it."
          action={
            <Button asChild variant="outline">
              <Link href="/discover">Back to discovery</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const theirs = experiences.filter((e) => e.custodianId === custodian.id);
  const listed = theirs.filter(isDiscoverable);
  const keepsProtected = theirs.some((e) => e.status === "published" && e.consent.accessLevel === "protected");
  const theirProducts = products.filter((p) => p.custodianId === custodian.id);
  const firstName = custodian.name.split(" ")[0];

  return (
    <div className="bg-night text-ivory">
      <section className="relative overflow-hidden">
        <CulturalPlate motif={custodian.motif} className="absolute inset-0 opacity-45" />
        <div aria-hidden className="absolute inset-0 z-[2] bg-[linear-gradient(0deg,#110d0b_6%,rgb(17_13_11/0.86)_45%,rgb(17_13_11/0.5)_100%)]" />
        <div className="page-gutter relative z-[3] mx-auto max-w-[1280px] pb-14 pt-32 lg:pt-40">
          <TrustBadge level={custodian.trustLevel} />
          <h1 className="mt-6 font-titling text-[clamp(2.6rem,6.6vw,6rem)] uppercase leading-[0.92]">{custodian.name}</h1>
          <p className="mt-4 flex items-center gap-2 text-[1.05rem] text-ivory-dim">
            <MapPin className="size-4" aria-hidden />
            {custodian.location}
          </p>
          <p className="t-voice mt-8 max-w-2xl text-ivory">{custodian.bio}</p>
          <dl className="mt-12 grid max-w-4xl grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
            {[
              ["Specialization", custodian.specialization],
              ["Languages", formatLanguages(custodian.languages).replaceAll(" + ", " / ")],
              ["Experience count", String(custodian.experiencesHosted)],
              ["Community endorsements", String(custodian.endorsements)],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-[0.82rem] text-ash">{label}</dt>
                <dd className="mt-1.5 text-[1.05rem]">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-10 flex items-center gap-2 text-[0.88rem] text-ash">
            <Feather className="size-4" aria-hidden />
            Every word on this page was written by {firstName}.
          </p>
        </div>
      </section>

      <div className="page-gutter mx-auto max-w-[1280px] pb-24">
        <Tabs defaultValue="experiences">
          <TabsList aria-label={`${custodian.name}'s profile`}>
            <TabsTrigger value="experiences">Experiences ({listed.length})</TabsTrigger>
            <TabsTrigger value="products">Products ({theirProducts.length})</TabsTrigger>
            <TabsTrigger value="story">Community story</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
          </TabsList>

          <TabsContent value="experiences" className="pt-8">
            {listed.length ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {listed.map((e) => (
                  <ExperienceCard key={e.id} experience={e} />
                ))}
              </div>
            ) : (
              <EmptyState title="No experiences listed" body={`${firstName} isn't sharing any experiences publicly right now.`} className="border border-dashed border-ivory/10" />
            )}
            {keepsProtected && (
              <p className="mt-8 flex items-center gap-2 text-[0.92rem] text-ash">
                <Lock className="size-4 text-protected" aria-hidden />
                Some of {firstName}&apos;s practices are kept within the community and are not listed.
              </p>
            )}
          </TabsContent>

          <TabsContent value="products" className="pt-8">
            {theirProducts.length ? (
              <ul className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {theirProducts.map((p) => (
                  <li key={p.id} className="flex gap-4 bg-night-2 p-4">
                    <CulturalPlate motif={p.motif} className="size-24 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[0.8rem] text-gold-light">{p.craft}</p>
                      <p className="mt-1 font-medium leading-snug">{p.name}</p>
                      <p className="mt-2 font-semibold">{formatINR(p.price)}</p>
                      <Link href="/crafts" className="mt-2 inline-flex text-[0.86rem] underline decoration-gold/50 underline-offset-4">
                        Buy directly from the maker
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={<Package className="size-6" aria-hidden />}
                title="No products"
                body={`${firstName} hasn't listed any handmade pieces.`}
                className="border border-dashed border-ivory/10"
              />
            )}
          </TabsContent>

          <TabsContent value="story" className="pt-10">
            <div className="grid gap-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
              <div className="space-y-6">
                {custodian.story.map((p) => (
                  <p key={p} className="max-w-[62ch] font-serif text-[1.25rem] leading-[1.7] text-ivory">
                    {p}
                  </p>
                ))}
              </div>
              <aside className="self-start border-l-2 border-gold pl-6">
                <p className="text-[0.86rem] text-ash">Endorsed by</p>
                <ul className="mt-3 space-y-2">
                  {custodian.endorsedBy.map((e) => (
                    <li key={e} className="text-[1.02rem]">
                      {e}
                    </li>
                  ))}
                </ul>
                <p className="mt-6 text-[0.86rem] text-ash">Community</p>
                <p className="mt-1 text-[1.02rem]">{custodian.community}</p>
              </aside>
            </div>
          </TabsContent>

          <TabsContent value="rules" className="pt-10">
            <ul className="max-w-3xl divide-y divide-ivory/[0.08] border-y border-ivory/[0.08]">
              {custodian.rules.map((r) => (
                <li key={r} className="flex gap-4 py-4 text-[1.05rem]">
                  <span aria-hidden className="mt-2.5 h-px w-4 shrink-0 bg-gold" />
                  {r}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-[0.92rem] text-ash">Each experience also carries its own Cultural Consent terms.</p>
          </TabsContent>
        </Tabs>
        <p className="mt-16 text-[0.8rem] text-ash">Fictional demo profile.</p>
      </div>
    </div>
  );
}
