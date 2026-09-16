import { FORMAT_LABEL } from "@/data/traditions";
import type { ConsentSettings, ExperienceFormat } from "@/types";
import { formatDuration } from "./utils";

export interface DraftSource {
  title: string;
  practice: string;
  format: ExperienceFormat;
  custodianName: string;
  district: string;
  location: string;
  summary?: string;
  durationMinutes: number;
  languages: string[];
  consent: Pick<ConsentSettings, "photography" | "video" | "recording" | "maxGroup">;
}

/** The fields a draft is allowed to draw on. Shown to the custodian as the draft's sources. */
export const DRAFT_SOURCES = ["Title", "Practice", "Location", "Duration", "Languages", "Your terms"];

/**
 * The assistant only rephrases details the custodian has already written.
 * It has no other source, so it cannot invent history, meaning or ritual.
 */
export function composeDraft(src: DraftSource) {
  const format = FORMAT_LABEL[src.format]?.toLowerCase() ?? "session";
  const duration = src.durationMinutes > 0 ? `${formatDuration(src.durationMinutes)} ` : "";
  const place = [src.district, src.location].filter(Boolean).join(", ");
  const sentences = [
    `${src.title || "This experience"} is a ${duration}${format} hosted by ${src.custodianName}, a custodian of ${src.practice.toLowerCase()}${place ? ` in ${place}` : ""}.`,
  ];
  if (src.summary) sentences.push(src.summary.trim().replace(/([^.!?])$/, "$1."));
  if (src.languages.length) {
    sentences.push(
      `It is offered in ${src.languages.join(" and ")}${src.consent.maxGroup > 0 ? `, for groups of up to ${src.consent.maxGroup}` : ""}.`,
    );
  }
  const barred = [
    !src.consent.photography && "photography",
    !src.consent.video && "video",
    !src.consent.recording && "recording",
  ].filter(Boolean) as string[];
  if (barred.length) {
    const list = barred.length > 1 ? `${barred.slice(0, -1).join(", ")} and ${barred.at(-1)}` : barred[0];
    sentences.push(`${list.charAt(0).toUpperCase()}${list.slice(1)} ${barred.length > 1 ? "are" : "is"} not allowed, at the custodian's request.`);
  }
  return sentences.join(" ");
}
