import type { Metadata } from "next";
import { ClientGate } from "@/components/providers/client-gate";
import { CultureMap } from "@/components/dashboard/culture-map";
import { WorkspaceSkeleton } from "@/components/dashboard/workspace";

export const metadata: Metadata = { title: "My culture" };

export default function MyCulturePage() {
  return (
    <ClientGate fallback={<WorkspaceSkeleton />}>
      <CultureMap />
    </ClientGate>
  );
}
