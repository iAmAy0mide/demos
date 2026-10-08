import type { Metadata } from "next";
import "./globals.css";
import "@/src/shared/components/AxmionAttribution/AxmionAttribution.css";
import "@/src/shared/demo-shell/DemoShell.css";

export const metadata: Metadata = {
  title: "Axmion Web Innovations",
  description: "Concept websites and tools by Axmion Web Innovations.",
};

type RootLayoutProps = Readonly<{ children: React.ReactNode }>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
