import type { Metadata } from "next";
import { AboutPage } from "@/src/demos/meridian/components/info/InfoPages";
export const metadata: Metadata = { title: "About Meridian Freight", description: "The operating principles behind Meridian Freight’s Lagos control desk." };
export default function Page() { return <AboutPage />; }
