"use client";

import { Building2, CircleAlert, WalletCards } from "lucide-react";

import { formatLagosLongDate, greetingPeriod } from "@/src/shared/lib/lagos-time";
import { useLagosNow } from "@/src/shared/lib/useLagosNow";

import { useRentbook } from "./RentbookProvider";
import { balanceForCharge, getChargeStatus, naira } from "../lib/finance";

import type { ReactNode } from "react";

export function Overview() {
  const { state } = useRentbook();
  const today = useLagosNow();
  if (!state.isLoaded || !today) {
    return (
      <main className="rbk-page">
        <p>Preparing your ledger…</p>
      </main>
    );
  }

  const visibleUnits = state.units.filter(
    (unit) => state.selectedPropertyId === "all" || unit.propertyId === state.selectedPropertyId,
  );
  const visibleUnitIds = new Set(visibleUnits.map((unit) => unit.id));
  const visibleLeases = state.leases.filter((lease) => visibleUnitIds.has(lease.unitId));
  const visibleLeaseIds = new Set(visibleLeases.map((lease) => lease.id));
  const visibleTenantIds = new Set(visibleLeases.map((lease) => lease.tenantId));
  const charges = state.charges.filter((charge) => visibleLeaseIds.has(charge.leaseId));
  const payments = state.payments.filter((payment) => visibleTenantIds.has(payment.tenantId));
  const outstanding = charges.reduce(
    (total, charge) => total + balanceForCharge(charge, payments),
    0,
  );
  const collected = payments.reduce((total, payment) => total + payment.amount, 0);
  const overdue = charges.filter(
    (charge) => getChargeStatus(charge, payments, today) === "overdue",
  );
  const occupied = visibleUnits.filter((unit) => unit.status === "occupied").length;
  const occupancy = Math.round((occupied / Math.max(visibleUnits.length, 1)) * 100);
  const paymentFeed = payments.slice(0, 5);

  return (
    <main className="rbk-page">
      <header className="rbk-page-header">
        <div>
          <p>{formatLagosLongDate(today)}</p>
          <h1>Good {greetingPeriod(today)}, Chinedu.</h1>
          <span>Collection health before your first site call.</span>
        </div>
      </header>
      <section className="rbk-summary" aria-label="Portfolio summary">
        <Metric icon={<WalletCards />} label="Collected this year" value={naira(collected)} />
        <Metric icon={<CircleAlert />} label="Outstanding" value={naira(outstanding)} />
        <Metric
          icon={<Building2 />}
          label="Occupancy"
          value={`${occupancy}% · ${occupied} of ${visibleUnits.length} units`}
        />
      </section>
      <section className="rbk-ledger-grid">
        <article className="rbk-income-chart">
          <p>Cash received</p>
          <h2>Monthly collection ledger</h2>
          <div className="rbk-bars" aria-label="Payments received in the latest twelve entries">
            {paymentFeed.map((payment) => (
              <span
                key={payment.id}
                style={{
                  height: `${Math.max(12, Math.round((payment.amount / Math.max(...paymentFeed.map((entry) => entry.amount), 1)) * 100))}%`,
                }}
              />
            ))}
          </div>
        </article>
        <article className="rbk-payment-feed">
          <p>Latest entries</p>
          <h2>Payment feed</h2>
          {paymentFeed.length ? (
            paymentFeed.map((payment) => {
              const tenant = state.tenants.find((entry) => entry.id === payment.tenantId);
              return (
                <div key={payment.id}>
                  <span>{tenant?.initials}</span>
                  <p>
                    <b>{tenant?.name}</b>
                    <small>
                      {payment.date} · {payment.reference}
                    </small>
                  </p>
                  <strong>{naira(payment.amount)}</strong>
                </div>
              );
            })
          ) : (
            <p className="rbk-empty">No payments recorded for this property.</p>
          )}
        </article>
      </section>
      <section className="rbk-attention">
        <div>
          <p>Needs attention</p>
          <h2>
            {overdue.length
              ? `${overdue.length} rent account${overdue.length > 1 ? "s are" : " is"} overdue`
              : "Nothing overdue today."}
          </h2>
        </div>
        {overdue.map((charge) => {
          const lease = state.leases.find((entry) => entry.id === charge.leaseId);
          const tenant = state.tenants.find((entry) => entry.id === lease?.tenantId);
          return (
            <article key={charge.id}>
              <span className="rbk-stamp">OVERDUE</span>
              <b>{tenant?.name}</b>
              <span>{charge.description}</span>
              <strong>{naira(balanceForCharge(charge, payments))}</strong>
            </article>
          );
        })}
      </section>
    </main>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <article>
      <span>{icon}</span>
      <p>{label}</p>
      <strong>{value}</strong>
    </article>
  );
}
