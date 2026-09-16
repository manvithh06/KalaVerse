"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Compass, House, Menu, Store, Ticket } from "lucide-react";
import { useKalaverse } from "@/store/kalaverse";
import { useHydrated } from "@/store/hooks";
import { KalaverseMark } from "@/components/cultural/ornaments";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { RoleSwitcher } from "./role-switcher";
import { ResetDemoButton } from "./reset-demo";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/discover", label: "Discover" },
  { href: "/experiences", label: "Experiences" },
  { href: "/crafts", label: "Crafts" },
  { href: "/impact", label: "Impact" },
];

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5 text-ivory", className)} aria-label="Kalaverse, home">
      <KalaverseMark className="size-7 shrink-0" />
      <span className="font-titling text-[0.9rem] tracking-[0.16em] max-[360px]:hidden sm:text-[1.02rem] sm:tracking-[0.22em]">KALAVERSE</span>
    </Link>
  );
}

function useBookingCount() {
  const hydrated = useHydrated();
  const count = useKalaverse((s) => s.bookings.length);
  return hydrated ? count : 0;
}

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const bookings = useBookingCount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overHero = pathname === "/" && !scrolled;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[3px] focus:bg-ivory focus:px-4 focus:py-2 focus:text-night"
      >
        Skip to content
      </a>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-40 border-b transition-[background-color,border-color] duration-500",
          overHero ? "border-transparent bg-transparent" : "border-ivory/[0.08] bg-night/85 backdrop-blur-md",
        )}
      >
        <div className="page-gutter mx-auto flex h-14 max-w-[1440px] items-center gap-4 lg:h-16 lg:gap-8">
          <Wordmark />
          <nav aria-label="Primary" className="hidden lg:block">
            <ul className="flex items-center">
              {NAV.map((item) => {
                const active = item.href === "/experiences" ? pathname === "/experiences" : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative inline-flex h-16 items-center gap-1.5 px-3.5 text-[0.92rem] transition-colors",
                        active ? "text-ivory" : "text-ivory-dim hover:text-ivory",
                      )}
                    >
                      {item.label}
                      {item.href === "/experiences" && bookings > 0 && (
                        <span className="grid min-w-5 place-items-center rounded-full bg-gold px-1 text-[0.65rem] font-semibold text-night">
                          {bookings}
                        </span>
                      )}
                      {active && <motion.span layoutId="site-nav-rule" className="absolute inset-x-3.5 bottom-0 h-px bg-gold-light" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/governance"
              className={cn(
                "hidden h-10 items-center px-3 text-[0.92rem] transition-colors xl:inline-flex",
                pathname.startsWith("/governance") ? "text-ivory" : "text-ivory-dim hover:text-ivory",
              )}
            >
              Governance
            </Link>
            <Link
              href="/register"
              className="hidden h-10 items-center px-3 text-[0.92rem] text-ivory-dim transition-colors hover:text-ivory xl:inline-flex"
            >
              Become a custodian
            </Link>
            <RoleSwitcher className="ml-2" />
          </div>
        </div>
      </header>
      <VisitorBottomNav bookings={bookings} />
    </>
  );
}

function VisitorBottomNav({ bookings }: { bookings: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = [
    { href: "/", label: "Home", icon: House, active: pathname === "/" },
    { href: "/discover", label: "Discover", icon: Compass, active: pathname.startsWith("/discover") },
    { href: "/experiences", label: "Experiences", icon: Ticket, active: pathname === "/experiences" },
    { href: "/crafts", label: "Crafts", icon: Store, active: pathname.startsWith("/crafts") },
  ];

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ivory/10 bg-night/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto grid h-16 max-w-lg grid-cols-5">
        {items.map(({ href, label, icon: Icon, active }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex h-full flex-col items-center justify-center gap-1 text-[0.66rem] font-medium tracking-wide transition-colors",
                active ? "text-ivory" : "text-ash hover:text-ivory",
              )}
            >
              {active && <motion.span layoutId="visitor-tab" className="absolute inset-x-5 top-0 h-0.5 bg-gold-light" />}
              <span className="relative">
                <Icon className="size-5" aria-hidden />
                {href === "/experiences" && bookings > 0 && (
                  <span className="absolute -right-2 -top-1.5 grid min-w-4 place-items-center rounded-full bg-gold px-1 text-[0.58rem] font-bold text-night">
                    {bookings}
                  </span>
                )}
              </span>
              {label}
            </Link>
          </li>
        ))}
        <li>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="flex h-full w-full flex-col items-center justify-center gap-1 text-[0.66rem] font-medium tracking-wide text-ash hover:text-ivory">
              <Menu className="size-5" aria-hidden />
              More
            </SheetTrigger>
            <SheetContent side="bottom" className="px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-8">
              <SheetTitle className="t-subtitle">Kalaverse</SheetTitle>
              <SheetDescription className="mt-1 text-sm text-ash">Culture on Their Terms.</SheetDescription>
              <ul className="mt-6 divide-y divide-ivory/[0.08] border-y border-ivory/[0.08]">
                {[
                  { href: "/impact", label: "Impact" },
                  { href: "/governance", label: "Community governance" },
                  { href: "/register", label: "Become a custodian" },
                  { href: "/custodian", label: "Custodian workspace" },
                  { href: "/admin", label: "Platform admin" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} onClick={() => setOpen(false)} className="flex h-14 items-center text-[1rem] text-ivory">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <ResetDemoButton className="mt-4 -ml-3" />
            </SheetContent>
          </Sheet>
        </li>
      </ul>
    </nav>
  );
}
