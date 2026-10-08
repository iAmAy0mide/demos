import { HomePage } from "@/src/demos/meridian/components/home/HomePage";

import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Meridian Freight | Lagos freight forwarding",
  description: "Sea, air, road and customs coordination for serious cargo moving through Nigeria.",
};
export default function MeridianPage() {
  return <HomePage />;
}
