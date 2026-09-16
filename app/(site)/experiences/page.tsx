import type { Metadata } from "next";
import { YourExperiences } from "@/components/experience/your-experiences";

export const metadata: Metadata = { title: "Your experiences" };

export default function ExperiencesPage() {
  return <YourExperiences />;
}
