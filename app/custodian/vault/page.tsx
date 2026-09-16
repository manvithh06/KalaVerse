import type { Metadata } from "next";
import { ClientGate } from "@/components/providers/client-gate";
import { VaultView } from "@/components/dashboard/vault-view";
import { WorkspaceSkeleton } from "@/components/dashboard/workspace";

export const metadata: Metadata = { title: "Protected Vault" };

export default function VaultPage() {
  return (
    <ClientGate fallback={<WorkspaceSkeleton tone="dark" />}>
      <VaultView />
    </ClientGate>
  );
}
