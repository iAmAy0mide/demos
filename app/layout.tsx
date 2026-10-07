import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Axmion Showcase", template: "%s | Axmion Showcase" },
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
