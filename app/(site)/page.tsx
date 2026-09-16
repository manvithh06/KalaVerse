import { Hero } from "@/components/home/hero";
import { BoundariesSection, CultureIsNotContent, FinalStatement, Tagline } from "@/components/home/statements";
import { LivingTraditions } from "@/components/home/living-traditions";
import { SoilOfTulunadu } from "@/components/home/soil-of-tulunadu";
import { WhoTellsTheStory } from "@/components/home/who-tells";
import { ConsentShowcase } from "@/components/home/consent-showcase";
import { VaultSection } from "@/components/home/vault-section";
import { AISection } from "@/components/home/ai-section";
import { EconomicsSection } from "@/components/home/economics-section";
import { GovernanceSection } from "@/components/home/governance-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Tagline />
      <CultureIsNotContent />
      <LivingTraditions />
      <SoilOfTulunadu />
      <WhoTellsTheStory />
      <ConsentShowcase />
      <BoundariesSection />
      <VaultSection />
      <AISection />
      <EconomicsSection />
      <GovernanceSection />
      <FinalStatement />
    </>
  );
}
