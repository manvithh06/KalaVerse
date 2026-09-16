import type { Metadata } from "next";
import { CraftsView } from "@/components/crafts/crafts-view";

export const metadata: Metadata = {
  title: "Crafts",
  description: "Handmade cultural products bought directly from the custodians who make them.",
};

export default function CraftsPage() {
  return <CraftsView />;
}
