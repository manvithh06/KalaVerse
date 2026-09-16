import type { Metadata } from "next";
import { GovernanceView } from "@/components/governance/governance-view";

export const metadata: Metadata = { title: "Community governance" };

export default function GovernancePage() {
  return <GovernanceView tone="dark" />;
}
