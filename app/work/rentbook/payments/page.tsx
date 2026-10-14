import { Payments } from "@/src/demos/rentbook/components/Payments";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payments",
  description: "Payment history and receipts for Rentbook accounts.",
};

export default function PaymentsPage() {
  return <Payments />;
}
