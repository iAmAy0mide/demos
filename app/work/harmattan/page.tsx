import { HomePage } from "@/src/demos/harmattan/components/Pages";

import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Coffee for deliberate mornings",
  description: "Small-lot coffee roasted in Lagos and delivered with care.",
};
export default function HarmattanPage() {
  return <HomePage />;
}
