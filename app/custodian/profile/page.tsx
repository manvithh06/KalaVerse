import type { Metadata } from "next";
import { ClientGate } from "@/components/providers/client-gate";
import { ProfileEditor } from "@/components/dashboard/profile-editor";
import { WorkspaceSkeleton } from "@/components/dashboard/workspace";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <ClientGate fallback={<WorkspaceSkeleton />}>
      <ProfileEditor />
    </ClientGate>
  );
}
