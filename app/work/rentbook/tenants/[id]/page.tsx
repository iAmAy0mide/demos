import { notFound } from "next/navigation";

import { TenantLedger } from "@/src/demos/rentbook/components/TenantLedger";
import { isSeedTenantId } from "@/src/demos/rentbook/data/seedData";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tenant ledger",
  description: "Tenant ledger and printable statement for Okafor & Sons Properties.",
};

export default async function TenantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isSeedTenantId(id)) {
    notFound();
  }
  return <TenantLedger tenantId={id} />;
}
