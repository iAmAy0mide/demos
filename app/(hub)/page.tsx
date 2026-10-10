import { HubHero } from "@/src/demos/hub/components/HubHero";
import { PrinciplesSection } from "@/src/demos/hub/components/PrinciplesSection";
import { ProcessSection } from "@/src/demos/hub/components/ProcessSection";
import { SelectedWork } from "@/src/demos/hub/components/SelectedWork";
import { ServicesSection } from "@/src/demos/hub/components/ServicesSection";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Studio showcase" };

export default function HubPage() {
  return (
    <main>
      <HubHero />
      <SelectedWork />
      <ServicesSection />
      <ProcessSection />
      <PrinciplesSection />
    </main>
  );
}
