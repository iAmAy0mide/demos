import { Geist, Geist_Mono } from "next/font/google";

import { FieldhandProvider } from "@/src/demos/fieldhand/components/FieldhandProvider";
import { FieldhandShell } from "@/src/demos/fieldhand/components/FieldhandShell";
import "@/src/demos/fieldhand/styles/tokens.css";
import { DemoShell } from "@/src/shared/demo-shell/DemoShell";

import type { Metadata } from "next";

const geist = Geist({ subsets: ["latin"], variable: "--fld-font-sans", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--fld-font-mono", display: "swap" });
export const metadata: Metadata = {
  title: { default: "Fieldhand · Field operations", template: "%s · Fieldhand" },
  description: "A focused dispatch console for field-service teams in Lagos.",
  openGraph: {
    title: "Fieldhand",
    description: "A focused dispatch console for field-service teams.",
    images: [
      { url: "/og/fieldhand.jpg", width: 1200, height: 630, alt: "Fieldhand dispatch console" },
    ],
  },
  twitter: { card: "summary_large_image", images: ["/og/fieldhand.jpg"] },
  robots: { index: false, follow: true },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23121820'/%3E%3Ctext x='32' y='44' text-anchor='middle' font-family='Arial' font-size='38' font-weight='700' fill='%23b4fa4a'%3EF%3C/text%3E%3C/svg%3E",
  },
};

type FieldhandLayoutProps = Readonly<{ children: React.ReactNode }>;

export default function FieldhandLayout({ children }: FieldhandLayoutProps) {
  return (
    <div className={`fieldhand-demo ${geist.variable} ${geistMono.variable}`}>
      <FieldhandProvider>
        <FieldhandShell>{children}</FieldhandShell>
      </FieldhandProvider>
      <DemoShell
        currentDemo="fieldhand"
        bottomOffset="calc(4.5rem + 0.5rem + env(safe-area-inset-bottom))"
      />
    </div>
  );
}
