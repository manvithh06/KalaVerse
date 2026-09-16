import type { AccessLevel, CultureCategory, Motif } from "@/types";

export interface Tradition {
  id: string;
  name: string;
  kannada: string;
  subtitle: string;
  body: string;
  motif: Motif;
  access: AccessLevel;
  /** Discovery filter this tradition maps to, if it can be experienced. */
  category?: CultureCategory;
  practice?: string;
}

export const traditions: Tradition[] = [
  {
    id: "yakshagana",
    name: "Yakshagana",
    kannada: "ಯಕ್ಷಗಾನ",
    subtitle: "Performance & storytelling",
    body: "Music, dance, improvised dialogue and costume, carried from village to village by travelling troupes through the performance season.",
    motif: "yakshagana",
    access: "guided",
    practice: "Yakshagana",
  },
  {
    id: "daivaradhane",
    name: "Daivaradhane",
    kannada: "ದೈವಾರಾಧನೆ",
    subtitle: "Sacred cultural traditions",
    body: "Held as sacred by the communities of Tulunadu. Kalaverse does not depict, describe or offer it. It appears here only so you know it is protected.",
    motif: "daivaradhane",
    access: "protected",
  },
  {
    id: "kambala",
    name: "Kambala",
    kannada: "ಕಂಬಳ",
    subtitle: "Traditional buffalo racing culture",
    body: "Races run through flooded paddy tracks after the harvest, by farming families who care for their buffaloes all year.",
    motif: "kambala",
    access: "guided",
    practice: "Kambala",
  },
  {
    id: "krishi",
    name: "Krishi",
    kannada: "ಕೃಷಿ",
    subtitle: "Coastal agricultural heritage",
    body: "Paddy, areca and coconut. Knowledge of soil, rain and season, held by the families who work the land.",
    motif: "krishi",
    access: "open",
    category: "agriculture",
  },
  {
    id: "tulunadu",
    name: "Tulu Nadu",
    kannada: "ತುಳುನಾಡು",
    subtitle: "Language, memory & identity",
    body: "Tulu, a Dravidian language of the coast, carries the region's songs, sayings and memory from one generation to the next.",
    motif: "tulunadu",
    access: "open",
  },
  {
    id: "cuisine",
    name: "Coastal Cuisine",
    kannada: "ಕರಾವಳಿ ಅಡುಗೆ",
    subtitle: "Food traditions",
    body: "Rice, coconut and the season's garden: neer dosa, kori rotti, ghee roast and pathrode, cooked in family kitchens.",
    motif: "cuisine",
    access: "open",
    category: "cuisine",
  },
  {
    id: "handicrafts",
    name: "Handicrafts",
    kannada: "ಕರಕುಶಲ",
    subtitle: "Skills passed through generations",
    body: "Counted-thread Kasuti, hand-thrown clay, handloom cotton and areca sheath. Made by hand, taught by hand.",
    motif: "handicrafts",
    access: "open",
    category: "craft",
  },
  {
    id: "storytelling",
    name: "Folk Storytelling",
    kannada: "ಜಾನಪದ ಕಥೆ",
    subtitle: "Oral traditions",
    body: "Tales and field songs passed on by listening, many first sung during planting and harvest.",
    motif: "storytelling",
    access: "guided",
    category: "storytelling",
  },
];

export const CATEGORY_LABEL: Record<CultureCategory, string> = {
  performance: "Performance",
  craft: "Craft",
  cuisine: "Cuisine",
  agriculture: "Agriculture",
  storytelling: "Storytelling",
  architecture: "Architecture",
  sacred: "Sacred",
};

export const FORMAT_LABEL: Record<string, string> = {
  workshop: "Workshop",
  performance: "Performance",
  walk: "Walk",
  meal: "Meal",
  "field-day": "Field day",
  listening: "Listening session",
  demonstration: "Demonstration",
  community: "Community practice",
};
