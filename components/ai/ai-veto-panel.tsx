"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Pencil, RotateCcw, Sparkles, TriangleAlert, X } from "lucide-react";
import type { AIContent, Experience } from "@/types";
import { findTermConflicts } from "@/lib/consent";
import { DRAFT_SOURCES } from "@/lib/ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/field";
import { AnimatedLock } from "@/components/consent/animated-lock";
import { cn, timeAgo } from "@/lib/utils";

export type AIDecision = "approved" | "rejected" | "edited";

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Highlighted({ text, phrases }: { text: string; phrases: string[] }) {
  if (!phrases.length) return <>{text}</>;
  const pattern = new RegExp(`(${phrases.map(escapeRegExp).join("|")})`, "gi");
  return (
    <>
      {text.split(pattern).map((part, i) =>
        phrases.some((p) => p.toLowerCase() === part.toLowerCase()) ? (
          <mark key={i} className="rounded-[2px] bg-protected/20 px-0.5 text-ivory underline decoration-protected decoration-2 underline-offset-4">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function Stamp({ status }: { status: "approved" | "edited" | "rejected" }) {
  const rejected = status === "rejected";
  return (
    <motion.div
      key={status}
      initial={{ opacity: 0, scale: 1.5, rotate: -12 }}
      animate={{ opacity: 1, scale: 1, rotate: -3 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 520, damping: 32 }}
      className={cn(
        "mb-5 inline-flex items-center gap-2 rounded-[2px] border-2 px-3 py-1.5 font-sans text-[0.72rem] font-bold uppercase tracking-[0.18em]",
        rejected ? "border-protected text-protected" : "border-open text-open",
      )}
    >
      {rejected ? <X className="size-4" strokeWidth={3} aria-hidden /> : <Check className="size-4" strokeWidth={3} aria-hidden />}
      {rejected ? "Rejected by custodian" : status === "edited" ? "Edited & approved by custodian" : "Approved by custodian"}
    </motion.div>
  );
}

export function AIStatusPill({ state }: { state: "assistant" | "disabled" | "paused" }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center gap-2 rounded-full border px-3 font-sans text-[0.64rem] font-semibold uppercase tracking-[0.16em] [font-stretch:88%]",
        state === "assistant" && "border-indigo-2/50 text-indigo-light",
        state === "disabled" && "border-protected/50 text-protected",
        state === "paused" && "border-ivory/20 text-ash",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          state === "assistant" && "bg-indigo-light motion-safe:animate-breathe",
          state === "disabled" && "bg-protected",
          state === "paused" && "bg-ash",
        )}
      />
      {state === "assistant" ? "Assistant only" : state === "disabled" ? "AI disabled" : "Paused by you"}
    </span>
  );
}

export function AIVetoPanel({
  experience,
  content,
  aiEnabled,
  generating = false,
  onGenerate,
  onDecide,
  onReopen,
  onEnable,
  className,
}: {
  experience: Experience;
  content: AIContent | null;
  aiEnabled: boolean;
  generating?: boolean;
  onGenerate?: () => void;
  onDecide: (decision: AIDecision, text?: string) => void;
  onReopen: () => void;
  onEnable?: () => void;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState("");
  const isProtected = experience.consent.accessLevel === "protected";
  const paused = !aiEnabled || !experience.consent.aiAssist;
  const status = content?.status;
  const decided = status === "approved" || status === "edited" || status === "rejected";

  const conflicts = useMemo(
    () => (content && status === "draft" ? findTermConflicts(content.draft, experience.consent) : []),
    [content, status, experience.consent],
  );

  const frame = isProtected
    ? "border-protected/35"
    : status === "rejected"
      ? "border-protected/60"
      : status === "approved" || status === "edited"
        ? "border-open/50"
        : "border-indigo-2/35";

  const wash = isProtected
    ? "rgb(180 73 79 / 0.05)"
    : status === "rejected"
      ? "rgb(180 73 79 / 0.1)"
      : status === "approved" || status === "edited"
        ? "rgb(94 156 117 / 0.07)"
        : "rgb(102 96 168 / 0.06)";

  return (
    <section
      aria-label="AI draft review"
      className={cn("relative overflow-hidden rounded-[6px] border bg-night-2 text-ivory transition-colors duration-700", frame, className)}
    >
      <motion.div aria-hidden className="pointer-events-none absolute inset-0" animate={{ backgroundColor: wash }} transition={{ duration: 0.7 }} />

      <header className="relative flex flex-wrap items-center justify-between gap-3 border-b border-ivory/[0.08] px-5 py-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <Sparkles className={cn("size-4", isProtected ? "text-ash" : "text-indigo-light")} aria-hidden />
          <span className="text-[0.92rem] font-medium">AI draft</span>
          <span className="truncate text-[0.82rem] text-ash">{isProtected ? "Protected practice" : experience.title}</span>
        </div>
        <AIStatusPill state={isProtected ? "disabled" : paused ? "paused" : "assistant"} />
      </header>

      <div className="relative px-5 py-6 sm:px-6" aria-live="polite">
        {isProtected ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="text-protected">
              <AnimatedLock className="size-12" />
            </div>
            <p className="t-caps mt-5 text-protected">Protected content</p>
            <p className="t-subtitle mt-2">AI assistance disabled.</p>
            <p className="mt-3 max-w-sm text-[0.92rem] leading-relaxed text-ivory-dim">
              Protected practices cannot be described, summarised or drafted by AI. Nothing about this practice is sent to the assistant.
            </p>
          </div>
        ) : paused ? (
          <div className="py-4">
            <p className="t-subtitle">AI assistance is paused</p>
            <p className="mt-3 max-w-md text-[0.92rem] leading-relaxed text-ivory-dim">
              {aiEnabled
                ? "You've turned AI off for this experience. Its description stays exactly as you wrote it."
                : "You've paused AI across your workspace. Nothing is drafted until you turn it back on."}
            </p>
            {onEnable && (
              <Button variant="outline" size="sm" className="mt-5" onClick={onEnable}>
                Turn AI assistance on
              </Button>
            )}
          </div>
        ) : generating ? (
          <div role="status" className="space-y-3 py-2">
            <p className="flex items-center gap-2 text-[0.875rem] text-indigo-light">
              <span className="size-2 rounded-full bg-indigo-light motion-safe:animate-breathe" aria-hidden />
              Drafting from your published details
            </p>
            {[100, 94, 97, 62].map((w, i) => (
              <div
                key={i}
                className="h-4 animate-shimmer rounded-[2px] bg-[linear-gradient(90deg,rgb(169_164_226/0.06),rgb(169_164_226/0.2),rgb(169_164_226/0.06))] bg-[length:200%_100%]"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        ) : !content ? (
          <div className="py-4">
            <p className="t-subtitle">No draft yet</p>
            <p className="mt-3 max-w-md text-[0.92rem] leading-relaxed text-ivory-dim">
              The assistant can draft a description from details you have already published. Nothing is used until you approve it.
            </p>
            {onGenerate && (
              <Button variant="indigo" size="sm" className="mt-5" onClick={onGenerate}>
                <Sparkles aria-hidden />
                Draft a description
              </Button>
            )}
          </div>
        ) : editing ? (
          <div>
            <label htmlFor={`ai-edit-${content.id}`} className="text-[0.875rem] font-medium text-ivory">
              Your version
            </label>
            <Textarea
              id={`ai-edit-${content.id}`}
              tone="dark"
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              className="mt-2 min-h-44 font-serif text-[1.05rem] leading-relaxed"
              autoFocus
            />
            <p className="mt-2 text-[0.8rem] text-ash">Only your edited words will be published.</p>
          </div>
        ) : (
          <div>
            <AnimatePresence mode="wait">{decided && <Stamp status={status as "approved" | "edited" | "rejected"} />}</AnimatePresence>
            <blockquote
              className={cn(
                "font-serif text-[1.08rem] leading-[1.75] transition-[color,opacity] duration-500 sm:text-[1.15rem]",
                status === "rejected" ? "text-ash line-through decoration-protected/50" : "text-ivory",
              )}
            >
              <Highlighted text={content.finalText ?? content.draft} phrases={conflicts.map((c) => c.phrase)} />
            </blockquote>
            {conflicts.length > 0 && (
              <div className="mt-5 flex gap-3 rounded-[4px] border border-guided/35 bg-guided/[0.08] p-3.5 text-[0.875rem] leading-snug text-ivory">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-guided" aria-hidden />
                <p>
                  This draft conflicts with your terms.{" "}
                  {conflicts.map((c) => `"${c.phrase}": ${c.rule.toLowerCase()}.`).join(" ")}
                </p>
              </div>
            )}
            {status === "draft" && content.grounded && (
              <div className="mt-5 flex flex-wrap items-center gap-1.5 text-[0.75rem] text-ash">
                <span className="mr-1">Drawn only from</span>
                {DRAFT_SOURCES.map((s) => (
                  <span key={s} className="rounded-full border border-ivory/10 px-2 py-0.5">
                    {s}
                  </span>
                ))}
              </div>
            )}
            {status === "rejected" && (
              <p className="mt-4 text-[0.9rem] text-ivory-dim">Not published. The description stays in your own words.</p>
            )}
            {(status === "approved" || status === "edited") && (
              <p className="mt-4 text-[0.9rem] text-ivory-dim">This is now the public description, marked as AI-assisted and approved by you.</p>
            )}
          </div>
        )}
      </div>

      {!isProtected && !paused && !generating && content && (
        <footer className="relative flex flex-wrap items-center gap-2 border-t border-ivory/[0.08] px-5 py-4 sm:px-6">
          {editing ? (
            <>
              <Button
                variant="open"
                caps
                disabled={!draftText.trim()}
                onClick={() => {
                  onDecide("edited", draftText);
                  setEditing(false);
                }}
              >
                <Check aria-hidden />
                Save my version
              </Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </>
          ) : status === "draft" ? (
            <>
              <Button variant="open" caps onClick={() => onDecide("approved")}>
                <Check aria-hidden />
                Approve
              </Button>
              <Button
                variant="outline"
                caps
                onClick={() => {
                  setDraftText(content.draft);
                  setEditing(true);
                }}
              >
                <Pencil aria-hidden />
                Edit
              </Button>
              <Button variant="outline" caps className="border-protected/50 text-protected hover:border-protected hover:bg-protected/10" onClick={() => onDecide("rejected")}>
                <X aria-hidden />
                Reject
              </Button>
            </>
          ) : (
            <>
              <span className="mr-auto text-[0.8rem] text-ash">
                Decided by the custodian{content.decidedAt ? `, ${timeAgo(content.decidedAt).toLowerCase()}` : ""}
              </span>
              {status === "rejected" && onGenerate && (
                <Button variant="ghost" size="sm" onClick={onGenerate}>
                  <Sparkles aria-hidden />
                  Draft again
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={onReopen}>
                <RotateCcw aria-hidden />
                Undo decision
              </Button>
            </>
          )}
        </footer>
      )}
    </section>
  );
}
