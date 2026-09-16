"use client";

import { useState } from "react";
import { Check, Lock, Sparkles, X } from "lucide-react";
import type { AIContent, Experience } from "@/types";
import { useKalaverse } from "@/store/kalaverse";
import { useMyExperiences } from "@/store/hooks";
import { useUI } from "@/store/ui";
import { AIStatusPill, AIVetoPanel, type AIDecision } from "@/components/ai/ai-veto-panel";
import { Switch } from "@/components/ui/switch";
import { cn, timeAgo } from "@/lib/utils";

function latestFor(contents: AIContent[], experienceId: string) {
  return contents.find((c) => c.experienceId === experienceId) ?? null;
}

function StatusChip({ experience, content, aiEnabled }: { experience: Experience; content: AIContent | null; aiEnabled: boolean }) {
  const base = "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[0.72rem] font-medium";
  if (experience.consent.accessLevel === "protected")
    return (
      <span className={cn(base, "bg-protected/10 text-protected")}>
        <Lock className="size-3" aria-hidden />
        AI disabled
      </span>
    );
  if (!aiEnabled || !experience.consent.aiAssist) return <span className={cn(base, "bg-ink/[0.06] text-ink-soft")}>Paused</span>;
  if (!content) return <span className={cn(base, "bg-ink/[0.06] text-ink-soft")}>No draft</span>;
  if (content.status === "draft") return <span className={cn(base, "bg-indigo-2/15 text-indigo-2")}>Draft waiting</span>;
  if (content.status === "rejected") return <span className={cn(base, "bg-protected/10 text-protected")}>Rejected</span>;
  return <span className={cn(base, "bg-forest-2/10 text-forest-2")}>{content.status === "edited" ? "Edited" : "Approved"}</span>;
}

