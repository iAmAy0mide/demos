"use client";

import Link from "next/link";
import { useState } from "react";

import { useLagosNow } from "@/src/shared/lib/useLagosNow";

import { BuildingDrawing } from "./BuildingDrawing";
import { useRentbook } from "./RentbookProvider";
import { buildBuildingLayout } from "../lib/buildingLayout";
import { balanceForCharge, naira, relativeDueDate, getChargeStatus } from "../lib/finance";

import type { Unit } from "../types";

type BuildingProps = { propertyId: string };
const STATUS_LABELS = {
  paid: "Paid",
  due_soon: "Due soon",
  overdue: "Overdue",
  partial: "Partial",
  vacant: "Vacant",
  notice: "Notice",
  maintenance: "Maintenance",
} as const;
type VisualStatus = keyof typeof STATUS_LABELS;

export function PropertyBuilding({ propertyId }: BuildingProps) {
  const { state } = useRentbook();
  const now = useLagosNow();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const property = state.properties.find((item) => item.id === propertyId);
  const units = state.units.filter((unit) => unit.propertyId === propertyId);
  if (!state.isLoaded || !now) {
    return <main className="rbk-page">Drawing building view…</main>;
  }
  if (!property) {
    return <main className="rbk-page">Building record is unavailable.</main>;
  }
  const selected = units.find((unit) => unit.id === selectedId) ?? units[0];
  const select = (unit: Unit) => setSelectedId(unit.id);
  return (
    <main className="rbk-page rbk-building-page" data-testid="building-view">
      <header className="rbk-page-header">
        <div>
          <p>{property.area} · Building view</p>
          <h1>{property.name}</h1>
          <span>
            {units.filter((unit) => unit.tenantId).length}/{units.length} occupied ·{" "}
            {property.address}
          </span>
        </div>
      </header>
      <section className="rbk-building-stats">
        <Stat
          label="Occupancy"
          value={`${Math.round((units.filter((unit) => unit.tenantId).length / units.length) * 100)}%`}
        />
        <Stat label="Income this year" value={naira(incomeForProperty(propertyId, state, now))} />
        <Stat label="Arrears" value={naira(arrearsForProperty(propertyId, state))} />
        <Stat label="Upcoming expiry" value={nextExpiry(propertyId, state) ?? "None"} />
      </section>
      <div className="rbk-building-layout">
        <BuildingDrawing
          units={units}
          selectedId={selected.id}
          getDetail={(unit) => unitDetail(unit, state, now)}
          onSelect={select}
        />
        <UnitPanel unit={selected} state={state} now={now} />
      </div>
      <section className="rbk-unit-list" aria-label="All units">
        <h2>All units</h2>
        {units.map((unit) => (
          <button
            key={unit.id}
            type="button"
            onClick={() => select(unit)}
            aria-pressed={selected.id === unit.id}
          >
            {unit.label}
            <span>{STATUS_LABELS[unitDetail(unit, state, now).status]}</span>
          </button>
        ))}
      </section>
    </main>
  );
}

export function BuildingMini({ units }: { units: Unit[] }) {
  const layout = buildBuildingLayout(units.map((unit) => unit.id));
  return (
    <svg
      className="rbk-building-mini"
      viewBox={`0 0 ${layout.viewBox.width} ${layout.viewBox.height}`}
      aria-hidden="true"
    >
      <path
        d={`M56 74 L${layout.viewBox.width - 56} 74 L${layout.viewBox.width - 78} 38 L78 38 Z`}
      />
      <rect x="56" y="74" width={layout.viewBox.width - 112} height={layout.viewBox.height - 74} />
      {layout.units.map((position) => (
        <rect key={position.id} {...position} rx="8" />
      ))}
    </svg>
  );
}

