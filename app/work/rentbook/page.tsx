import { Overview } from "@/src/demos/rentbook/components/Overview";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overview",
  description: "A calm, precise rent and property management console.",
};

export default function RentbookPage() {
  return <Overview />;
}
