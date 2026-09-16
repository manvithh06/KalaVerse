"use client";

import Link from "next/link";
import { CircleSlash } from "lucide-react";
import { useExperience } from "@/store/hooks";
import { CURRENT_CUSTODIAN_ID } from "@/data/custodians";
import { EmptyState } from "@/components/cultural/states";
import { Button } from "@/components/ui/button";
import { ExperienceForm } from "./experience-form";

export function EditExperience({ id }: { id: string }) {
  const experience = useExperience(id);
  if (!experience || experience.custodianId !== CURRENT_CUSTODIAN_ID) {
    return (
      <EmptyState
        tone="light"
        className="py-24"
        icon={<CircleSlash className="size-6" aria-hidden />}
        title="Experience not found"
        body="It may have been removed, or it belongs to another custodian."
        action={
          <Button asChild variant="outline-ink">
            <Link href="/custodian/experiences">Back to experiences</Link>
          </Button>
        }
      />
    );
  }
  return <ExperienceForm key={experience.id} experience={experience} />;
}
