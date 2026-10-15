"use client";

import Link from "next/link";
import { useMemo } from "react";

import { useLagosNow } from "@/src/shared/lib/useLagosNow";

import { useRentbook } from "./RentbookProvider";
import { buildCsv } from "../lib/buildCsv";
import { balanceForCharge, formatPercent, naira } from "../lib/finance";

import type { Lease } from "../types";

const AGE_BUCKETS = ["0–30", "31–60", "61–90", "90+"] as const;
type AgeBucket = (typeof AGE_BUCKETS)[number];

export function Reports() {
  const { state } = useRentbook();
  const today = useLagosNow();
  const report = useMemo(
    () => (today && state.isLoaded ? reportData(state, today) : null),
    [state, today],
  );
  if (!report) {
    return <main className="rbk-page">Preparing reports…</main>;
  }
  return (
    <main className="rbk-page rbk-reports" data-testid="reports-page">
      <header className="rbk-page-header rbk-report-header">
        <div>
          <p>Portfolio ledger</p>
          <h1>Reports</h1>
          <span>{report.propertyLabel} · figures update with the property switcher</span>
        </div>
        <div className="rbk-report-actions">
          <button type="button" onClick={() => downloadCsv(report)}>
            Export CSV
          </button>
          <button type="button" onClick={() => window.print()}>
            Print report
          </button>
        </div>
      </header>
      <section className="rbk-report-sheet" aria-labelledby="income-heading">
        <div>
          <p>Received rent</p>
          <h2 id="income-heading">Income by month</h2>
        </div>
        <IncomeChart values={report.months} />
        <table className="rbk-report-table">
          <caption className="rbk-sr-only">Income by month and property</caption>
          <thead>
            <tr>
              <th>Month</th>
              {report.properties.map((property) => (
                <th key={property.id}>{property.name}</th>
              ))}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {report.months.map((month) => (
              <tr key={month.label}>
                <th>{month.label}</th>
                {report.properties.map((property) => (
                  <td key={property.id}>{naira(month.byProperty[property.id] ?? 0)}</td>
                ))}
                <td>{naira(month.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="rbk-report-sheet" aria-labelledby="rate-heading">
        <div>
          <p>Due against received</p>
          <h2 id="rate-heading">Collection-rate trend</h2>
        </div>
        <RateChart values={report.months} />
        <p className="rbk-report-caption">
          This month: <strong>{formatPercent(report.months.at(-1)?.rate ?? 0)}</strong>
        </p>
      </section>
      <section className="rbk-report-sheet" aria-labelledby="arrears-heading">
        <div>
          <p>Outstanding balances</p>
          <h2 id="arrears-heading">Arrears ageing</h2>
        </div>
        <AgeingChart totals={report.ageTotals} />
        <div className="rbk-age-legend">
          {AGE_BUCKETS.map((bucket) => (
            <span key={bucket}>
              <i className={`rbk-age-${bucket.replace("–", "-").replace("+", "plus")}`} />
              {bucket} days
            </span>
          ))}
        </div>
        <table className="rbk-report-table">
          <caption className="rbk-sr-only">Tenants by arrears age</caption>
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Unit</th>
              <th>Age</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {report.arrears.map((entry) => (
              <tr key={entry.charge.id}>
                <th>
                  <Link href={`/work/rentbook/tenants/${entry.tenant.id}`}>
                    {entry.tenant.name}
                  </Link>
                </th>
                <td>{entry.lease.unitId.replace("unit-", "Unit ")}</td>
                <td>{entry.bucket}</td>
                <td>{naira(entry.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

function reportData(state: ReturnType<typeof useRentbook>["state"], today: Date) {
  const properties = state.properties.filter(
    (property) => state.selectedPropertyId === "all" || property.id === state.selectedPropertyId,
  );
  const propertyIds = new Set(properties.map((property) => property.id));
  const unitIds = new Set(
    state.units.filter((unit) => propertyIds.has(unit.propertyId)).map((unit) => unit.id),
  );
  const leases = state.leases.filter((lease) => unitIds.has(lease.unitId));
  const leaseIds = new Set(leases.map((lease) => lease.id));
  const tenantMap = new Map(state.tenants.map((tenant) => [tenant.id, tenant]));
  const months = Array.from({ length: 6 }, (_, index) =>
    monthData({ state, properties, leases, today, offset: index - 5 }),
  );
  const arrears = state.charges.flatMap((charge) => {
    if (!leaseIds.has(charge.leaseId)) {
      return [];
    }
    const lease = leases.find((entry) => entry.id === charge.leaseId);
    const tenant = lease ? tenantMap.get(lease.tenantId) : undefined;
    const balance = balanceForCharge(charge, state.payments);
    if (!lease || !tenant || balance === 0 || charge.dueDate >= isoDate(today)) {
      return [];
    }
    return [{ charge, lease, tenant, balance, bucket: ageBucket(charge.dueDate, today) }];
  });
  const ageTotals = Object.fromEntries(
    AGE_BUCKETS.map((bucket) => [
      bucket,
      arrears
        .filter((entry) => entry.bucket === bucket)
        .reduce((sum, entry) => sum + entry.balance, 0),
    ]),
  ) as Record<AgeBucket, number>;
  return {
    properties,
    months,
    arrears,
    ageTotals,
    propertyLabel: propertyLabel(state.selectedPropertyId, properties),
  };
}

function propertyLabel(
  selectedPropertyId: string,
  properties: ReturnType<typeof useRentbook>["state"]["properties"],
) {
  return selectedPropertyId === "all"
    ? "All properties"
    : (properties[0]?.name ?? "Selected property");
}

function monthData({
  state,
  properties,
  leases,
  today,
  offset,
}: {
  state: ReturnType<typeof useRentbook>["state"];
  properties: ReturnType<typeof useRentbook>["state"]["properties"];
  leases: Lease[];
  today: Date;
  offset: number;
}) {
  const date = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + offset, 1));
  const key = date.toISOString().slice(0, 7);
  const byProperty = Object.fromEntries(properties.map((property) => [property.id, 0])) as Record<
    string,
    number
  >;
  let due = 0;
  state.charges
    .filter((charge) => charge.dueDate.startsWith(key))
    .forEach((charge) => {
      if (leases.some((lease) => lease.id === charge.leaseId)) {
        due += charge.amount;
      }
    });
  state.payments
    .filter((payment) => payment.date.startsWith(key))
    .forEach((payment) => {
      const lease = leases.find((entry) => entry.tenantId === payment.tenantId);
      if (!lease) {
        return;
      }
      const propertyId = state.units.find((unit) => unit.id === lease.unitId)?.propertyId;
      if (propertyId) {
        byProperty[propertyId] = (byProperty[propertyId] ?? 0) + payment.amount;
      }
    });
  const total = Object.values(byProperty).reduce((sum, amount) => sum + amount, 0);
  return {
    key,
    label: new Intl.DateTimeFormat("en-GB", { month: "short" }).format(date),
    byProperty,
    total,
    rate: due ? total / due : 0,
  };
}

function ageBucket(dueDate: string, today: Date): AgeBucket {
  const days = Math.floor(
    (today.getTime() - new Date(`${dueDate}T12:00:00+01:00`).getTime()) / 86_400_000,
  );
  if (days <= 30) {
    return "0–30";
  }
  if (days <= 60) {
    return "31–60";
  }
  if (days <= 90) {
    return "61–90";
  }
  return "90+";
}
function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}
function IncomeChart({ values }: { values: Array<{ label: string; total: number }> }) {
  const max = Math.max(...values.map((value) => value.total), 1);
  return (
    <svg
      className="rbk-report-chart"
      viewBox="0 0 600 180"
      role="img"
      aria-label="Monthly rent income bar chart"
    >
      {values.map((value, index) => (
        <g key={value.label}>
          <rect
            x={30 + index * 94}
            y={155 - (value.total / max) * 125}
            width="48"
            height={(value.total / max) * 125}
          />
          <text x={30 + index * 94} y="174">
            {value.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
function RateChart({ values }: { values: Array<{ label: string; rate: number }> }) {
  const points = values
    .map((value, index) => `${30 + index * 94},${150 - value.rate * 115}`)
    .join(" ");
  return (
    <svg
      className="rbk-report-chart"
      viewBox="0 0 600 180"
      role="img"
      aria-label="Collection rate trend line chart"
    >
      <line x1="20" x2="590" y1="150" y2="150" />
      <polyline points={points} />
      {values.map((value, index) => (
        <text key={value.label} x={30 + index * 94} y="174">
          {value.label}
        </text>
      ))}
    </svg>
  );
}
function AgeingChart({ totals }: { totals: Record<AgeBucket, number> }) {
  const total = Math.max(
    Object.values(totals).reduce((sum, value) => sum + value, 0),
    1,
  );
  const widths = AGE_BUCKETS.map((bucket) => (totals[bucket] / total) * 560);
  return (
    <svg
      className="rbk-age-chart"
      viewBox="0 0 600 54"
      role="img"
      aria-label="Arrears ageing stacked bar"
    >
      {AGE_BUCKETS.map((bucket, index) => {
        const width = widths[index];
        const offset = widths.slice(0, index).reduce((sum, value) => sum + value, 0);
        return (
          <rect
            className={`rbk-age-${bucket.replace("–", "-").replace("+", "plus")}`}
            key={bucket}
            x={20 + offset}
            y="10"
            width={width}
            height="28"
          >
            <title>
              {bucket}: {naira(totals[bucket])}
            </title>
          </rect>
        );
      })}
    </svg>
  );
}
function downloadCsv(report: ReturnType<typeof reportData>) {
  const headers = ["month", ...report.properties.map((property) => property.name), "total"];
  const rows = report.months.map((month) =>
    Object.fromEntries([
      ["month", month.key],
      ...report.properties.map((property) => [property.name, month.byProperty[property.id] ?? 0]),
      ["total", month.total],
    ]),
  );
  const url = URL.createObjectURL(
    new Blob([buildCsv(headers, rows)], { type: "text/csv;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "rentbook-income.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}
