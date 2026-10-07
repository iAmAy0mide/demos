import type { Metadata } from "next";
import { DispatchBoard } from "@/src/demos/fieldhand/components/DispatchBoard";
export const metadata: Metadata = { title: "Fieldhand" };
export default function FieldhandPage() { return <DispatchBoard />; }
