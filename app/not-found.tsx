import Link from "next/link";
import { KalaverseMark, KireetaRings } from "@/components/cultural/ornaments";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-night px-6 text-center text-ivory">
      <KireetaRings rings={6} studs={60} className="pointer-events-none absolute left-1/2 top-1/2 size-[min(150vw,900px)] -translate-x-1/2 -translate-y-1/2 text-gold/[0.07]" />
      <div className="relative">
        <KalaverseMark className="mx-auto size-12 text-ivory" />
        <p className="t-caps mt-8 text-gold-light">Page not found</p>
        <h1 className="mt-4 font-titling text-[clamp(2.2rem,6vw,4.8rem)] uppercase leading-[0.95]">
          This path isn&apos;t
          <br />
          on the map.
        </h1>
        <p className="mx-auto mt-5 max-w-md text-ivory-dim">It may never have existed, or its custodian may have chosen not to share it.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/" className={buttonVariants({ caps: true })}>
            Return home
          </Link>
          <Link href="/discover" className={buttonVariants({ variant: "outline", caps: true })}>
            Discover Karnataka
          </Link>
        </div>
      </div>
    </main>
  );
}
