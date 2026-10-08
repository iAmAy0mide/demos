import { ContactPage } from "@/src/demos/meridian/components/info/InfoPages";

import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Contact Meridian Freight",
  description: "Contact Meridian Freight offices in Lagos, Abuja and Port Harcourt.",
};
export default function Page() {
  return <ContactPage />;
}
