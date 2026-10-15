import { Reports } from "@/src/demos/rentbook/components/Reports";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports",
  description: "Collection and arrears reporting for Rentbook landlords.",
};

export default function ReportsPage() {
  return <Reports />;
}
