import { RentRoll } from "@/src/demos/rentbook/components/RentRoll";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Rent roll",
  description: "Searchable rent collection ledger for Okafor & Sons Properties.",
};

export default function RentRollPage() {
  return <RentRoll />;
}
