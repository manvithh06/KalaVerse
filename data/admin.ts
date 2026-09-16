export type VerificationStage = "new" | "documents_checked" | "with_community";

export interface VerificationRequest {
  id: string;
  name: string;
  practice: string;
  location: string;
  method: "community" | "document";
  detail: string;
  submitted: string;
  stage: VerificationStage;
}

export const VERIFICATION_REQUESTS: VerificationRequest[] = [
  {
    id: "vr-shobha",
    name: "Shobha Devadiga",
    practice: "Bamboo basket weaving",
    location: "Kundapura",
    method: "document",
    detail: "Craft registration from a district cooperative",
    submitted: "2 days ago",
    stage: "new",
  },
  {
    id: "vr-naveen",
    name: "Naveen Kotian",
    practice: "Tase drumming",
    location: "Mangaluru",
    method: "community",
    detail: "1 of 2 community endorsements received",
    submitted: "4 days ago",
    stage: "with_community",
  },
  {
    id: "vr-pushpa",
    name: "Pushpa Nayak",
    practice: "Konkani folk songs",
    location: "Karwar",
    method: "community",
    detail: "Endorser named: a senior singer of the village group",
    submitted: "Yesterday",
    stage: "new",
  },
];

export const CONTENT_REVIEWS = [
  { id: "cr-1", title: "Talamaddale: An Evening of Spoken Epic", change: "Terms version 2", custodian: "Vasudeva Poojary", state: "Approved by 2 community reviewers" },
  { id: "cr-2", title: "Heritage Walk: Laterite, Tile and Timber", change: "Photography rule changed", custodian: "Deepika Alva", state: "Waiting for 1 reviewer" },
  { id: "cr-3", title: "Kasuti Cushion Cover", change: "New product listing", custodian: "Savitri Hiremath", state: "In community review" },
];

export interface CommunityReport {
  id: string;
  title: string;
  about: string;
  reportedBy: string;
  detail: string;
  resolved: boolean;
}

export const COMMUNITY_REPORTS: CommunityReport[] = [
  {
    id: "rp-1",
    title: "Visitor photographed during a guided session",
    about: "Folk Storytelling",
    reportedBy: "Custodian",
    detail: "The visitor was asked to delete the images. The custodian decides whether they may book again.",
    resolved: false,
  },
  {
    id: "rp-2",
    title: "A listing used a sacred term loosely",
    about: "A draft description",
    reportedBy: "Community endorser",
    detail: "The custodian rewrote the description before it was published.",
    resolved: true,
  },
  {
    id: "rp-3",
    title: "Visitor left mid-episode and disturbed seating",
    about: "A Night with the Troupe",
    reportedBy: "Custodian",
    detail: "Reminder about the custodian's seating rule sent to the visitor.",
    resolved: false,
  },
];

export const FEEDBACK = [
  { id: "fb-1", quote: "The rules before booking made me feel like a guest, not a customer.", from: "Visitor from Bengaluru" },
  { id: "fb-2", quote: "For the first time I decide what gets photographed in my own kitchen.", from: "Sumathi Rai, custodian" },
  { id: "fb-3", quote: "Could the consent card be printed and kept at the venue entrance too?", from: "Visitor from Pune" },
];
