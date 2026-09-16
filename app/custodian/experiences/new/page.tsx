import type { Metadata } from "next";
import { ClientGate } from "@/components/providers/client-gate";
import { ExperienceForm } from "@/components/dashboard/experience-form";
import { WorkspaceSkeleton } from "@/components/dashboard/workspace";

export const metadata: Metadata = { title: "Create experience" };

export default function NewExperiencePage() {
  return (
    <ClientGate fallback={<WorkspaceSkeleton />}>
      <ExperienceForm />
    </ClientGate>
  );
}
