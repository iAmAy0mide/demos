import { Instrument_Serif, Martian_Mono, Schibsted_Grotesk } from "next/font/google";

import "@/src/demos/hub/styles/tokens.css";
import { HubFooter } from "@/src/demos/hub/components/HubFooter";
import { HubHeader } from "@/src/demos/hub/components/HubHeader";

import type { Metadata } from "next";

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
  display: "swap",
});
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-instrument-serif",
  display: "swap",
});
const martian = Martian_Mono({ subsets: ["latin"], variable: "--font-martian", display: "swap" });

export const metadata: Metadata = {
  title: "Axmion Web Innovations · Websites that turn attention into action",
  description: "Axmion Web Innovations designs websites and tools that turn attention into action.",
  openGraph: {
    title: "Axmion Web Innovations · Websites that turn attention into action",
    description: "Websites and tools designed to turn attention into action.",
  },
};

type HubLayoutProps = Readonly<{ children: React.ReactNode }>;

export default function HubLayout({ children }: HubLayoutProps) {
  return (
    <div
      className={`axmion-hub ${schibsted.variable} ${instrumentSerif.variable} ${martian.variable}`}
    >
      <HubHeader />
      {children}
      <HubFooter />
    </div>
  );
}
