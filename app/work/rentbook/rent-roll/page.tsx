import { RentRoll } from "@/src/demos/rentbook/components/RentRoll";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rent roll | Rentbook",
  description: "Searchable rent collection ledger for Okafor & Sons Properties.",
};

export default function RentRollPage() {
  return <RentRoll />;
}
