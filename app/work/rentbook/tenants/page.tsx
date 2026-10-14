import { TenantList } from "@/src/demos/rentbook/components/TenantList";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tenants",
  description: "Tenant profiles, leases and account histories for Okafor & Sons Properties.",
};

export default function TenantsPage() {
  return <TenantList />;
}
