import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CustodianShell } from "@/components/layout/custodian-shell";
import { RoleSync } from "@/components/layout/role-switcher";

export const metadata: Metadata = {
  title: { default: "Custodian workspace", template: "%s | Kalaverse" },
};

export default function CustodianLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <RoleSync role="custodian" />
      <CustodianShell>{children}</CustodianShell>
    </>
  );
}
