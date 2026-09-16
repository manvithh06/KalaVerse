"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bell,
  ExternalLink,
  IndianRupee,
  Landmark,
  Layers,
  LayoutGrid,
  Lock,
  Menu,
  Plus,
  ScrollText,
  Sparkles,
  Ticket,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useKalaverse } from "@/store/kalaverse";
import { useCurrentCustodian, useHydrated, useUnreadCount } from "@/store/hooks";
import { CURRENT_CUSTODIAN_ID } from "@/data/custodians";
import { KalaverseMark } from "@/components/cultural/ornaments";
import { TrustBadge } from "@/components/cultural/trust-badge";
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { RoleSwitcher } from "./role-switcher";
import { ResetDemoButton } from "./reset-demo";
import { cn, timeAgo } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Workspace",
    items: [
      { href: "/custodian", label: "Dashboard", icon: LayoutGrid, exact: true },
      { href: "/custodian/culture", label: "My Culture", icon: Layers },
      { href: "/custodian/experiences", label: "Experiences", icon: Ticket },
      { href: "/custodian/consent", label: "Consent", icon: ScrollText },
    ],
  },
  {
    title: "Protection",
    items: [
      { href: "/custodian/vault", label: "Protected Vault", icon: Lock },
      { href: "/custodian/ai", label: "AI Assistant", icon: Sparkles },
    ],
  },
  {
    title: "Community",
    items: [
      { href: "/custodian/earnings", label: "Earnings", icon: IndianRupee },
      { href: "/custodian/governance", label: "Governance", icon: Landmark },
      { href: "/custodian/profile", label: "Profile", icon: UserRound },
    ],
  },
];

function isActive(pathname: string, item: NavItem) {
  return item.exact ? pathname === item.href : pathname.startsWith(item.href);
}

function usePendingDrafts() {
  const hydrated = useHydrated();
  const aiContents = useKalaverse((s) => s.aiContents);
  const experiences = useKalaverse((s) => s.experiences);
  return useMemo(() => {
    if (!hydrated) return 0;
    return aiContents.filter((c) => {
      const e = experiences.find((x) => x.id === c.experienceId);
      return c.status === "draft" && e && e.custodianId === CURRENT_CUSTODIAN_ID && e.consent.accessLevel !== "protected";
    }).length;
  }, [hydrated, aiContents, experiences]);
}

