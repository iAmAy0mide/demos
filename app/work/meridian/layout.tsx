import { Archivo, IBM_Plex_Mono } from "next/font/google";

import "@/src/demos/meridian/styles/tokens.css";
import "@/src/demos/meridian/styles/meridian.css";
import { MeridianLayout as MeridianSiteLayout } from "@/src/demos/meridian/components/layout/MeridianLayout";
import { DemoShell } from "@/src/shared/demo-shell/DemoShell";

const archivo = Archivo({ subsets: ["latin"], variable: "--font-archivo", display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-mono", display: "swap" });

type MeridianLayoutProps = Readonly<{ children: React.ReactNode }>;

export default function MeridianLayout({ children }: MeridianLayoutProps) {
  return <div className={`meridian-demo ${archivo.variable} ${plexMono.variable}`}><MeridianSiteLayout>{children}</MeridianSiteLayout><DemoShell currentDemo="meridian" /></div>;
}
