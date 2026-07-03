import { AboutSection } from "@/components/home/AboutSection";
import { BusinessSection } from "@/components/home/BusinessSection";
import { ContactCta } from "@/components/home/ContactCta";
import { Hero } from "@/components/home/Hero";
import { NewsSection } from "@/components/home/NewsSection";
import { PartnerSection } from "@/components/home/PartnerSection";
import { PurposeBand } from "@/components/home/PurposeBand";
import { ServiceSection } from "@/components/home/ServiceSection";
import { SustainabilitySection } from "@/components/home/SustainabilitySection";
import { TechCultureSection } from "@/components/home/TechCultureSection";
import { TrustBar } from "@/components/home/TrustBar";

// microCMS のニュースを定期再取得（ISR）
export const revalidate = 60;

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <NewsSection />
      <AboutSection />
      <BusinessSection />
      <ServiceSection />
      <SustainabilitySection />
      <PurposeBand />
      <TechCultureSection />
      <PartnerSection />
      <ContactCta />
    </>
  );
}
