"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { useDismissibleLayer } from "@/src/shared/lib/useDismissibleLayer";
import { useLagosNow } from "@/src/shared/lib/useLagosNow";

import { useRentbook } from "./RentbookProvider";
import {
  balanceForCharge,
  formatRentbookDate,
  getChargeStatus,
  naira,
  relativeDueDate,
} from "../lib/finance";

import type { Charge, ChargeStatus, Lease, Tenant, Unit } from "../types";

const VIEWS = ["all", "overdue", "due_soon", "partial", "vacant"] as const;
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
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  useDismissibleLayer({
    isOpen: openMenuId !== null,
    onDismiss: () => setOpenMenuId(null),
    layerRef: menuRef,
    triggerRef: menuTriggerRef,
  });

  const rows = useMemo(
    () =>
      currentCharges(state.charges)
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
            (view === "all" || (view !== "vacant" && row.status === view)) &&
            (frequency === "all" || row.lease?.frequency === frequency) &&
            `${row.tenant?.name ?? ""} ${row.unit?.label ?? ""}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort((first, second) => compareRentRollRows(first, second, sortBy)),
    [state, now, query, view, sortBy, frequency],
  );
  useEffect(() => {
    const handleKeys = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      const focused =
        document.activeElement instanceof HTMLTableRowElement ? document.activeElement : null;
      if (!focused) {
        return;
      }
      const rowIndex = rows.findIndex((row) => row.charge.id === focused.dataset.rowId);
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const next = rows.at(rowIndex + (event.key === "ArrowDown" ? 1 : -1));
        tableRef.current
          ?.querySelector<HTMLTableRowElement>(`[data-row-id="${next?.charge.id}"]`)
          ?.focus();
      }
      if (event.key === "p") {
        event.preventDefault();
        const row = rows[rowIndex];
        window.dispatchEvent(
          new CustomEvent("rentbook:payment", { detail: { tenantId: row?.tenant?.id } }),
        );
      }
      if (event.key === "Enter") {
        focused.querySelector<HTMLButtonElement>(".rbk-menu-trigger")?.click();
      }
    };
    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [rows]);
  const viewCounts = useMemo(() => {
    const allRows = currentCharges(state.charges).map((charge) =>
      getChargeStatus(charge, state.payments, now ?? new Date()),
    );
    return Object.fromEntries(
      VIEWS.map((item) => [item, countForView(item, allRows, state.units)]),
    ) as Record<View, number>;
  }, [now, state.charges, state.payments, state.units]);

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
      </header>
      <section className="rbk-roll-controls" aria-label="Rent roll controls">
        <input
          aria-label="Search tenants"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search tenant or unit"
        />
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
        <div className="rbk-view-tabs" role="group" aria-label="Saved views">
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
        </div>
        {frequency !== "all" || state.selectedPropertyId !== "all" ? (
          <div className="rbk-filter-chips">
            {frequency !== "all" ? (
              <button type="button" onClick={() => setFrequency("all")}>
                Frequency: {frequency.replace("_", " ")} ×
              </button>
            ) : null}
            {state.selectedPropertyId !== "all" ? <span>Property filter active</span> : null}
            <button type="button" onClick={() => setFrequency("all")}>
              Clear filters
            </button>
          </div>
        ) : null}
      </section>
      {selectedIds.length ? (
        <div className="rbk-bulk-bar" role="status">
          {selectedIds.length} selected{" "}
          <button
            type="button"
            onClick={() => {
              const tenantIds = rows
                .filter((row) => selectedIds.includes(row.charge.id))
                .filter((row) => row.status === "overdue" || row.status === "partial")
                .flatMap((row) => (row.tenant ? [row.tenant.id] : []));
              window.dispatchEvent(new CustomEvent("rentbook:reminder", { detail: { tenantIds } }));
            }}
          >
            Send reminders
          </button>{" "}
          <button type="button" onClick={() => setSelectedIds([])}>
            Clear
          </button>
        </div>
      ) : null}
      <div
        ref={tableRef}
        className="rbk-roll-table"
        role="region"
        aria-label="Rent roll"
        tabIndex={0}
        data-scroll-x="intentional"
      >
        <table>
          <thead>
            <tr>
              <th>
                <span className="rbk-sr-only">Select account</span>
              </th>
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
                const lastReminder = state.activity.find(
                  (activity) =>
                    activity.tenantId === tenant?.id && activity.message.includes("reminder"),
                );
                return (
                  <tr key={charge.id} data-row-id={charge.id} tabIndex={0}>
                    <td>
                      <input
                        aria-label={`Select ${tenant?.name ?? "account"}`}
                        type="checkbox"
                        checked={selectedIds.includes(charge.id)}
                        onChange={(event) =>
                          setSelectedIds((ids) =>
                            event.target.checked
                              ? [...ids, charge.id]
                              : ids.filter((id) => id !== charge.id),
                          )
                        }
                      />
                    </td>
                    <td>{unit?.label}</td>
                    <td>
                      <span
                        className="rbk-monogram"
                        style={
                          { "--rbk-avatar": `${tenant?.name.length ?? 0}deg` } as CSSProperties
                        }
                      >
                        {tenant?.initials}
                      </span>
                      <b>{tenant?.name}</b>
                    </td>
                    <td>{property?.name}</td>
                    <td>
                      {lease
                        ? `${naira(lease.rentAmount)} / ${lease.frequency.replace("_", " ")}`
                        : "—"}
                    </td>
                    <td>
                      {formatRentbookDate(charge.dueDate)}
                      <small>{relativeDueDate(charge.dueDate, now)}</small>
                    </td>
                    <td className="rbk-balance">{naira(balance)}</td>
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
                        ref={openMenuId === charge.id ? menuTriggerRef : undefined}
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
                              window.dispatchEvent(
                                new CustomEvent("rentbook:payment", {
                                  detail: { tenantId: tenant?.id },
                                }),
                              );
                              setOpenMenuId(null);
                            }}
                          >
                            Record payment
                          </button>
                          <a href="/work/rentbook/tenants">View tenant</a>
                          {(status === "overdue" || status === "partial") && tenant ? (
                            <button
                              type="button"
                              onClick={() => {
                                window.dispatchEvent(
                                  new CustomEvent("rentbook:reminder", {
                                    detail: { tenantId: tenant.id },
                                  }),
                                );
                                setOpenMenuId(null);
                              }}
                            >
                              Send reminder
                            </button>
                          ) : null}
                          {lastReminder ? (
                            <span className="rbk-menu-note">
                              Last reminder: {formatRentbookDate(lastReminder.date)}
                            </span>
                          ) : null}
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={10}>No accounts match this view.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function currentCharges(charges: Charge[]) {
  return charges.filter((charge) => {
    const latestForLease = charges
      .filter((candidate) => candidate.leaseId === charge.leaseId)
      .reduce(
        (latest, candidate) => (candidate.dueDate > latest.dueDate ? candidate : latest),
        charge,
      );
    return latestForLease.id === charge.id;
  });
}

function countForView(view: View, statuses: ChargeStatus[], units: Unit[]) {
  if (view === "all") {
    return statuses.length;
  }
  if (view === "vacant") {
    return units.filter((unit) => unit.status === "vacant").length;
  }
  return statuses.filter((status) => status === view).length;
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
