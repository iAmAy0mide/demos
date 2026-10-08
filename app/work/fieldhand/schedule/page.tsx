import { ScheduleTimeline } from "@/src/demos/fieldhand/components/ScheduleTimeline";

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Fieldhand schedule" };

export default function FieldhandSchedulePage() {
  return <ScheduleTimeline />;
}
