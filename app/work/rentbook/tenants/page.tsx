import { DeferredScreen } from "@/src/demos/rentbook/components/DeferredScreen";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tenants",
  description: "Tenant profiles, leases and account histories for Okafor & Sons Properties.",
};

export default function TenantsPage() {
  return (
    <DeferredScreen
      title="Tenants"
      description="Tenant profiles, lease history and statements will live here."
    />
  );
}
