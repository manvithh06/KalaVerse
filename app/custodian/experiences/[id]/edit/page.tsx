import type { Metadata } from "next";
import { ClientGate } from "@/components/providers/client-gate";
import { EditExperience } from "@/components/dashboard/edit-experience";
import { WorkspaceSkeleton } from "@/components/dashboard/workspace";

export const metadata: Metadata = { title: "Edit experience" };

export default async function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <ClientGate fallback={<WorkspaceSkeleton />}>
      <EditExperience id={id} />
    </ClientGate>
  );
}
