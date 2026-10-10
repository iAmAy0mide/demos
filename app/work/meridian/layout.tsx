import { Archivo, IBM_Plex_Mono } from "next/font/google";

import "@/src/demos/meridian/styles/tokens.css";
import "@/src/demos/meridian/styles/meridian.css";
import { MeridianLayout as MeridianSiteLayout } from "@/src/demos/meridian/components/layout/MeridianLayout";
import { DemoShell } from "@/src/shared/demo-shell/DemoShell";

import type { Metadata } from "next";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Meridian Freight · Lagos freight forwarding",
    template: "%s · Meridian Freight",
  },
  description: "Cargo coordination, freight forwarding and customs support across Nigeria.",
  openGraph: {
    title: "Meridian Freight",
    description: "Cargo coordination across Nigeria.",
    images: [
      { url: "/og/meridian.jpg", width: 1200, height: 630, alt: "Meridian Freight route map" },
    ],
  },
  twitter: { card: "summary_large_image", images: ["/og/meridian.jpg"] },
  robots: { index: false, follow: true },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23e75731'/%3E%3Ctext x='32' y='44' text-anchor='middle' font-family='Arial' font-size='38' font-weight='700' fill='white'%3EM%3C/text%3E%3C/svg%3E",
  },
};

type MeridianLayoutProps = Readonly<{ children: React.ReactNode }>;

export default function MeridianLayout({ children }: MeridianLayoutProps) {
  return (
    <div className={`meridian-demo ${archivo.variable} ${plexMono.variable}`}>
      <MeridianSiteLayout>{children}</MeridianSiteLayout>
      <DemoShell currentDemo="meridian" />
    </div>
  );
}
