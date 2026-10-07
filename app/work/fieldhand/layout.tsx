import { Geist, Geist_Mono } from "next/font/google";

import { FieldhandProvider } from "@/src/demos/fieldhand/components/FieldhandProvider";
import { FieldhandShell } from "@/src/demos/fieldhand/components/FieldhandShell";
import "@/src/demos/fieldhand/styles/tokens.css";
import { DemoShell } from "@/src/shared/demo-shell/DemoShell";

const geist = Geist({ subsets: ["latin"], variable: "--fld-font-sans", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--fld-font-mono", display: "swap" });

type FieldhandLayoutProps = Readonly<{ children: React.ReactNode }>;

export default function FieldhandLayout({ children }: FieldhandLayoutProps) {
  return (
    <div className={`fieldhand-demo ${geist.variable} ${geistMono.variable}`}>
      <FieldhandProvider>
        <FieldhandShell>{children}</FieldhandShell>
      </FieldhandProvider>
      <DemoShell currentDemo="fieldhand" />
    </div>
  );
}
