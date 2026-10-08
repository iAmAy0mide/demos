"use client";

import { useMemo, useState } from "react";

import { useLagosNow } from "@/src/shared/lib/useLagosNow";

import { useRentbook } from "./RentbookProvider";
import { balanceForCharge, getChargeStatus, naira } from "../lib/finance";

import type { Charge, ChargeStatus, Tenant, Unit } from "../types";

const VIEWS = ["all", "overdue", "due_soon", "partial", "paid"] as const;
type View = (typeof VIEWS)[number];
type RentRollRow = {
  balance: number;
  charge: Charge;
  status: ChargeStatus;
  tenant: Tenant | undefined;
  unit: Unit | undefined;
};

export function RentRoll() {
  const { state } = useRentbook();
  const now = useLagosNow();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>("all");
  const [sortBy, setSortBy] = useState<"tenant" | "due" | "balance">("due");
  const [isReminderSent, setIsReminderSent] = useState(false);

  const rows = useMemo(
    () =>
      state.charges
        .map((charge) => {
          const lease = state.leases.find((entry) => entry.id === charge.leaseId);
          const tenant = state.tenants.find((entry) => entry.id === lease?.tenantId);
          const unit = state.units.find((entry) => entry.id === lease?.unitId);
          return {
            charge,
            tenant,
            unit,
            status: now ? getChargeStatus(charge, state.payments, now) : "upcoming",
            balance: balanceForCharge(charge, state.payments),
          };
        })
        .filter(
          (row) =>
            (state.selectedPropertyId === "all" ||
              row.unit?.propertyId === state.selectedPropertyId) &&
            (view === "all" || row.status === view) &&
            row.tenant?.name.toLowerCase().includes(query.toLowerCase()),
        )
        .sort((first, second) => compareRentRollRows(first, second, sortBy)),
    [state, now, query, view, sortBy],
  );

  if (!state.isLoaded || !now) {
    return <main className="rbk-page">Preparing rent roll…</main>;
  }

  return (
    <main className="rbk-page">
      <header className="rbk-page-header">
        <div>
          <p>Collection ledger</p>
          <h1>Rent roll</h1>
          <span>{rows.length} accounts in this view</span>
        </div>
        <button
          className="rbk-primary"
          type="button"
          disabled={!rows.some((row) => row.status === "overdue")}
          onClick={() => setIsReminderSent(true)}
        >
          Send overdue reminders
        </button>
      </header>
      <section className="rbk-roll-controls">
        <input
          aria-label="Search tenants"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search tenant or unit"
        />{" "}
        <select
          aria-label="Sort rent roll"
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
        >
          <option value="due">Sort by due date</option>
          <option value="tenant">Sort by tenant</option>
          <option value="balance">Sort by balance</option>
        </select>
        {VIEWS.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={view === item}
            onClick={() => setView(item)}
          >
            {item.replace("_", " ")}
          </button>
        ))}
      </section>
      {isReminderSent ? (
        <p className="rbk-inline-success" role="status">
          Reminders prepared for the overdue accounts in this view.
        </p>
      ) : null}
      <div className="rbk-roll-table" role="region" aria-label="Rent roll" tabIndex={0}>
        <table>
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Unit</th>
              <th>Due</th>
              <th>Balance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map(({ charge, tenant, unit, status, balance }) => (
                <tr key={charge.id} tabIndex={0}>
                  <td>
                    <b>{tenant?.name}</b>
                  </td>
                  <td>{unit?.label}</td>
                  <td>{charge.dueDate}</td>
                  <td>{naira(balance)}</td>
                  <td>
                    <span className={`rbk-status rbk-status-${status}`}>
                      {status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>No accounts match this view.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function compareRentRollRows(
  first: RentRollRow,
  second: RentRollRow,
  sortBy: "tenant" | "due" | "balance",
) {
  if (sortBy === "tenant") {
    return (first.tenant?.name ?? "").localeCompare(second.tenant?.name ?? "");
  }
  if (sortBy === "due") {
    return first.charge.dueDate.localeCompare(second.charge.dueDate);
  }
  return second.balance - first.balance;
}
