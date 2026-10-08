import { DispatchBoard } from "@/src/demos/fieldhand/components/DispatchBoard";

import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Dispatch board",
  description: "Assign, track and close field-service jobs from one focused workspace.",
};
export default function FieldhandPage() {
  return <DispatchBoard />;
}
