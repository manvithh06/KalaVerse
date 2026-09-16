/**
 * Kalaverse domain model.
 *
 * The central idea is encoded in `ConsentSettings`: every experience carries
 * terms written by its custodian, and the access level decides what the
 * platform is allowed to do with it (list it, book it, describe it with AI).
 */

export type Role = "visitor" | "custodian";

/** OPEN = share it. GUIDED = experience it respectfully. PROTECTED = keep it within the community. */
export type AccessLevel = "open" | "guided" | "protected";

export type ParticipationMode = "allowed" | "guided" | "not_allowed";

export type Eligibility = "everyone" | "age_12_plus" | "adults" | "community_invited";

export interface CulturalRule {
  id: string;
  text: string;
}

export interface ConsentSettings {
  accessLevel: AccessLevel;
  photography: boolean;
  video: boolean;
  recording: boolean;
  participation: ParticipationMode;
  maxGroup: number;
  eligibility: Eligibility;
  /** Whether the custodian allows AI to draft descriptions. Always false when protected. */
  aiAssist: boolean;
  /** Custodian-written rules shown to visitors before they book. */
  rules: CulturalRule[];
  termsVersion: number;
  updatedAt: string;
}

export type TrustLevel = 1 | 2 | 3 | 4;

export interface TrustLevelInfo {
  level: TrustLevel;
  glyph: string;
  title: string;
  basis: string;
  description: string;
}

/** Visual plate used for a practice. Rendered as illustration, never as a photo of a real person. */
export type Motif =
  | "yakshagana"
  | "crown"
  | "rhythm"
  | "makeup"
  | "talamaddale"
  | "daivaradhane"
  | "kambala"
  | "krishi"
  | "tulunadu"
  | "cuisine"
  | "kasuti"
  | "pottery"
  | "weaving"
  | "storytelling"
  | "architecture"
  | "areca"
  | "coast"
  | "handicrafts"
  | "sacred";

export type CultureCategory =
  | "performance"
  | "craft"
  | "cuisine"
  | "agriculture"
  | "storytelling"
  | "architecture"
  | "sacred";

export type ExperienceFormat =
  | "workshop"
  | "performance"
  | "walk"
  | "meal"
  | "field-day"
  | "listening"
  | "demonstration"
  | "community";

export type VerificationStatus = "pending" | "under_review" | "verified";

export interface Custodian {
  id: string;
  name: string;
  practice: string;
  specialization: string;
  location: string;
  region: string;
  languages: string[];
  community: string;
  bio: string;
  story: string[];
  rules: string[];
  trustLevel: TrustLevel;
  endorsements: number;
  experiencesHosted: number;
  yearsOfPractice: number;
  memberSince: string;
  motif: Motif;
  verification: VerificationStatus;
  endorsedBy: string[];
}

/** Weekly pattern. Concrete dates are generated in the browser so server and client never disagree. */
export interface Schedule {
  /** 0 = Sunday … 6 = Saturday */
  days: number[];
  /** 24h "HH:MM" */
  time: string;
}

export interface ItineraryStep {
  title: string;
  detail: string;
}

export type DescriptionSource = "custodian" | "ai_approved" | "ai_edited";

export interface Experience {
  id: string;
  title: string;
  practice: string;
  category: CultureCategory;
  format: ExperienceFormat;
  craft?: string;
  custodianId: string;
  location: string;
  district: string;
  summary: string;
  description: string;
  descriptionSource: DescriptionSource;
  itinerary: ItineraryStep[];
  learnBefore: string[];
  durationMinutes: number;
  price: number;
  languages: string[];
  schedule: Schedule;
  consent: ConsentSettings;
  status: "published" | "draft";
  motif: Motif;
  createdAt: string;
  bookingsCount: number;
  userCreated?: boolean;
}

export interface Product {
  id: string;
  name: string;
  craft: string;
  custodianId: string;
  price: number;
  materials: string[];
  story: string;
  origin: string;
  makingTime: string;
  authenticity: "custodian_made" | "community_endorsed";
  stock: number;
  motif: Motif;
}

export interface Payout {
  gross: number;
  platformFee: number;
  custodianNet: number;
}

export interface Booking extends Payout {
  id: string;
  experienceId: string;
  experienceTitle: string;
  custodianId: string;
  date: string;
  time: string;
  guests: number;
  termsVersion: number;
  agreedAt: string;
  status: "confirmed" | "completed" | "cancelled";
}

export interface ProductOrder extends Payout {
  id: string;
  productId: string;
  productName: string;
  custodianId: string;
  quantity: number;
  createdAt: string;
}

export type TransactionKind = "experience" | "product";

export interface Transaction extends Payout {
  id: string;
  kind: TransactionKind;
  label: string;
  custodianId: string;
  date: string;
  reference?: string;
}

export type AIStatus = "draft" | "approved" | "edited" | "rejected";

export interface AIContent {
  id: string;
  experienceId: string;
  draft: string;
  status: AIStatus;
  finalText?: string;
  decidedAt?: string;
  generatedAt: string;
  /** True when the draft was composed only from fields the custodian already published. */
  grounded?: boolean;
}

export type NotificationKind = "booking" | "consent" | "ai" | "governance" | "protection" | "order";

export interface Notification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

/**
 * A protected record registers that something exists and must stay within the
 * community. Kalaverse stores the boundary, never the knowledge itself.
 */
export interface VaultRecord {
  id: string;
  label: string;
  kind: "sacred" | "oral" | "knowledge";
  keepers: string;
  sealedAt: string;
}

export interface CustodianApplication {
  id: string;
  name: string;
  location: string;
  practice: string;
  languages: string[];
  community: string;
  verificationMethod: "community" | "document";
  endorserName: string;
  organizationName: string;
  boundaries: { share: string; guide: string; protect: string };
  status: VerificationStatus;
  submittedAt: string;
}

export interface ProfileOverrides {
  name?: string;
  bio?: string;
  location?: string;
  languages?: string[];
  story?: string[];
  rules?: string[];
}
