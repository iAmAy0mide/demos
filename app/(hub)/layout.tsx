import localFont from "next/font/local";

import "@/src/demos/hub/styles/tokens.css";
import { HubFooter } from "@/src/demos/hub/components/HubFooter";
import { HubHeader } from "@/src/demos/hub/components/HubHeader";

import type { Metadata } from "next";

const schibsted = localFont({
  src: [
    { path: "../../src/demos/hub/fonts/SchibstedGrotesk-Latin-400.woff2", weight: "400" },
    { path: "../../src/demos/hub/fonts/SchibstedGrotesk-Latin-500.woff2", weight: "500" },
    { path: "../../src/demos/hub/fonts/SchibstedGrotesk-Latin-600.woff2", weight: "600" },
  ],
  variable: "--font-schibsted",
  display: "swap",
});
const instrumentSerif = localFont({
  src: [
    {
      path: "../../src/demos/hub/fonts/InstrumentSerif-Latin-400-Italic.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-instrument-serif",
  display: "swap",
});
const martian = localFont({
  src: [
    { path: "../../src/demos/hub/fonts/MartianMono-Latin-400.woff2", weight: "400" },
    { path: "../../src/demos/hub/fonts/MartianMono-Latin-500.woff2", weight: "500" },
  ],
  variable: "--font-martian",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Axmion Web Innovations · Websites that turn attention into action",
  description: "Axmion Web Innovations designs websites and tools that turn attention into action.",
  openGraph: {
    title: "Axmion Web Innovations · Websites that turn attention into action",
    description: "Websites and tools designed to turn attention into action.",
  },
  icons: {
    icon: "/images/logo-mark-64.png",
    apple: "/images/apple-touch-icon.png",
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
