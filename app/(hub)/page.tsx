import { HubHero } from "@/src/demos/hub/components/HubHero";
import { SelectedWork } from "@/src/demos/hub/components/SelectedWork";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Studio showcase" };

export default function HubPage() {
  return (
    <main>
      <HubHero />
      <SelectedWork />
    </main>
  );
}
