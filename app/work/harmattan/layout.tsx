import { Fraunces, Instrument_Sans } from "next/font/google";
import "@/src/demos/harmattan/styles/tokens.css";
import "@/src/demos/harmattan/styles/harmattan.css";
import { HarmattanSite } from "@/src/demos/harmattan/components/HarmattanSite";
import { DemoShell } from "@/src/shared/demo-shell/DemoShell";

type HarmattanLayoutProps = Readonly<{ children: React.ReactNode }>;

const fraunces=Fraunces({subsets:["latin"],variable:"--font-fraunces",display:"swap"});
const instrument=Instrument_Sans({subsets:["latin"],variable:"--font-instrument",display:"swap"});
export default function HarmattanLayout({ children }: HarmattanLayoutProps) { return <div className={`harmattan-demo ${fraunces.variable} ${instrument.variable}`}><HarmattanSite>{children}</HarmattanSite><DemoShell currentDemo="harmattan" /></div>; }
