import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AuthorityGrid, PlatformStatement, WorkflowStepper } from "@/components/governance/governance-view";

export function GovernanceSection() {
  return (
    <section aria-labelledby="gov-home" className="bg-night-2 text-ivory">
      <div className="page-gutter mx-auto max-w-[1440px] py-28 lg:py-40">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="gov-home" className="font-titling text-[clamp(2.3rem,4.8vw,4.6rem)] uppercase leading-[0.96]">
              Community
              <br />
              governance
            </h2>
            <p className="mt-6 max-w-md text-[1.02rem] leading-relaxed text-ivory-dim">
              Listings pass through the custodian&apos;s own community before they go live. The platform hosts them. It never approves
              culture on anyone&apos;s behalf.
            </p>
            <Button asChild variant="outline" className="mt-8">
              <Link href="/governance">See who can do what</Link>
            </Button>
          </div>
          <div className="lg:col-span-7">
            <WorkflowStepper />
          </div>
        </div>
        <div className="mt-20">
          <AuthorityGrid />
        </div>
        <PlatformStatement className="mt-24 max-w-5xl" />
      </div>
    </section>
  );
}