function NavList({ onNavigate, layoutKey }: { onNavigate?: () => void; layoutKey: string }) {
  const pathname = usePathname();
  const pending = usePendingDrafts();
  return (
    <nav aria-label="Custodian workspace">
      {SECTIONS.map((section) => (
        <div key={section.title} className="mt-6 first:mt-0">
          <p className="px-3 text-[0.72rem] text-ash/80">{section.title}</p>
          <ul className="mt-2 space-y-0.5">
            {section.items.map((item) => {
              const active = isActive(pathname, item);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex h-11 items-center gap-3 rounded-[3px] px-3 text-[0.92rem] transition-colors",
                      active ? "bg-ivory/[0.07] text-ivory" : "text-ivory-dim hover:bg-ivory/[0.04] hover:text-ivory",
                    )}
                  >
                    {active && (
                      <motion.span layoutId={`custodian-nav-${layoutKey}`} className="absolute inset-y-2 left-0 w-0.5 bg-gold-light" />
                    )}
                    <Icon className={cn("size-[18px]", item.href === "/custodian/vault" && "text-protected/90")} aria-hidden />
                    <span className="flex-1">{item.label}</span>
                    {item.href === "/custodian/ai" && pending > 0 && (
                      <span className="grid min-w-5 place-items-center rounded-full bg-indigo-2 px-1.5 text-[0.65rem] font-semibold text-ivory">
                        {pending}
                        <span className="sr-only"> drafts waiting</span>
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function Identity() {
  const custodian = useCurrentCustodian();
  const hydrated = useHydrated();
  const initials = custodian.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <div className="flex items-center gap-3 rounded-[4px] border border-ivory/10 bg-night-2 p-3">
      <span className="grid size-11 shrink-0 place-items-center rounded-full border border-gold/40 bg-maroon font-titling text-sm tracking-wider text-gold-light">
        {hydrated ? initials : "VP"}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[0.92rem] font-medium text-ivory">{hydrated ? custodian.name : "Vasudeva Poojary"}</p>
        <TrustBadge level={custodian.trustLevel} size="sm" className="mt-1" />
      </div>
    </div>
  );
}

function NotificationsButton({ tone }: { tone: "light" | "dark" }) {
  const hydrated = useHydrated();
  const unread = useUnreadCount();
  const notifications = useKalaverse((s) => s.notifications);
  const markRead = useKalaverse((s) => s.markNotificationsRead);
  return (
    <Sheet onOpenChange={(open) => !open && markRead()}>
      <SheetTrigger
        aria-label={hydrated && unread ? `Notifications, ${unread} unread` : "Notifications"}
        className={cn(
          "relative grid size-11 place-items-center rounded-full transition-colors",
          tone === "light" ? "text-ink-soft hover:bg-ink/[0.06] hover:text-ink" : "text-ivory-dim hover:bg-ivory/[0.07] hover:text-ivory",
        )}
      >
        <Bell className="size-5" aria-hidden />
        {hydrated && unread > 0 && (
          <span className="absolute right-2 top-2 grid min-w-4 place-items-center rounded-full bg-protected px-1 text-[0.58rem] font-bold text-ivory">
            {unread}
          </span>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="px-5 pb-8 pt-7">
        <SheetTitle className="t-subtitle">Notifications</SheetTitle>
        <SheetDescription className="mt-1 text-sm text-ash">What changed in your practice.</SheetDescription>
        <ul className="mt-6 space-y-2">
          {hydrated &&
            notifications.map((n) => (
              <li key={n.id} className={cn("rounded-[4px] border p-4", n.read ? "border-ivory/[0.06]" : "border-gold/30 bg-gold/[0.05]")}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[0.92rem] font-medium leading-snug text-ivory">{n.title}</p>
                  <span className="shrink-0 text-[0.72rem] text-ash">{timeAgo(n.createdAt)}</span>
                </div>
                <p className="mt-1.5 text-[0.84rem] leading-snug text-ivory-dim">{n.body}</p>
              </li>
            ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}

export function CustodianShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const dark = pathname.startsWith("/custodian/vault");

  return (
    <div className="min-h-dvh bg-night">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[3px] focus:bg-ivory focus:px-4 focus:py-2 focus:text-night"
      >
        Skip to content
      </a>

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[272px] flex-col border-r border-ivory/[0.08] bg-night texture-weave lg:flex">
        <div className="flex h-16 items-center justify-between px-5">
          <Link href="/custodian" className="flex items-center gap-2.5 text-ivory" aria-label="Custodian dashboard">
            <KalaverseMark className="size-7" />
            <span className="font-titling text-[1rem] tracking-[0.22em]">KALAVERSE</span>
          </Link>
          <NotificationsButton tone="dark" />
        </div>
        <div className="px-4">
          <Identity />
        </div>
        <div className="mt-6 flex-1 overflow-y-auto px-3 pb-6 scrollbar-none">
          <NavList layoutKey="desktop" />
        </div>
        <div className="space-y-2 border-t border-ivory/[0.08] p-4">
          <RoleSwitcher className="w-full [&>button]:flex-1" />
          <Link
            href={`/custodians/${CURRENT_CUSTODIAN_ID}`}
            className="flex h-10 items-center gap-2 rounded-[3px] px-3 text-[0.8125rem] text-ash transition-colors hover:bg-ivory/[0.06] hover:text-ivory"
          >
            <ExternalLink className="size-3.5" aria-hidden />
            See my public profile
          </Link>
          <ResetDemoButton className="w-full justify-start" />
        </div>
      </aside>

      <div className={cn("min-h-dvh lg:pl-[272px]", dark ? "bg-vault text-ivory" : "bg-limewash text-ink")}>
        <header
          className={cn(
            "sticky top-0 z-20 flex h-14 items-center gap-2 border-b px-4 backdrop-blur-md lg:hidden",
            dark ? "border-ivory/[0.08] bg-vault/90" : "border-ink/[0.08] bg-limewash/90",
          )}
        >
          <Link href="/custodian" className={cn("flex items-center gap-2", dark ? "text-ivory" : "text-ink")} aria-label="Custodian dashboard">
            <KalaverseMark className="size-6" />
            <span className="hidden font-titling text-[0.92rem] tracking-[0.2em] min-[440px]:inline">KALAVERSE</span>
          </Link>
          <div className="ml-auto flex min-w-0 items-center gap-1">
            <NotificationsButton tone={dark ? "dark" : "light"} />
            <RoleSwitcher tone={dark ? "dark" : "light"} />
          </div>
        </header>

        <main id="main" className="pb-24 lg:pb-0">
          {children}
        </main>
      </div>

      <nav
        aria-label="Custodian workspace"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-ivory/10 bg-night/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
      >
        <ul className="mx-auto grid h-16 max-w-lg grid-cols-5 items-center">
          {[
            { href: "/custodian", label: "Dashboard", icon: LayoutGrid, exact: true },
            { href: "/custodian/culture", label: "Culture", icon: Layers },
          ].map((item) => (
            <MobileTab key={item.href} item={item} />
          ))}
          <li className="flex justify-center">
            <Link
              href="/custodian/experiences/new"
              aria-label="Create experience"
              className="grid size-12 place-items-center rounded-full bg-gold text-night shadow-[0_8px_24px_-6px_rgb(180_141_73/0.6)]"
            >
              <Plus className="size-6" aria-hidden />
            </Link>
          </li>
          <MobileTab item={{ href: "/custodian/ai", label: "AI", icon: Sparkles }} />
          <li>
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger className="flex h-16 w-full flex-col items-center justify-center gap-1 text-[0.66rem] font-medium text-ash hover:text-ivory">
                <Menu className="size-5" aria-hidden />
                Menu
              </SheetTrigger>
              <SheetContent side="left" className="px-3 pb-8 pt-5">
                <SheetTitle className="sr-only">Custodian menu</SheetTitle>
                <SheetDescription className="sr-only">Every section of your workspace.</SheetDescription>
                <div className="px-2 pr-12">
                  <Identity />
                </div>
                <div className="mt-6">
                  <NavList layoutKey="mobile" onNavigate={() => setMenuOpen(false)} />
                </div>
                <div className="mt-6 border-t border-ivory/[0.08] pt-4">
                  <Link
                    href={`/custodians/${CURRENT_CUSTODIAN_ID}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex h-11 items-center gap-2 rounded-[3px] px-3 text-[0.9rem] text-ash hover:text-ivory"
                  >
                    <ExternalLink className="size-4" aria-hidden />
                    See my public profile
                  </Link>
                  <ResetDemoButton />
                </div>
              </SheetContent>
            </Sheet>
          </li>
        </ul>
      </nav>
    </div>
  );
}

function MobileTab({ item }: { item: NavItem }) {
  const pathname = usePathname();
  const active = isActive(pathname, item);
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative flex h-16 flex-col items-center justify-center gap-1 text-[0.66rem] font-medium transition-colors",
          active ? "text-ivory" : "text-ash hover:text-ivory",
        )}
      >
        {active && <motion.span layoutId="custodian-tab" className="absolute inset-x-5 top-0 h-0.5 bg-gold-light" />}
        <Icon className="size-5" aria-hidden />
        {item.label}
      </Link>
    </li>
  );
}
