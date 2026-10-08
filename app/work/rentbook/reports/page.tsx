import { DeferredScreen } from "@/src/demos/rentbook/components/DeferredScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports",
  description: "Collection and arrears reporting for Rentbook landlords.",
};

export default function ReportsPage() {
  return (
    <DeferredScreen
      title="Reports"
      description="Collection, income and arrears reporting will live here."
    />
  );
}