export function AIAssistant() {
  const mine = useMyExperiences().filter((e) => e.status === "published");
  const contents = useKalaverse((s) => s.aiContents);
  const aiEnabled = useKalaverse((s) => s.aiEnabled);
  const setAIEnabled = useKalaverse((s) => s.setAIEnabled);
  const setExperienceAI = useKalaverse((s) => s.setExperienceAI);
  const generateAIDraft = useKalaverse((s) => s.generateAIDraft);
  const decideAI = useKalaverse((s) => s.decideAI);
  const reopenAIDecision = useKalaverse((s) => s.reopenAIDecision);
  const toast = useUI((s) => s.toast);

  // Choose the first waiting draft once. Deciding on it must not jump the view to another experience.
  const [selectedId, setSelectedId] = useState<string | null>(
    () => mine.find((e) => e.consent.accessLevel !== "protected" && latestFor(contents, e.id)?.status === "draft")?.id ?? null,
  );
  const selected = mine.find((e) => e.id === selectedId) ?? mine[0];
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const content = selected ? latestFor(contents, selected.id) : null;

  const history = contents
    .filter((c) => c.status !== "draft" && mine.some((e) => e.id === c.experienceId))
    .sort((a, b) => (b.decidedAt ?? "").localeCompare(a.decidedAt ?? ""));

  async function generate() {
    if (!selected) return;
    setGeneratingId(selected.id);
    await new Promise((r) => window.setTimeout(r, 1300));
    const created = generateAIDraft(selected.id);
    setGeneratingId(null);
    if (!created) toast({ title: "AI unavailable here", body: "This practice is protected, or AI assistance is off.", tone: "protected" });
  }

  function decide(decision: AIDecision, text?: string) {
    if (!content) return;
    decideAI(content.id, decision, text);
    toast(
      decision === "rejected"
        ? { title: "Rejected by custodian", body: "Nothing was published.", tone: "protected" }
        : { title: decision === "edited" ? "Edited and approved by custodian" : "Approved by custodian", body: "It is now the public description.", tone: "open" },
    );
  }

  return (
    <div>
      <header className="page-gutter mx-auto max-w-[1280px] pb-8 pt-8 lg:pt-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h1 className="font-titling text-[clamp(2rem,4.2vw,3.6rem)] uppercase leading-[0.98]">
            AI can help tell your story.
            <span className="mt-2 block text-indigo-2">You decide whether it gets told.</span>
          </h1>
          <label className="flex h-12 cursor-pointer items-center gap-3 rounded-full border border-ink/15 bg-paper pl-4 pr-2 text-[0.92rem]">
            <Sparkles className="size-4 text-indigo-2" aria-hidden />
            AI assistance
            <Switch checked={aiEnabled} onCheckedChange={setAIEnabled} />
          </label>
        </div>
      </header>

      <div className="page-gutter mx-auto max-w-[1280px] pb-20">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 bg-night px-6 py-5 text-ivory">
          <p className="font-titling text-[clamp(1.15rem,2.1vw,1.6rem)] uppercase leading-tight">AI never defines culture. The custodian does.</p>
          <AIStatusPill state={aiEnabled ? "assistant" : "paused"} />
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
          <nav aria-label="Choose an experience" className="lg:sticky lg:top-6 lg:self-start">
            <ul className="scrollbar-none -mx-1 flex gap-2 overflow-x-auto px-1 pb-2 lg:mx-0 lg:block lg:space-y-1.5 lg:overflow-visible lg:px-0">
              {mine.map((e) => {
                const on = selected?.id === e.id;
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
                      <StatusChip experience={e} content={latestFor(contents, e.id)} aiEnabled={aiEnabled} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="space-y-10">
            {selected && (
              <AIVetoPanel
                key={selected.id}
                experience={selected}
                content={content}
                aiEnabled={aiEnabled}
                generating={generatingId === selected.id}
                onGenerate={generate}
                onDecide={decide}
                onReopen={() => content && reopenAIDecision(content.id)}
                onEnable={() => (aiEnabled ? setExperienceAI(selected.id, true) : setAIEnabled(true))}
              />
            )}

            <section aria-labelledby="ai-history" className="border border-ink/10 bg-paper">
              <h2 id="ai-history" className="border-b border-ink/10 px-6 py-4 text-[1rem] font-medium">
                Your decisions
              </h2>
              {history.length ? (
                <ul className="divide-y divide-ink/[0.07]">
                  {history.map((c) => {
                    const exp = mine.find((e) => e.id === c.experienceId);
                    const rejected = c.status === "rejected";
                    return (
                      <li key={c.id} className="flex items-start gap-4 px-6 py-4">
                        <span className={cn("mt-0.5 grid size-7 shrink-0 place-items-center rounded-full", rejected ? "bg-protected/10 text-protected" : "bg-forest-2/10 text-forest-2")}>
                          {rejected ? <X className="size-4" aria-hidden /> : <Check className="size-4" aria-hidden />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[0.95rem]">
                            <span className="font-medium">{rejected ? "Rejected" : c.status === "edited" ? "Edited and approved" : "Approved"}</span>
                            <span className="text-ink-soft"> for {exp?.title}</span>
                          </p>
                          <p className="mt-1 line-clamp-2 font-serif text-[0.95rem] text-ink-soft">{c.finalText ?? c.draft}</p>
                        </div>
                        <span className="shrink-0 text-[0.78rem] text-ink-faint">{c.decidedAt ? timeAgo(c.decidedAt) : ""}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="px-6 py-8 text-[0.95rem] text-ink-soft">No decisions yet.</p>
              )}
            </section>

            <section aria-label="How the assistant works" className="grid gap-px border border-ink/10 bg-ink/10 md:grid-cols-3">
              {[
                ["Drafts use only what you published", "Title, practice, place, languages and terms. The assistant has no other source."],
                ["Protected practices are never sent", "Nothing about a protected practice reaches the assistant, in any form."],
                ["Every decision is yours", "Approve, edit or reject. Rejected drafts are never published anywhere."],
              ].map(([title, body]) => (
                <div key={title} className="bg-paper p-6">
                  <p className="font-medium">{title}</p>
                  <p className="mt-2 text-[0.92rem] leading-relaxed text-ink-soft">{body}</p>
                </div>
              ))}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
