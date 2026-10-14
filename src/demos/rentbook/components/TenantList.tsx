"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useLagosNow } from "@/src/shared/lib/useLagosNow";

import { useRentbook } from "./RentbookProvider";
import { balanceForCharge, getChargeStatus, naira, relativeDueDate } from "../lib/finance";

const FILTERS = ["all", "paid", "due_soon", "overdue", "partial"] as const;
type TenantFilter = (typeof FILTERS)[number];

export function TenantList() {
  const { state } = useRentbook();
  const now = useLagosNow();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<TenantFilter>("all");
  const rows = useMemo(() => tenantRows(state, now, query, filter), [filter, now, query, state]);
  if (!state.isLoaded || !now) {
    return <main className="rbk-page">Preparing tenant register…</main>;
  }
  return (
    <main className="rbk-page rbk-tenants-page" data-testid="tenant-list">
      <header className="rbk-page-header">
        <div>
          <p>Resident register</p>
          <h1>Tenants</h1>
          <span>{rows.length} active tenancies in this view</span>
        </div>
      </header>
      <section className="rbk-tenant-controls" aria-label="Tenant filters">
        <input
          aria-label="Search tenants"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a tenant, unit or building"
        />
        <div className="rbk-view-tabs" role="group" aria-label="Account status">
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
            >
              {item.replace("_", " ")}
            </button>
          ))}
        </div>
      </section>
      <section className="rbk-tenant-list" aria-label="Tenant accounts">
        {rows.map((row) => (
          <Link
            key={row.tenant.id}
            href={`/work/rentbook/tenants/${row.tenant.id}`}
            className="rbk-tenant-row"
          >
            <span className="rbk-monogram" aria-hidden="true">
              {row.tenant.initials}
            </span>
            <span>
              <b>{row.tenant.name}</b>
              <small>
                {row.unit.label} · {row.property.name}
              </small>
            </span>
            <span>
              <b>{row.lease.endDate}</b>
              <small>{expiresCopy(row.lease.endDate, now)}</small>
            </span>
            <strong className="rbk-balance">{naira(row.balance)}</strong>
            <span className={`rbk-status rbk-status-${row.status}`}>
              {row.status.replace("_", " ")}
            </span>
          </Link>
        ))}
        {!rows.length ? <p className="rbk-empty">No tenant accounts match this view.</p> : null}
      </section>
    </main>
  );
}

function tenantRows(
  state: ReturnType<typeof useRentbook>["state"],
  now: Date | null,
  query: string,
  filter: TenantFilter,
) {
  if (!now) {
    return [];
  }
  return state.tenants.flatMap((tenant) => {
    const lease = state.leases.find((item) => item.tenantId === tenant.id);
    const unit = state.units.find((item) => item.id === lease?.unitId);
    const property = state.properties.find((item) => item.id === unit?.propertyId);
    if (
      !lease ||
      !unit ||
      !property ||
      (state.selectedPropertyId !== "all" && property.id !== state.selectedPropertyId)
    ) {
      return [];
    }
    const charges = state.charges.filter((item) => item.leaseId === lease.id);
    const balance = charges.reduce(
      (total, charge) => total + balanceForCharge(charge, state.payments),
      0,
    );
    const current = charges.at(-1);
    const status = current ? getChargeStatus(current, state.payments, now) : "paid";
    const haystack = `${tenant.name} ${unit.label} ${property.name}`.toLowerCase();
    return (filter !== "all" && status !== filter) || !haystack.includes(query.toLowerCase())
      ? []
      : [{ tenant, lease, unit, property, balance, status }];
  });
}

function expiresCopy(endDate: string, now: Date) {
  const days = Math.ceil(
    (new Date(`${endDate}T12:00:00+01:00`).getTime() - now.getTime()) / 86_400_000,
  );
  return days <= 30 && days >= 0
    ? relativeDueDate(endDate, now).replace("Due", "Expires")
    : "Lease end";
}
