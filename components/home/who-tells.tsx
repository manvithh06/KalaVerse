import { cn } from "@/lib/utils";

function Chain({
  title,
  steps,
  outcome,
  tone,
}: {
  title: string;
  steps: string[];
  outcome: string;
  tone: "extractive" | "custodial";
}) {
  const custodial = tone === "custodial";
  return (
    <div className={cn("relative border p-7 sm:p-10", custodial ? "border-forest-2/40 bg-forest/[0.06]" : "border-dashed border-ink/20")}>
      <h3 className={cn("text-[0.95rem] font-medium", custodial ? "text-forest-2" : "text-ink-faint")}>{title}</h3>
      <ol className="mt-8">
        {steps.map((step, i) => (
          <li key={step}>
            <span
              className={cn(
                "block font-titling text-[clamp(1.9rem,3.4vw,2.9rem)] uppercase leading-none",
                custodial ? "text-ink" : "text-ink/35",
              )}
            >
              {step}
            </span>
            {i < steps.length - 1 && (
              <span aria-hidden className={cn("my-2 block pl-1 text-xl leading-none", custodial ? "text-gold-deep" : "text-ink/25")}>
                ↓
              </span>
            )}
          </li>
        ))}
      </ol>
      <p
        className={cn(
          "mt-8 inline-flex items-center gap-3 border-t pt-5 font-serif text-[1.35rem] italic",
          custodial ? "border-forest-2/30 text-forest-2" : "border-ink/15 text-protected line-through decoration-1",
        )}
      >
        {outcome}
      </p>
    </div>
  );
}

const OBSERVATIONS = [
  "Moments that are sacred to a community end up photographed and posted without anyone asking.",
  "Descriptions get written, and now generated, without anyone from the community reading them.",
  "The people who carry a tradition often see the smallest share of what visitors pay.",
];

export function WhoTellsTheStory() {
  return (
    <section aria-labelledby="who-tells" className="bg-paper text-ink">
      <div className="page-gutter mx-auto max-w-[1440px] py-28 lg:py-40">
        <div className="grid gap-10 lg:grid-cols-12">
          <h2 id="who-tells" className="font-titling text-[clamp(2.4rem,5.8vw,5.6rem)] uppercase leading-[0.95] lg:col-span-8">
            Who gets to
            <br />
            tell the story?
          </h2>
          <p className="self-end text-[1.05rem] leading-relaxed text-ink-soft lg:col-span-4">
            Cultural tourism usually starts with what a visitor wants to see. Kalaverse starts with what a community agrees to share.
          </p>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          <Chain title="How cultural tourism usually works" steps={["Tourist", "Listing", "Photos", "Reviews"]} outcome="Culture becomes content" tone="extractive" />
          <Chain title="How Kalaverse works" steps={["Custodian", "Terms", "Consent", "Experience"]} outcome="Culture stays culture" tone="custodial" />
        </div>

        <ul className="mt-20 grid gap-10 border-t border-ink/10 pt-10 md:grid-cols-3">
          {OBSERVATIONS.map((line) => (
            <li key={line} className="font-serif text-[1.2rem] leading-snug text-ink">
              {line}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