function UnitPanel({
  unit,
  state,
  now,
}: {
  unit: Unit;
  state: ReturnType<typeof useRentbook>["state"];
  now: Date;
}) {
  const detail = unitDetail(unit, state, now);
  return (
    <aside className="rbk-unit-panel" aria-live="polite">
      <p>Selected unit</p>
      <h2>{unit.label}</h2>
      <strong className={`rbk-status rbk-status-${detail.status}`}>
        {STATUS_LABELS[detail.status]}
      </strong>
      {detail.tenant && detail.lease ? (
        <>
          <h3>{detail.tenant.name}</h3>
          <dl>
            <div>
              <dt>Lease</dt>
              <dd>Ends {detail.lease.endDate}</dd>
            </div>
            <div>
              <dt>Balance</dt>
              <dd>{naira(detail.balance)}</dd>
            </div>
            <div>
              <dt>Next due</dt>
              <dd>{detail.nextDue}</dd>
            </div>
          </dl>
          <div className="rbk-unit-actions">
            <button
              className="rbk-primary"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("rentbook:payment", { detail: { tenantId: detail.tenant?.id } }),
                )
              }
            >
              Record payment
            </button>
            <button
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("rentbook:reminder", { detail: { tenantId: detail.tenant?.id } }),
                )
              }
            >
              Send reminder
            </button>
            <Link href={`/work/rentbook/tenants/${detail.tenant.id}`}>View tenant</Link>
          </div>
        </>
      ) : (
        <>
          <p>Vacant since 1 Oct 2026</p>
          <strong>Asking {naira(350000)} / month</strong>
        </>
      )}
    </aside>
  );
}

function unitDetail(unit: Unit, state: ReturnType<typeof useRentbook>["state"], now: Date) {
  const tenant = state.tenants.find((item) => item.id === unit.tenantId);
  const lease = state.leases.find((item) => item.id === unit.leaseId);
  const charges = state.charges.filter((charge) => charge.leaseId === lease?.id);
  const balance = charges.reduce(
    (total, charge) => total + balanceForCharge(charge, state.payments),
    0,
  );
  const current = charges.at(-1);
  const chargeStatus = current ? getChargeStatus(current, state.payments, now) : "paid";
  const status = unitVisualStatus(unit.status, chargeStatus);
  return {
    tenant,
    lease,
    balance,
    status,
    nextDue: current ? relativeDueDate(current.dueDate, now) : "No charge due",
  };
}

function unitVisualStatus(
  unitStatus: Unit["status"],
  chargeStatus: ReturnType<typeof getChargeStatus>,
): VisualStatus {
  if (unitStatus === "vacant") {
    return "vacant";
  }
  if (unitStatus === "under_maintenance") {
    return "maintenance";
  }
  if (unitStatus === "notice_given") {
    return "notice";
  }
  return chargeStatus === "upcoming" ? "due_soon" : chargeStatus;
}
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
function incomeForProperty(
  propertyId: string,
  state: ReturnType<typeof useRentbook>["state"],
  now: Date,
) {
  const tenantIds = state.leases
    .filter((lease) =>
      state.units.some((unit) => unit.id === lease.unitId && unit.propertyId === propertyId),
    )
    .map((lease) => lease.tenantId);
  return state.payments
    .filter(
      (payment) =>
        tenantIds.includes(payment.tenantId) && payment.date.startsWith(String(now.getFullYear())),
    )
    .reduce((total, payment) => total + payment.amount, 0);
}
function arrearsForProperty(propertyId: string, state: ReturnType<typeof useRentbook>["state"]) {
  const leaseIds = state.leases
    .filter((lease) =>
      state.units.some((unit) => unit.id === lease.unitId && unit.propertyId === propertyId),
    )
    .map((lease) => lease.id);
  return state.charges
    .filter((charge) => leaseIds.includes(charge.leaseId))
    .reduce((total, charge) => total + balanceForCharge(charge, state.payments), 0);
}
function nextExpiry(propertyId: string, state: ReturnType<typeof useRentbook>["state"]) {
  return state.leases
    .filter((lease) =>
      state.units.some((unit) => unit.id === lease.unitId && unit.propertyId === propertyId),
    )
    .map((lease) => lease.endDate)
    .sort()[0];
}
