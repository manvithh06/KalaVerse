"use client";

import { useState } from "react";
import type { AIContent } from "@/types";
import { HERO_EXPERIENCE_ID, seedExperiences } from "@/data/experiences";
import { createSeedAIContents } from "@/data/seed";
import { AIVetoPanel } from "@/components/ai/ai-veto-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const hero = seedExperiences.find((e) => e.id === HERO_EXPERIENCE_ID)!;
const protectedPractice = seedExperiences.find((e) => e.consent.accessLevel === "protected")!;
const seedDraft = createSeedAIContents(new Date("2026-01-01T00:00:00.000Z")).find((c) => c.experienceId === HERO_EXPERIENCE_ID)!;

export function AISection() {
  const [content, setContent] = useState<AIContent>(seedDraft);

  return (
    <section aria-labelledby="ai-title" className="relative bg-night text-ivory">
      <div className="page-gutter mx-auto grid max-w-[1440px] gap-14 py-28 lg:grid-cols-12 lg:py-40">
        <div className="lg:col-span-5">
          <h2 id="ai-title" className="font-titling text-[clamp(2.1rem,4.2vw,4rem)] uppercase leading-[0.98]">
            AI can help tell your story.
            <span className="mt-3 block text-indigo-light">You decide whether it gets told.</span>
          </h2>
          <p className="mt-8 max-w-md text-[1.02rem] leading-relaxed text-ivory-dim">
            The assistant drafts. The custodian approves, edits or rejects. Nothing it writes reaches a visitor without that decision, and it is
            switched off entirely for protected practices.
          </p>
          <p className="mt-14 border-l-2 border-indigo-2 pl-5 font-titling text-[clamp(1.4rem,2.2vw,1.9rem)] uppercase leading-tight">
            AI never defines culture.
            <br />
            The custodian does.
          </p>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <Tabs defaultValue="guided">
            <TabsList aria-label="Choose an example">
              <TabsTrigger value="guided">A guided experience</TabsTrigger>
              <TabsTrigger value="protected">A protected practice</TabsTrigger>
            </TabsList>
            <TabsContent value="guided" className="pt-6">
              <AIVetoPanel
                experience={hero}
                content={content}
                aiEnabled
                onDecide={(decision, text) =>
                  setContent((c) => ({
                    ...c,
                    status: decision,
                    decidedAt: new Date().toISOString(),
                    finalText: decision === "rejected" ? undefined : decision === "edited" ? text : c.draft,
                  }))
                }
                onReopen={() => setContent(seedDraft)}
              />
              <p className="mt-4 text-[0.85rem] text-ash">
                Try rejecting it: the draft invites photography, which this custodian does not allow.
              </p>
            </TabsContent>
            <TabsContent value="protected" className="pt-6">
              <AIVetoPanel experience={protectedPractice} content={null} aiEnabled onDecide={() => undefined} onReopen={() => undefined} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
