import { DeferredScreen } from "@/src/demos/rentbook/components/DeferredScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Properties",
  description: "Property health and occupancy for the Okafor & Sons portfolio.",
};

export default function PropertiesPage() {
  return (
    <DeferredScreen
      title="Properties"
      description="Building health, occupancy and unit details will live here."
    />
  );
}
