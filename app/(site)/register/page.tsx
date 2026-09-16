import type { Metadata } from "next";
import { Onboarding } from "@/components/register/onboarding";

export const metadata: Metadata = { title: "Become a custodian" };

export default function RegisterPage() {
  return <Onboarding />;
}
