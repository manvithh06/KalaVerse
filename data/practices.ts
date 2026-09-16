import type { CultureCategory, ExperienceFormat, Motif } from "@/types";

export interface PracticeOption {
  value: string;
  category: CultureCategory;
  motif: Motif;
  format: ExperienceFormat;
  craft?: string;
}

export const PRACTICE_OPTIONS: PracticeOption[] = [
  { value: "Yakshagana", category: "performance", motif: "yakshagana", format: "performance" },
  { value: "Talamaddale", category: "storytelling", motif: "talamaddale", format: "listening" },
  { value: "Chende and maddale", category: "performance", motif: "rhythm", format: "workshop" },
  { value: "Stage ornament making", category: "craft", motif: "crown", format: "workshop", craft: "Ornament making" },
  { value: "Stage makeup", category: "performance", motif: "makeup", format: "demonstration" },
  { value: "Folk storytelling", category: "storytelling", motif: "storytelling", format: "listening" },
  { value: "Kasuti embroidery", category: "craft", motif: "kasuti", format: "workshop", craft: "Embroidery" },
  { value: "Coastal pottery", category: "craft", motif: "pottery", format: "workshop", craft: "Pottery" },
  { value: "Handloom weaving", category: "craft", motif: "weaving", format: "workshop", craft: "Weaving" },
  { value: "Areca sheath craft", category: "craft", motif: "areca", format: "workshop", craft: "Areca craft" },
  { value: "Tulunadu cuisine", category: "cuisine", motif: "cuisine", format: "meal" },
  { value: "Coastal farming", category: "agriculture", motif: "krishi", format: "field-day" },
  { value: "Kambala", category: "agriculture", motif: "kambala", format: "field-day" },
  { value: "Traditional architecture", category: "architecture", motif: "architecture", format: "walk" },
  { value: "Community or sacred practice", category: "sacred", motif: "sacred", format: "community" },
];

export const DISTRICTS = ["Udupi", "Dakshina Kannada", "Uttara Kannada", "Dharwad", "Shivamogga", "Kodagu"];

export const LANGUAGE_OPTIONS = ["Kannada", "Tulu", "English", "Konkani", "Beary", "Hindi"];

export const WEEKDAY_OPTIONS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 0, label: "Sun" },
];

export function practiceOption(value: string): PracticeOption {
  return (
    PRACTICE_OPTIONS.find((p) => p.value === value) ?? {
      value,
      category: "performance",
      motif: "handicrafts",
      format: "workshop",
    }
  );
}
