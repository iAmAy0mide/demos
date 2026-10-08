import { DeferredScreen } from "@/src/demos/rentbook/components/DeferredScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maintenance",
  description: "Maintenance requests and status tracking for Rentbook properties.",
};

export default function MaintenancePage() {
  return (
    <DeferredScreen
      title="Maintenance"
      description="Maintenance requests and their progress will live here."
    />
  );
}
