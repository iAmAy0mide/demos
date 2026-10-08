import { HubHoldingPanel } from "@/src/demos/hub/components/HubHoldingPanel";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Studio showcase" };

export default function HubPage() {
  return <HubHoldingPanel />;
}
