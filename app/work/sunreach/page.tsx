import { SunreachLanding } from "@/src/demos/sunreach/components/SunreachLanding";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solar and inverter systems in Lagos",
  description:
    "Book a free Sunreach Power site inspection and see an illustrative solar saving estimate for your Lagos home or business.",
  openGraph: {
    title: "Stop feeding your generator. Keep your day moving.",
    description: "A free solar site inspection from Sunreach Power.",
  },
};
export default function SunreachPage() {
  return <SunreachLanding />;
}
