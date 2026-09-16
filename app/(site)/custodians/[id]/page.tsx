import type { Metadata } from "next";
import { getCustodianSeed } from "@/data/custodians";
import { PublicProfile } from "@/components/custodian/public-profile";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const custodian = getCustodianSeed(id);
  return { title: custodian ? custodian.name : "Custodian" };
}

export default async function CustodianProfilePage({ params }: Props) {
  const { id } = await params;
  return <PublicProfile id={id} />;
}
