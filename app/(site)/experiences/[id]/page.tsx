import type { Metadata } from "next";
import { seedExperiences } from "@/data/experiences";
import { ExperienceDetail } from "@/components/experience/experience-detail";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const experience = seedExperiences.find((e) => e.id === id);
  // A protected practice never leaks its name, even into a page title.
  if (!experience || experience.consent.accessLevel === "protected") return { title: "Experience" };
  return { title: experience.title, description: experience.summary };
}

export default async function ExperiencePage({ params }: Props) {
  const { id } = await params;
  return <ExperienceDetail id={id} />;
}
