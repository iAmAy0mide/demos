import type { Metadata } from "next";
import { ScheduleTimeline } from "@/src/demos/fieldhand/components/ScheduleTimeline";

export const metadata: Metadata = { title: "Fieldhand schedule" };

export default function FieldhandSchedulePage() { return <ScheduleTimeline />; }
