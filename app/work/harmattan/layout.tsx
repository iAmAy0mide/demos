import { Fraunces, Instrument_Sans } from "next/font/google";

import "@/src/demos/harmattan/styles/tokens.css";
import "@/src/demos/harmattan/styles/harmattan.css";
import { HarmattanSite } from "@/src/demos/harmattan/components/HarmattanSite";
import { DemoShell } from "@/src/shared/demo-shell/DemoShell";

import type { Metadata } from "next";

type HarmattanLayoutProps = Readonly<{ children: React.ReactNode }>;

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});
export const metadata: Metadata = {
  title: {
    default: "Harmattan Coffee Co. · Lagos roastery",
    template: "%s · Harmattan Coffee Co.",
  },
  description: "Small-lot coffee roasted in Lagos for deliberate mornings.",
  openGraph: { title: "Harmattan Coffee Co.", description: "Small-lot coffee roasted in Lagos." },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%235f3c22'/%3E%3Ctext x='32' y='44' text-anchor='middle' font-family='Arial' font-size='38' font-weight='700' fill='white'%3EH%3C/text%3E%3C/svg%3E",
  },
};
export default function HarmattanLayout({ children }: HarmattanLayoutProps) {
  return (
    <div className={`harmattan-demo ${fraunces.variable} ${instrument.variable}`}>
      <HarmattanSite>{children}</HarmattanSite>
      <DemoShell currentDemo="harmattan" />
    </div>
  );
}
