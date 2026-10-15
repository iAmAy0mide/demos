import { Maintenance } from "@/src/demos/rentbook/components/Maintenance";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maintenance",
  description: "Maintenance requests and status tracking for Rentbook properties.",
};

export default function MaintenancePage() {
  return <Maintenance />;
}
