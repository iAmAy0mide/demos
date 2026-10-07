import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackerPage } from "@/src/demos/meridian/components/tracker/TrackerPage";
export const metadata: Metadata = { title: "Shipment tracker", description: "Track a Meridian Freight demo shipment by reference number." };
export default function Page() { return <Suspense fallback={<div className="mrd-page"><p>Loading tracker…</p></div>}><TrackerPage /></Suspense>; }
