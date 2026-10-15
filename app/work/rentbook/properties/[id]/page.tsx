import { notFound } from "next/navigation";

import { PropertyBuilding } from "@/src/demos/rentbook/components/PropertyBuilding";
import { isSeedPropertyId } from "@/src/demos/rentbook/data/seedData";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Building view",
  description: "Building occupancy, rent health and unit actions for Okafor & Sons Properties.",
};

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isSeedPropertyId(id)) {
    notFound();
  }
  return <PropertyBuilding propertyId={id} />;
}
