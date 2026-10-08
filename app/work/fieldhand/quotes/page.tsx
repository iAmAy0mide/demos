import { QuoteWorkspace } from "@/src/demos/fieldhand/components/QuoteWorkspace";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Fieldhand quotes" };

export default function FieldhandQuotesPage() {
  return <QuoteWorkspace />;
}
