import Link from "next/link";
import { KalaverseMark } from "@/components/cultural/ornaments";
import { ResetDemoButton } from "./reset-demo";

const COLUMNS = [
  {
    title: "Visit",
    links: [
      { href: "/discover", label: "Discover Karnataka" },
      { href: "/experiences", label: "Your experiences" },
      { href: "/crafts", label: "Handmade crafts" },
      { href: "/impact", label: "Impact" },
    ],
  },
  {
    title: "Custodians",
    links: [
      { href: "/register", label: "Become a custodian" },
      { href: "/custodian", label: "Custodian workspace" },
      { href: "/governance", label: "Community governance" },
      { href: "/admin", label: "Platform admin" },
    ],
  },
];

const COMMITMENTS = [
  "Protected practices are never listed, booked or described by AI.",
  "Every booking begins with the custodian's terms.",
  "No administrator can override a custodian's protection.",
];

export function SiteFooter() {
  return (
    <footer className="relative bg-night-2 pb-16 text-ivory lg:pb-0">
      <div className="text-gold">
        <div className="tile-rule" />
      </div>
      <div className="page-gutter mx-auto grid max-w-[1440px] gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <Link href="/" className="inline-flex items-center gap-3" aria-label="Kalaverse, home">
            <KalaverseMark className="size-9" />
            <span className="font-titling text-xl tracking-[0.22em]">KALAVERSE</span>
          </Link>
          <p className="t-voice mt-6 text-ivory-dim">Culture on Their Terms.</p>
          <p className="mt-3 max-w-xs text-[0.9rem] leading-relaxed text-ash">
            The digital ownership and consent layer for cultural tourism.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.title} aria-label={col.title} className="md:col-span-2">
            <h2 className="text-[0.8rem] font-semibold text-ivory">{col.title}</h2>
            <ul className="mt-4 space-y-1">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-flex min-h-9 items-center text-[0.92rem] text-ash transition-colors hover:text-ivory">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
        <div className="md:col-span-4">
          <h2 className="text-[0.8rem] font-semibold text-ivory">What Kalaverse will not do</h2>
          <ul className="mt-4 space-y-3">
            {COMMITMENTS.map((line) => (
              <li key={line} className="flex gap-3 font-serif text-[1rem] leading-snug text-ivory-dim">
                <span aria-hidden className="mt-2 size-1.5 shrink-0 rotate-45 bg-gold" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="page-gutter mx-auto flex max-w-[1440px] flex-col gap-3 border-t border-ivory/[0.08] py-6 text-[0.8rem] text-ash md:flex-row md:items-center md:justify-between">
        <p className="max-w-3xl leading-relaxed">
          Hackathon prototype. Custodians, bookings and figures are fictional demo data, and cultural descriptions are kept general.
          Sacred practices are represented only abstractly.
        </p>
        <ResetDemoButton className="-ml-3 md:ml-0" />
      </div>
    </footer>
  );
}
