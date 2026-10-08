import { Bricolage_Grotesque, DM_Sans } from "next/font/google";

import "@/src/demos/sunreach/styles/tokens.css";
import { DemoShell } from "@/src/shared/demo-shell/DemoShell";

import type { Metadata } from "next";

type SunreachLayoutProps = Readonly<{ children: React.ReactNode }>;

export default function SunreachLayout({ children }: SunreachLayoutProps) {
  return (
    <div className={`sunreach-demo ${bricolage.variable} ${dmSans.variable}`}>
      {children}
      <DemoShell currentDemo="sunreach" />
    </div>
  );
}
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
export const metadata: Metadata = {
  title: { default: "Sunreach Power · Solar for Lagos", template: "%s · Sunreach Power" },
  description: "Solar and inverter systems built for homes and businesses in Lagos.",
  openGraph: { title: "Sunreach Power", description: "Solar and inverter systems for Lagos." },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23ffc400'/%3E%3Ctext x='32' y='44' text-anchor='middle' font-family='Arial' font-size='38' font-weight='700' fill='%230a1d38'%3ES%3C/text%3E%3C/svg%3E",
  },
};
