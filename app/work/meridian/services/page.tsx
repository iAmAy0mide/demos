import type { Metadata } from "next";
import { ServicesPage } from "@/src/demos/meridian/components/services/ServicesPage";
export const metadata: Metadata = { title: "Freight services", description: "Sea, air, road, clearance and warehousing specifications from Meridian Freight." };
export default function Page() { return <ServicesPage />; }
