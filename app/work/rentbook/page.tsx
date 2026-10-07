import type { Metadata } from "next";
import { Overview } from "@/src/demos/rentbook/components/Overview";
export const metadata: Metadata = { title: "Rentbook | Okafor & Sons Properties", description: "A calm, precise rent and property management console." };
export default function RentbookPage() { return <Overview/>; }
