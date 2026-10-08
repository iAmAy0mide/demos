"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useLagosNow } from "@/src/shared/lib/useLagosNow";

import { useRentbook } from "./RentbookProvider";
import { balanceForCharge, formatRentbookDate, getChargeStatus, naira } from "../lib/finance";

import type { Charge, ChargeStatus, Lease, Tenant, Unit } from "../types";

const VIEWS = ["all", "overdue", "due_soon", "partial", "paid"] as const;
type View = (typeof VIEWS)[number];
type RentRollRow = {
  balance: number;
  charge: Charge;
  lease: Lease | undefined;
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
  const [frequency, setFrequency] = useState<"all" | Lease["frequency"]>("all");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLTableCellElement>(null);
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
            lease,
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
            (frequency === "all" || row.lease?.frequency === frequency) &&
            `${row.tenant?.name ?? ""} ${row.unit?.label ?? ""}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort((first, second) => compareRentRollRows(first, second, sortBy)),
    [state, now, query, view, sortBy, frequency],
  );
  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  const viewCounts = useMemo(() => {
    const allRows = state.charges.map((charge) =>
      getChargeStatus(charge, state.payments, now ?? new Date()),
    );
    return Object.fromEntries(
      VIEWS.map((item) => [
        item,
        item === "all" ? allRows.length : allRows.filter((status) => status === item).length,
      ]),
    ) as Record<View, number>;
  }, [now, state.charges, state.payments]);

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
        />
        <select
          aria-label="Sort rent roll"
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
        >
          <option value="due">Sort by due date</option>
          <option value="tenant">Sort by tenant</option>
          <option value="balance">Sort by balance</option>
        </select>
        <select
          aria-label="Billing frequency"
          value={frequency}
          onChange={(event) => setFrequency(event.target.value as typeof frequency)}
        >
          <option value="all">All billing cycles</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="half_yearly">Half yearly</option>
          <option value="annual">Annual</option>
        </select>
        {VIEWS.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={view === item}
            onClick={() => setView(item)}
          >
            {item.replace("_", " ")} <span>{viewCounts[item]}</span>
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
              <th>Unit</th>
              <th aria-sort={sortBy === "tenant" ? "ascending" : "none"}>
                <SortButton label="Tenant" value="tenant" current={sortBy} onChange={setSortBy} />
              </th>
              <th>Property</th>
              <th>Rent per period</th>
              <th aria-sort={sortBy === "due" ? "ascending" : "none"}>
                <SortButton label="Due" value="due" current={sortBy} onChange={setSortBy} />
              </th>
              <th aria-sort={sortBy === "balance" ? "descending" : "none"}>
                <SortButton label="Balance" value="balance" current={sortBy} onChange={setSortBy} />
              </th>
              <th>Status</th>
              <th>Last payment</th>
              <th>
                <span className="rbk-sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map(({ charge, lease, tenant, unit, status, balance }) => {
                const property = state.properties.find((entry) => entry.id === unit?.propertyId);
                const lastPayment = state.payments.find(
                  (payment) => payment.tenantId === tenant?.id,
                );
                return (
                  <tr
                    key={charge.id}
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key.toLowerCase() === "p") {
                        window.dispatchEvent(new Event("rentbook:payment"));
                      }
                    }}
                  >
                    <td>{unit?.label}</td>
                    <td>
                      <b>{tenant?.name}</b>
                    </td>
                    <td>{property?.name}</td>
                    <td>
                      {lease
                        ? `${naira(lease.rentAmount)} / ${lease.frequency.replace("_", " ")}`
                        : "—"}
                    </td>
                    <td>{formatRentbookDate(charge.dueDate)}</td>
                    <td>{naira(balance)}</td>
                    <td>
                      <span className={`rbk-status rbk-status-${status}`}>
                        {status.replace("_", " ")}
                      </span>
                    </td>
                    <td>{lastPayment ? formatRentbookDate(lastPayment.date) : "No payment"}</td>
                    <td
                      className="rbk-row-actions"
                      ref={openMenuId === charge.id ? menuRef : undefined}
                    >
                      <button
                        aria-expanded={openMenuId === charge.id}
                        aria-label={`Actions for ${tenant?.name ?? "account"}`}
                        className="rbk-menu-trigger"
                        type="button"
                        onClick={() => setOpenMenuId(openMenuId === charge.id ? null : charge.id)}
                      >
                        •••
                      </button>
                      {openMenuId === charge.id ? (
                        <div className="rbk-row-menu" role="menu">
                          <button
                            type="button"
                            onClick={() => {
                              window.dispatchEvent(new Event("rentbook:payment"));
                              setOpenMenuId(null);
                            }}
                          >
                            Record payment
                          </button>
                          <a href="/work/rentbook/tenants">View tenant</a>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={9}>No accounts match this view.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function SortButton({
  label,
  value,
  current,
  onChange,
}: {
  label: string;
  value: "tenant" | "due" | "balance";
  current: string;
  onChange: (value: "tenant" | "due" | "balance") => void;
}) {
  return (
    <button className="rbk-sort-button" type="button" onClick={() => onChange(value)}>
      {label}
      {current === value ? " ↓" : ""}
    </button>
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
