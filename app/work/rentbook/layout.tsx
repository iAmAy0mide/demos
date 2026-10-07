import { Hanken_Grotesk, Spline_Sans_Mono } from "next/font/google";
import "@/src/demos/rentbook/styles/tokens.css";
import "@/src/demos/rentbook/styles/rentbook.css";
import { RentbookProvider } from "@/src/demos/rentbook/components/RentbookProvider";
import { DemoShell } from "@/src/shared/demo-shell/DemoShell";
import { RentbookShell } from "@/src/demos/rentbook/components/RentbookShell";

const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-rbk-sans", display: "swap" });
const spline = Spline_Sans_Mono({ subsets: ["latin"], variable: "--font-rbk-mono", display: "swap" });
export default function RentbookLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <div className={`rentbook-demo ${hanken.variable} ${spline.variable}`}><RentbookProvider><RentbookShell>{children}</RentbookShell></RentbookProvider><DemoShell currentDemo="rentbook"/></div>; }
