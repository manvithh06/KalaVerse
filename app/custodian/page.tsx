import type { Metadata } from "next";
import { ClientGate } from "@/components/providers/client-gate";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { WorkspaceSkeleton } from "@/components/dashboard/workspace";

export const metadata: Metadata = { title: "Dashboard" };

export default function CustodianDashboardPage() {
  return (
    <ClientGate fallback={<WorkspaceSkeleton />}>
      <DashboardView />
    </ClientGate>
  );
}
