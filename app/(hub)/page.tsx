import { ContactSection } from "@/src/demos/hub/components/ContactSection";
import { HubHero } from "@/src/demos/hub/components/HubHero";
import { PrinciplesSection } from "@/src/demos/hub/components/PrinciplesSection";
import { ProcessSection } from "@/src/demos/hub/components/ProcessSection";
import { SelectedWork } from "@/src/demos/hub/components/SelectedWork";
import { ServicesSection } from "@/src/demos/hub/components/ServicesSection";
import { hubDescription, hubTitle, siteUrl } from "@/src/demos/hub/data/seo";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: hubTitle,
  description: hubDescription,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Axmion Web Innovations",
    locale: "en_NG",
    title: hubTitle,
    description: hubDescription,
    url: siteUrl,
    images: [
      { url: "/og/hub.jpg", width: 1200, height: 630, alt: "Axmion logo on an ink-blue field" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: hubTitle,
    description: hubDescription,
    images: ["/og/hub.jpg"],
  },
};

export default function HubPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: "Axmion Web Innovations",
    url: siteUrl,
    telephone: "+2348051681996",
    areaServed: "Nigeria",
    address: { "@type": "PostalAddress", addressLocality: "Lagos", addressCountry: "NG" },
    serviceType: ["Landing pages", "Business websites", "Custom internal tools"],
  };
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <HubHero />
      <SelectedWork />
      <ServicesSection />
      <ProcessSection />
      <PrinciplesSection />
      <ContactSection />
    </main>
  );
}
