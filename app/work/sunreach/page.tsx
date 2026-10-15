import { SunreachLanding } from "@/src/demos/sunreach/components/SunreachLanding";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solar and inverter systems in Lagos",
  description:
    "Book a free Sunreach Power site inspection and see an illustrative solar saving estimate for your Lagos home or business.",
  openGraph: {
    title: "Stop feeding your generator. Keep your day moving.",
    description: "A free solar site inspection from Sunreach Power.",
    images: [{ url: "/og/sunreach.jpg", width: 1200, height: 630, alt: "Sunreach Power" }],
  },
  twitter: { card: "summary_large_image", images: ["/og/sunreach.jpg"] },
};
export default function SunreachPage() {
  return <SunreachLanding />;
}
