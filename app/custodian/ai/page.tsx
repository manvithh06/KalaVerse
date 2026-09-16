import type { Metadata } from "next";
import { ClientGate } from "@/components/providers/client-gate";
import { AIAssistant } from "@/components/dashboard/ai-assistant";
import { WorkspaceSkeleton } from "@/components/dashboard/workspace";

export const metadata: Metadata = { title: "AI Assistant" };

export default function AIAssistantPage() {
  return (
    <ClientGate fallback={<WorkspaceSkeleton />}>
      <AIAssistant />
    </ClientGate>
  );
}
