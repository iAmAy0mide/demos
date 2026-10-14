"use client";

import { useEffect, useMemo, useState } from "react";

import { useRentbook } from "./RentbookProvider";
import { formatRentbookDate, naira } from "../lib/finance";

import type { PaymentMethod } from "../types";

type SortKey = "date" | "tenant" | "amount";
type Range = "all" | "this_month" | "last_month" | "this_year";
type PaymentRow = {
  payment: ReturnType<typeof useRentbook>["state"]["payments"][number];
  tenant: string;
  unit: string;
  property: string;
  receipt: string;
  receiptId: string;
};

export function Payments() {
  const { state } = useRentbook();
  const [query, setQuery] = useState("");
  const [method, setMethod] = useState<"all" | PaymentMethod>("all");
  const [propertyId, setPropertyId] = useState("all");
  const [range, setRange] = useState<Range>("all");
  const [sort, setSort] = useState<SortKey>("date");
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => {
    queueMicrotask(() => setToday(new Date()));
  }, []);
  const rows = useMemo(
    () => (today ? paymentRows({ state, query, method, propertyId, range, sort, today }) : []),
    [state, query, method, propertyId, range, sort, today],
  );
  const total = rows.reduce((sum, row) => sum + row.payment.amount, 0);
  if (!state.isLoaded) {
    return <main className="rbk-page">Preparing payments…</main>;
  }
  return (
    <main className="rbk-page" data-testid="payments-page">
      <header className="rbk-page-header">
        <div>
          <p>Collection archive</p>
          <h1>Payments</h1>
          <span>Every collection, receipt and charge allocation in one ledger.</span>
        </div>
      </header>
      <section className="rbk-payment-filters" aria-label="Payment filters">
        <input
          aria-label="Search payments"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search tenant, unit or receipt"
        />
        <select
          aria-label="Payment method"
          value={method}
          onChange={(event) => setMethod(event.target.value as typeof method)}
        >
          <option value="all">All methods</option>
          <option value="bank_transfer">Transfer</option>
          <option value="cash">Cash</option>
          <option value="pos">POS</option>
          <option value="cheque">Cheque</option>
        </select>
        <select
          aria-label="Property"
          value={propertyId}
          onChange={(event) => setPropertyId(event.target.value)}
        >
          <option value="all">All properties</option>
          {state.properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Date range"
          value={range}
          onChange={(event) => setRange(event.target.value as Range)}
        >
          <option value="all">All time</option>
          <option value="this_month">This month</option>
          <option value="last_month">Last month</option>
          <option value="this_year">This year</option>
        </select>
      </section>
      <section className="rbk-payment-total" aria-live="polite">
        <span>Filtered collections</span>
        <strong>{naira(total)}</strong>
        <small>{rows.length} payments</small>
      </section>
      <div
        className="rbk-payments-table"
        role="region"
        aria-label="Payments ledger"
        data-scroll-x="intentional"
      >
        <table>
          <thead>
            <tr>
              {(["date", "tenant", "amount"] as const).map((key) => (
                <th key={key}>
                  <button type="button" onClick={() => setSort(key)}>
                    {sortLabel(key)}
                    {sort === key ? " ↓" : ""}
                  </button>
                </th>
              ))}
              <th>Receipt</th>
              <th>Unit / property</th>
              <th>Method</th>
              <th>Allocated charges</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((row) => (
                <tr key={row.payment.id}>
                  <td>{formatRentbookDate(row.payment.date)}</td>
                  <td>
                    <b>{row.tenant}</b>
                  </td>
                  <td className="rbk-balance">{naira(row.payment.amount)}</td>
                  <td>
                    <button
                      className="rbk-receipt-link"
                      type="button"
                      onClick={() => openReceipt(row.receiptId)}
                    >
                      {row.receipt}
                    </button>
                  </td>
                  <td>
                    {row.unit}
                    <small>{row.property}</small>
                  </td>
                  <td>{row.payment.method.replace("_", " ")}</td>
                  <td>
                    {row.payment.allocations.length} charge
                    {row.payment.allocations.length === 1 ? "" : "s"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>No payments match these filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function openReceipt(receiptId: string) {
  window.history.pushState({}, "", `?receipt=${receiptId}`);
  window.dispatchEvent(new CustomEvent("rentbook:receipt", { detail: { receiptId } }));
}
function paymentRows({
  state,
  query,
  method,
  propertyId,
  range,
  sort,
  today,
}: {
  state: ReturnType<typeof useRentbook>["state"];
  query: string;
  method: "all" | PaymentMethod;
  propertyId: string;
  range: Range;
  sort: SortKey;
  today: Date;
}): PaymentRow[] {
  const month = today.toISOString().slice(0, 7);
  const last = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().slice(0, 7);
  const year = String(today.getFullYear());
  return state.payments
    .map((payment) => {
      const tenant = state.tenants.find((item) => item.id === payment.tenantId);
      const lease = state.leases.find((item) => item.tenantId === payment.tenantId);
      const unit = state.units.find((item) => item.id === lease?.unitId);
      const property = state.properties.find((item) => item.id === unit?.propertyId);
      const receipt = state.receipts.find((item) => item.paymentId === payment.id);
      return {
        payment,
        tenant: tenant?.name ?? "Unknown tenant",
        unit: unit?.label ?? "—",
        property: property?.name ?? "—",
        receipt: receipt?.number ?? "Pending",
        receiptId: receipt?.id ?? "",
      };
    })
    .filter((row) => matchesMethod(row, method))
    .filter((row) => matchesProperty(row, propertyId, state))
    .filter((row) => matchesRange(row, range, { month, last, year }))
    .filter((row) => matchesQuery(row, query))
    .sort((first, second) => compareRows(first, second, sort));
}

function matchesMethod(row: PaymentRow, method: "all" | PaymentMethod) {
  return method === "all" || row.payment.method === method;
}

function matchesProperty(
  row: PaymentRow,
  propertyId: string,
  state: ReturnType<typeof useRentbook>["state"],
) {
  if (propertyId === "all") {
    return true;
  }
  return state.units.find((unit) => unit.label === row.unit)?.propertyId === propertyId;
}

function matchesRange(
  row: PaymentRow,
  range: Range,
  periods: { month: string; last: string; year: string },
) {
  if (range === "all") {
    return true;
  }
  const rangePrefixes = {
    this_month: periods.month,
    last_month: periods.last,
    this_year: periods.year,
  };
  return row.payment.date.startsWith(rangePrefixes[range]);
}

function matchesQuery(row: PaymentRow, query: string) {
  return `${row.tenant} ${row.unit} ${row.receipt}`.toLowerCase().includes(query.toLowerCase());
}

function sortLabel(key: SortKey) {
  return { date: "Date", tenant: "Tenant", amount: "Amount" }[key];
}
function compareRows(first: PaymentRow, second: PaymentRow, sort: SortKey) {
  if (sort === "amount") {
    return second.payment.amount - first.payment.amount;
  }
  if (sort === "tenant") {
    return first.tenant.localeCompare(second.tenant);
  }
  return second.payment.date.localeCompare(first.payment.date);
}
