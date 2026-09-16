export interface Authority {
  id: "custodian" | "endorser" | "organization" | "admin";
  name: string;
  shapesCulture: boolean;
  role: string;
}

export const AUTHORITIES: Authority[] = [
  {
    id: "custodian",
    name: "Custodian",
    shapesCulture: true,
    role: "Defines the practice, its terms, its price and what stays protected.",
  },
  {
    id: "endorser",
    name: "Community endorser",
    shapesCulture: true,
    role: "A member of the custodian's own community who reviews listings and vouches for them.",
  },
  {
    id: "organization",
    name: "Verified cultural organization",
    shapesCulture: true,
    role: "Confirms documents and supports review, alongside the community.",
  },
  {
    id: "admin",
    name: "Platform admin",
    shapesCulture: false,
    role: "Keeps the platform safe and running. Cannot define, edit or unprotect culture.",
  },
];

export interface Permission {
  action: string;
  custodian: boolean;
  endorser: boolean;
  organization: boolean;
  admin: boolean;
  note?: string;
}

export const PERMISSIONS: Permission[] = [
  { action: "Write and publish a listing", custodian: true, endorser: false, organization: false, admin: false },
  { action: "Set price, rules and group size", custodian: true, endorser: false, organization: false, admin: false },
  { action: "Change an access level", custodian: true, endorser: false, organization: false, admin: false },
  { action: "Approve AI-drafted text", custodian: true, endorser: false, organization: false, admin: false },
  {
    action: "Request protection for a practice",
    custodian: true,
    endorser: true,
    organization: false,
    admin: false,
    note: "The custodian confirms every request.",
  },
  { action: "Review a listing before it goes live", custodian: false, endorser: true, organization: true, admin: false },
  { action: "Endorse a custodian", custodian: false, endorser: true, organization: true, admin: false },
  { action: "Check identity documents", custodian: false, endorser: false, organization: true, admin: true },
  { action: "Remove abusive visitor content", custodian: true, endorser: false, organization: false, admin: true },
  {
    action: "Override a custodian's protection",
    custodian: false,
    endorser: false,
    organization: false,
    admin: false,
    note: "No role can. Protection changes only through the custodian, with community consent.",
  },
];

export const WORKFLOW = [
  {
    id: "custodian",
    title: "Custodian",
    detail: "Writes the listing, sets the terms and chooses the access level.",
    example: "Vasudeva submits new terms for Talamaddale: An Evening of Spoken Epic.",
  },
  {
    id: "review",
    title: "Community Review",
    detail: "Endorsers from the custodian's own community read the listing and its terms.",
    example: "Two senior artists from the troupe review the wording and the photography rule.",
  },
  {
    id: "approval",
    title: "Approval",
    detail: "The community approves, or returns it with notes. The platform cannot approve on its behalf.",
    example: "Approved with one note: recording stays off during the performance.",
  },
  {
    id: "publish",
    title: "Publish",
    detail: "The listing goes live exactly as approved. The platform only hosts it.",
    example: "Live in discovery under version 2 of the custodian's terms.",
  },
];
