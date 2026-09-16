import type { Metadata } from "next";
import { ClientGate } from "@/components/providers/client-gate";
import { ExperiencesManager } from "@/components/dashboard/experiences-manager";
import { WorkspaceSkeleton } from "@/components/dashboard/workspace";

export const metadata: Metadata = { title: "Experiences" };

export default function CustodianExperiencesPage() {
  return (
    <ClientGate fallback={<WorkspaceSkeleton />}>
      <ExperiencesManager />
    </ClientGate>
  );
}
