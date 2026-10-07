import type { Metadata } from "next";
import { Suspense } from "react";
import { QuotePage } from "@/src/demos/meridian/components/quote/QuotePage";
export const metadata: Metadata = { title: "Request a freight quote", description: "Send Meridian Freight the cargo facts for a documented quote." };
export default function Page() { return <Suspense fallback={<div className="mrd-page">Loading quote desk…</div>}><QuotePage /></Suspense>; }
