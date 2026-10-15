"use client";

import Link from "next/link";
import { useMemo } from "react";

import { useLagosNow } from "@/src/shared/lib/useLagosNow";

import { BuildingMini } from "./PropertyBuilding";
import { useRentbook } from "./RentbookProvider";
import { balanceForCharge, compactNaira, naira } from "../lib/finance";

export function Properties() {
  const { state } = useRentbook();
  const now = useLagosNow();
  const properties = useMemo(
    () =>
      state.properties.filter(
        (property) =>
          state.selectedPropertyId === "all" || property.id === state.selectedPropertyId,
      ),
    [state],
  );
  if (!state.isLoaded || !now) {
    return <main className="rbk-page">Preparing properties…</main>;
  }
  return (
    <main className="rbk-page rbk-properties" data-testid="property-grid">
      <header className="rbk-page-header">
        <div>
          <p>Portfolio buildings</p>
          <h1>Properties</h1>
          <span>{properties.length} buildings in this view</span>
        </div>
      </header>
      <section className="rbk-property-grid">
        {properties.map((property) => {
          const units = state.units.filter((unit) => unit.propertyId === property.id);
          const leases = state.leases.filter((lease) =>
            units.some((unit) => unit.id === lease.unitId),
          );
          const charges = state.charges.filter((charge) =>
            leases.some((lease) => lease.id === charge.leaseId),
          );
          const arrears = charges.reduce(
            (total, charge) => total + balanceForCharge(charge, state.payments),
            0,
          );
          const income = state.payments
            .filter(
              (payment) =>
                leases.some((lease) => lease.tenantId === payment.tenantId) &&
                payment.date.startsWith(String(now.getFullYear())),
            )
            .reduce((total, payment) => total + payment.amount, 0);
          return (
            <Link
              href={`/work/rentbook/properties/${property.id}`}
              className="rbk-property-card"
              key={property.id}
            >
              <BuildingMini units={units} />
              <div>
                <p>{property.area}</p>
                <h2>{property.name}</h2>
                <span>
                  {units.filter((unit) => unit.tenantId).length}/{units.length} occupied
                </span>
              </div>
              <dl>
                <div>
                  <dt>Income this year</dt>
                  <dd>{compactNaira(income)}</dd>
                </div>
                <div>
                  <dt>Arrears</dt>
                  <dd>{naira(arrears)}</dd>
                </div>
              </dl>
            </Link>
          );
        })}
      </section>
    </main>
  );
}
