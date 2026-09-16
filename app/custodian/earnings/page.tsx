import type { Metadata } from "next";
import { ClientGate } from "@/components/providers/client-gate";
import { EarningsView } from "@/components/dashboard/earnings-view";
import { WorkspaceSkeleton } from "@/components/dashboard/workspace";

export const metadata: Metadata = { title: "Earnings" };

export default function EarningsPage() {
  return (
    <ClientGate fallback={<WorkspaceSkeleton />}>
      <EarningsView />
    </ClientGate>
  );
}
