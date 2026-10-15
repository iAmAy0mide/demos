import { Hanken_Grotesk, Spline_Sans_Mono } from "next/font/google";

import "@/src/demos/rentbook/styles/tokens.css";
import "@/src/demos/rentbook/styles/rentbook.css";
import "@/src/demos/rentbook/styles/shell.css";
import "@/src/demos/rentbook/styles/overview.css";
import "@/src/demos/rentbook/styles/rent-roll.css";
import "@/src/demos/rentbook/styles/payments.css";
import "@/src/demos/rentbook/styles/tenants.css";
import "@/src/demos/rentbook/styles/ledger.css";
import "@/src/demos/rentbook/styles/properties.css";
import { RentbookProvider } from "@/src/demos/rentbook/components/RentbookProvider";
import { RentbookShell } from "@/src/demos/rentbook/components/RentbookShell";
import { DemoShell } from "@/src/shared/demo-shell/DemoShell";

import type { Metadata } from "next";

const hanken = Hanken_Grotesk({ subsets: ["latin"], variable: "--font-rbk-sans", display: "swap" });
const spline = Spline_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-rbk-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Rentbook · Rent management for landlords", template: "%s · Rentbook" },
  description:
    "A calm financial console for Nigerian landlords managing rent collection and property health.",
  openGraph: {
    title: "Rentbook · Rent management for landlords",
    description:
      "A calm financial console for Nigerian landlords managing rent collection and property health.",
    images: [
      {
        url: "/og/rentbook.jpg",
        width: 1200,
        height: 630,
        alt: "Rentbook property management console",
      },
    ],
  },
  twitter: { card: "summary_large_image", images: ["/og/rentbook.jpg"] },
  robots: { index: false, follow: true },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%230b6b4d'/%3E%3Ctext x='32' y='44' text-anchor='middle' font-family='Arial' font-size='38' font-weight='700' fill='white'%3ER%3C/text%3E%3C/svg%3E",
  },
};

export default function RentbookLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={`rentbook-demo ${hanken.variable} ${spline.variable}`}>
      <RentbookProvider>
        <RentbookShell>{children}</RentbookShell>
      </RentbookProvider>
      <DemoShell
        currentDemo="rentbook"
        bottomOffset="calc(3.25rem + 0.5rem + env(safe-area-inset-bottom))"
      />
    </div>
  );
}
