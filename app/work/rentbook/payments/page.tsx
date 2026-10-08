import { DeferredScreen } from "@/src/demos/rentbook/components/DeferredScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payments",
  description: "Payment history and receipts for Rentbook accounts.",
};

export default function PaymentsPage() {
  return (
    <DeferredScreen
      title="Payments"
      description="A searchable payment history and receipts will live here."
    />
  );
}
