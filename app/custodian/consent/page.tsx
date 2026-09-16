import type { Metadata } from "next";
import { ClientGate } from "@/components/providers/client-gate";
import { ConsentManager } from "@/components/dashboard/consent-manager";
import { WorkspaceSkeleton } from "@/components/dashboard/workspace";

export const metadata: Metadata = { title: "Consent" };

export default function ConsentPage() {
  return (
    <ClientGate fallback={<WorkspaceSkeleton />}>
      <ConsentManager />
    </ClientGate>
  );
}
