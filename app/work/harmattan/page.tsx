import type { Metadata } from "next"; import { HomePage } from "@/src/demos/harmattan/components/Pages";
export const metadata: Metadata = { title: "Harmattan Coffee Co. | Coffee for deliberate mornings", description:"Small-lot coffee roasted in Lagos and delivered with care." };
export default function HarmattanPage() { return <HomePage/>; }
