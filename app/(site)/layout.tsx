import type { ReactNode } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { RoleSync } from "@/components/layout/role-switcher";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <RoleSync role="visitor" />
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
