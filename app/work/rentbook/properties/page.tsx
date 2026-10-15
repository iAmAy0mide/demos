import { Properties } from "@/src/demos/rentbook/components/Properties";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Properties",
  description: "Property health and occupancy for the Okafor & Sons portfolio.",
};

export default function PropertiesPage() {
  return <Properties />;
}
