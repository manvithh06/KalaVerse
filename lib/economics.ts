import type { Payout, TransactionKind } from "@/types";

/** Experiences carry a 10% platform fee. Craft sales carry 5%, so makers keep more of each piece. */
export const FEE_RATE: Record<TransactionKind, number> = {
  experience: 0.1,
  product: 0.05,
};

export function payoutFor(gross: number, kind: TransactionKind): Payout {
  const platformFee = Math.round(gross * FEE_RATE[kind]);
  return { gross, platformFee, custodianNet: gross - platformFee };
}

/** Share of each payout the demo custodian has chosen to pass to troupe artists. */
export const COMMUNITY_SHARE = 0.2;
