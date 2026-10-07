import type { Metadata } from "next";
import { QuoteWorkspace } from "@/src/demos/fieldhand/components/QuoteWorkspace";

export const metadata: Metadata = { title: "Fieldhand quotes" };

export default function FieldhandQuotesPage() { return <QuoteWorkspace />; }
