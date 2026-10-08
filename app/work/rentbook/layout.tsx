import { Hanken_Grotesk, Spline_Sans_Mono } from "next/font/google";

import "@/src/demos/rentbook/styles/tokens.css";
import "@/src/demos/rentbook/styles/rentbook.css";
import "@/src/demos/rentbook/styles/shell.css";
import "@/src/demos/rentbook/styles/overview.css";
import "@/src/demos/rentbook/styles/rent-roll.css";
import "@/src/demos/rentbook/styles/payments.css";
import { RentbookProvider } from "@/src/demos/rentbook/components/RentbookProvider";
import { RentbookShell } from "@/src/demos/rentbook/components/RentbookShell";
import { DemoShell } from "@/src/shared/demo-shell/DemoShell";

const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-rbk-sans", display: "swap" });
const spline = Spline_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-rbk-mono",
  display: "swap",
});

export default function RentbookLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={`rentbook-demo ${hanken.variable} ${spline.variable}`}>
      <RentbookProvider>
        <RentbookShell>{children}</RentbookShell>
      </RentbookProvider>
      <DemoShell currentDemo="rentbook" />
    </div>
  );
}
