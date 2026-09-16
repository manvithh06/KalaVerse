import type { TrustLevel, TrustLevelInfo } from "@/types";

export const TRUST_LEVELS: Record<TrustLevel, TrustLevelInfo> = {
  1: {
    level: 1,
    glyph: "✓",
    title: "Verified Custodian",
    basis: "Identity and basic verification",
    description: "Identity confirmed, and the practice verified through documents or a cultural organisation.",
  },
  2: {
    level: 2,
    glyph: "◆",
    title: "Trusted Custodian",
    basis: "Community endorsement",
    description: "Endorsed by members of their own community, who vouch for how the practice is shared.",
  },
  3: {
    level: 3,
    glyph: "★",
    title: "Star Custodian",
    basis: "Strong visitor and community feedback",
    description: "Experiences that visitors and the community both confirm were hosted with care and respect.",
  },
  4: {
    level: 4,
    glyph: "✦",
    title: "Heritage Custodian",
    basis: "Long-term stewardship and community recognition",
    description: "Recognised by the community for long-term care of the practice and the people who carry it.",
  },
};

export const TRUST_DISCLAIMER =
  "Trust reflects how a custodian cares for their own practice. It never grants authority over another community's culture.";
