import { Bricolage_Grotesque, DM_Sans } from "next/font/google";

import "@/src/demos/sunreach/styles/tokens.css";
import { DemoShell } from "@/src/shared/demo-shell/DemoShell";

type SunreachLayoutProps = Readonly<{ children: React.ReactNode }>;

export default function SunreachLayout({ children }: SunreachLayoutProps) {
  return <div className={`sunreach-demo ${bricolage.variable} ${dmSans.variable}`}>{children}<DemoShell currentDemo="sunreach" /></div>;
}
const bricolage = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-bricolage", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });
