"use client";

import Link from "next/link";
import { useMemo } from "react";

import { lagosDateKey } from "@/src/shared/lib/lagos-time";
import { useLagosNow } from "@/src/shared/lib/useLagosNow";

import { LedgerSupport } from "./LedgerSupport";
import { useRentbook } from "./RentbookProvider";
import { formatRentbookDate, naira } from "../lib/finance";
import { buildLedger } from "../lib/ledger";

type TenantLedgerProps = { tenantId: string };

export function TenantLedger({ tenantId }: TenantLedgerProps) {
  const { state } = useRentbook();
  const now = useLagosNow();
  const details = useMemo(() => tenantDetails(state, tenantId), [state, tenantId]);
  if (!state.isLoaded || !now) {
    return <main className="rbk-page">Preparing tenant ledger…</main>;
  }
  if (!details) {
    return <main className="rbk-page">Tenant record is unavailable.</main>;
  }
  const rows = buildLedger(details.charges, details.payments);
  const closingBalance = rows.at(-1)?.balance ?? 0;
  return (
    <main className="rbk-page rbk-ledger-page" data-testid="tenant-ledger">
      <section className="rbk-statement" data-testid="tenant-statement">
        <header className="rbk-page-header rbk-ledger-header">
          <div>
            <p>Tenant account · {details.property.name}</p>
            <h1>{details.tenant.name}</h1>
            <span>
              {details.unit.label} ·{" "}
              {details.unit.status === "notice_given" ? "Notice given" : "Active lease"}
            </span>
          </div>
          <div className="rbk-ledger-contact">
            <a href={`tel:${details.tenant.phone.replace(/\s/g, "")}`}>{details.tenant.phone}</a>
            <a href={`https://wa.me/${details.tenant.phone.replace(/\D/g, "")}`}>WhatsApp</a>
          </div>
        </header>
        <dl className="rbk-lease-summary">
          <div>
            <dt>Frequency</dt>
            <dd>{details.lease.frequency.replace("_", " ")}</dd>
          </div>
          <div>
            <dt>Rent</dt>
            <dd>{naira(details.lease.rentAmount)}</dd>
          </div>
          <div>
            <dt>Lease term</dt>
            <dd>
              {formatRentbookDate(details.lease.startDate)} –{" "}
              {formatRentbookDate(details.lease.endDate)}
            </dd>
          </div>
          <div>
            <dt>Deposit</dt>
            <dd>{naira(details.lease.cautionDeposit)}</dd>
          </div>
          <div>
            <dt>Fees</dt>
            <dd>
              {naira(
                details.lease.agencyFee + details.lease.legalFee + details.lease.serviceCharge,
              )}
            </dd>
          </div>
        </dl>
        <LedgerTable rows={rows} closingBalance={closingBalance} />
        <footer className="rbk-statement-footer">
          Okafor & Sons Properties · 18 Admiralty Way, Lagos · Statement prepared{" "}
          {formatRentbookDate(lagosDateKey(now))}
        </footer>
      </section>
      <section className="rbk-ledger-actions" aria-label="Tenant actions">
        <button
          className="rbk-primary"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("rentbook:payment", { detail: { tenantId } }))
          }
        >
          Record payment
        </button>
        <button
          type="button"
          onClick={() =>
            window.dispatchEvent(new CustomEvent("rentbook:reminder", { detail: { tenantId } }))
          }
        >
          Send reminder
        </button>
        <button type="button" onClick={() => window.print()}>
          Print statement
        </button>
      </section>
      <LedgerSupport rows={rows} tenantId={tenantId} now={now} />
    </main>
  );
}

function LedgerTable({
  rows,
  closingBalance,
}: {
  rows: ReturnType<typeof buildLedger>;
  closingBalance: number;
}) {
  return (
    <div className="rbk-ledger-table">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Entry</th>
            <th>Charge</th>
            <th>Payment</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{formatRentbookDate(row.date)}</td>
              <td>
                {row.paymentId ? (
                  <Link href={`/work/rentbook/payments?receipt=${row.paymentId}`}>
                    {row.description}
                  </Link>
                ) : (
                  row.description
                )}
              </td>
              <td>{row.debit ? naira(row.debit) : "—"}</td>
              <td>{row.credit ? naira(row.credit) : "—"}</td>
              <td>{naira(row.balance)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th colSpan={4}>Closing balance</th>
            <td>{naira(closingBalance)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

function tenantDetails(state: ReturnType<typeof useRentbook>["state"], tenantId: string) {
  const tenant = state.tenants.find((item) => item.id === tenantId);
  const lease = state.leases.find((item) => item.tenantId === tenantId);
  const unit = state.units.find((item) => item.id === lease?.unitId);
  const property = state.properties.find((item) => item.id === unit?.propertyId);
  if (!tenant || !lease || !unit || !property) {
    return null;
  }
  return {
    tenant,
    lease,
    unit,
    property,
    charges: state.charges.filter((item) => item.leaseId === lease.id),
    payments: state.payments.filter((item) => item.tenantId === tenantId),
  };
}
