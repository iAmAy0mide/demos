import type { Metadata } from "next";

export const metadata: Metadata = { title: "Fieldhand schedule" };

export default function FieldhandSchedulePage() {
  return <main className="p-6"><h1 className="text-xl font-semibold">Today’s schedule</h1></main>;
}
