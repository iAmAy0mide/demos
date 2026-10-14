"use client";

import { Building2, CircleAlert, Percent, WalletCards } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

import { formatLagosLongDate, greetingPeriod, lagosDateKey } from "@/src/shared/lib/lagos-time";
import { useLagosNow } from "@/src/shared/lib/useLagosNow";

import { useRentbook } from "./RentbookProvider";
import {
  balanceForCharge,
  formatPercent,
  formatRentbookDate,
  getChargeStatus,
  naira,
  relativeDueDate,
} from "../lib/finance";

import type { Charge, Lease } from "../types";

type ChartMonth = { key: string; label: string; income: number; expenses: number };
type OverviewState = ReturnType<typeof useRentbook>["state"];
type AttentionEntry = { charge: Charge | null; lease: Lease | undefined; status: string };

export function Overview() {
  const { state } = useRentbook();
  const today = useLagosNow();
  const [showTable, setShowTable] = useState(false);
  const data = useOverviewData(state, today);
  if (!data || !today) {
    return (
      <main className="rbk-page">
        <p>Preparing your ledger…</p>
      </main>
    );
  }
  return (
    <main className="rbk-page" data-testid="rentbook-overview">
      <header className="rbk-page-header">
        <div>
          <p>{formatLagosLongDate(today)}</p>
          <h1>Good {greetingPeriod(today)}, Chinedu.</h1>
          <span>Collection health before your first site call.</span>
        </div>
      </header>
      <section className="rbk-summary rbk-summary-five" aria-label="Portfolio summary">
        <Metric
          icon={<WalletCards />}
          label="Collected this month"
          value={naira(data.monthlyCollected)}
        />
        <Metric
          icon={<WalletCards />}
          label="Collected year to date"
          value={naira(data.collected)}
        />
        <Metric icon={<CircleAlert />} label="Outstanding" value={naira(data.outstanding)} />
        <Metric
          icon={<Percent />}
          label="Collection rate"
          value={formatPercent(data.collectionRate)}
        />
        <Metric
          icon={<Building2 />}
          label="Occupancy"
          value={`${data.occupancy}% · ${data.occupied} of ${data.units.length} units`}
        />
      </section>
      <section className="rbk-ledger-grid">
        <IncomeExpenseChart
          months={data.chartMonths}
          showTable={showTable}
          onToggle={() => setShowTable((shown) => !shown)}
        />
        <PaymentFeed payments={data.payments} state={state} />
      </section>
      <AttentionList entries={data.attention} />
    </main>
  );
}

function useOverviewData(state: OverviewState, today: Date | null) {
  return useMemo(() => {
    if (!state.isLoaded || !today) {
      return null;
    }
    const units = state.units.filter(
      (unit) => state.selectedPropertyId === "all" || unit.propertyId === state.selectedPropertyId,
    );
    const unitIds = new Set(units.map((unit) => unit.id));
    const leases = state.leases.filter((lease) => unitIds.has(lease.unitId));
    const leaseIds = new Set(leases.map((lease) => lease.id));
    const tenantIds = new Set(leases.map((lease) => lease.tenantId));
    const charges = state.charges.filter((charge) => leaseIds.has(charge.leaseId));
    const payments = state.payments.filter((payment) => tenantIds.has(payment.tenantId));
    const expenses = state.expenses.filter(
      (expense) =>
        state.selectedPropertyId === "all" || expense.propertyId === state.selectedPropertyId,
    );
    const currentMonth = lagosDateKey(today).slice(0, 7);
    const billed = charges
      .filter((charge) => charge.dueDate.startsWith(currentMonth))
      .reduce((total, charge) => total + charge.amount, 0);
    const monthlyCollected = payments
      .filter((payment) => payment.date.startsWith(currentMonth))
      .reduce((total, payment) => total + payment.amount, 0);
    const attention: AttentionEntry[] = charges
      .filter((charge) =>
        ["overdue", "due_soon"].includes(getChargeStatus(charge, payments, today)),
      )
      .slice(0, 5)
      .map((charge) => ({
        charge,
        lease: leases.find((lease) => lease.id === charge.leaseId),
        status: getChargeStatus(charge, payments, today),
      }));
    const expiring = leases.find((lease) => {
      const days =
        (new Date(`${lease.endDate}T12:00:00+01:00`).getTime() - today.getTime()) / 86_400_000;
      return days >= 0 && days <= 30;
    });
    if (expiring) {
      attention.push({ charge: null, lease: expiring, status: "expiring" });
    }
    return {
      units,
      occupied: units.filter((unit) => unit.status === "occupied").length,
      occupancy: Math.round(
        (units.filter((unit) => unit.status === "occupied").length / Math.max(units.length, 1)) *
          100,
      ),
      outstanding: charges.reduce((total, charge) => total + balanceForCharge(charge, payments), 0),
      collected: payments.reduce((total, payment) => total + payment.amount, 0),
      monthlyCollected,
      collectionRate: billed ? monthlyCollected / billed : 0,
      chartMonths: chartData(payments, expenses, today),
      payments: payments.slice(0, 5),
      attention,
    };
  }, [state, today]);
}

function chartData(
  payments: OverviewState["payments"],
  expenses: OverviewState["expenses"],
  today: Date,
): ChartMonth[] {
  return Array.from({ length: 12 }, (_, index) => {
    const date = new Date(today);
    date.setMonth(date.getMonth() - (11 - index));
    const key = lagosDateKey(date).slice(0, 7);
    return {
      key,
      label: new Intl.DateTimeFormat("en-GB", { month: "short" }).format(date),
      income: payments
        .filter((payment) => payment.date.startsWith(key))
        .reduce((total, payment) => total + payment.amount, 0),
      expenses: expenses
        .filter((expense) => expense.date.startsWith(key))
        .reduce((total, expense) => total + expense.amount, 0),
    };
  });
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

function IncomeExpenseChart({
  months,
  showTable,
  onToggle,
}: {
  months: ChartMonth[];
  showTable: boolean;
  onToggle: () => void;
}) {
  const maximum = Math.max(...months.flatMap((month) => [month.income, month.expenses]), 1);
  return (
    <article className="rbk-income-chart">
      <p>Cash movement</p>
      <h2>Income and expenses</h2>
      <div className="rbk-chart-legend">
        <span>Income bars</span>
        <span>Expense line</span>
        <button type="button" onClick={onToggle} aria-expanded={showTable}>
          View as table
        </button>
      </div>
      <svg
        className="rbk-monthly-chart"
        viewBox="0 0 720 240"
        role="img"
        aria-label="Twelve month income and expenses chart"
      >
        {[0, 1, 2, 3].map((line) => (
          <line key={line} x1="42" x2="700" y1={20 + line * 52} y2={20 + line * 52} />
        ))}
        <polyline
          points={months
            .map((month, index) => `${57 + index * 57},${212 - (month.expenses / maximum) * 180}`)
            .join(" ")}
        />
        {months.map((month, index) => {
          const height = (month.income / maximum) * 180;
          const x = 46 + index * 57;
          return (
            <g key={month.key}>
              <rect tabIndex={0} x={x} y={212 - height} width="22" height={height}>
                <title>
                  {month.label}: income {naira(month.income)}, expenses {naira(month.expenses)}
                </title>
              </rect>
              <circle cx={x + 11} cy={212 - (month.expenses / maximum) * 180} r="3" />
              <text x={x + 11} y="236" textAnchor="middle">
                {month.label}
              </text>
            </g>
          );
        })}
      </svg>
      {showTable ? (
        <table className="rbk-chart-table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Income</th>
              <th>Expenses</th>
            </tr>
          </thead>
          <tbody>
            {months.map((month) => (
              <tr key={month.key}>
                <td>{month.label}</td>
                <td>{naira(month.income)}</td>
                <td>{naira(month.expenses)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </article>
  );
}

function PaymentFeed({
  payments,
  state,
}: {
  payments: OverviewState["payments"];
  state: OverviewState;
}) {
  return (
    <article className="rbk-payment-feed">
      <p>Latest entries</p>
      <h2>Payment feed</h2>
      {payments.length ? (
        payments.map((payment) => {
          const tenant = state.tenants.find((entry) => entry.id === payment.tenantId);
          return (
            <div key={payment.id}>
              <span>{tenant?.initials}</span>
              <p>
                <b>{tenant?.name}</b>
                <small>
                  {formatRentbookDate(payment.date)} · {payment.method.replace("_", " ")}
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
  );
}

function AttentionList({
  entries,
}: {
  entries: Array<{
    charge: OverviewState["charges"][number] | null;
    lease: OverviewState["leases"][number] | undefined;
    status: string;
  }>;
}) {
  const { state } = useRentbook();
  const today = useLagosNow();
  return (
    <section className="rbk-attention">
      <div>
        <p>Needs attention</p>
        <h2>
          {entries.length
            ? `${entries.length} items need a decision`
            : "Nothing needs a decision today."}
        </h2>
      </div>
      {entries.map((entry) => {
        const tenant = state.tenants.find((candidate) => candidate.id === entry.lease?.tenantId);
        const detail = attentionDetail(entry, today, state);
        const action = attentionAction(entry, tenant?.id);
        return (
          <article key={entry.charge?.id ?? entry.lease?.id}>
            <span className="rbk-stamp">
              {entry.status === "expiring" ? "EXPIRING" : entry.status.replace("_", " ")}
            </span>
            <b>{tenant?.name}</b>
            <span>{detail}</span>
            {action}
          </article>
        );
      })}
    </section>
  );
}

function attentionAction(entry: AttentionEntry, tenantId: string | undefined) {
  if (entry.charge && (entry.status === "overdue" || entry.status === "partial")) {
    return (
      <button
        type="button"
        onClick={() =>
          window.dispatchEvent(new CustomEvent("rentbook:reminder", { detail: { tenantId } }))
        }
      >
        Send reminder
      </button>
    );
  }
  if (entry.charge) {
    return (
      <button
        type="button"
        onClick={() =>
          window.dispatchEvent(new CustomEvent("rentbook:payment", { detail: { tenantId } }))
        }
      >
        Record payment
      </button>
    );
  }
  return <Link href="/work/rentbook/rent-roll">View in rent roll</Link>;
}

function attentionDetail(entry: AttentionEntry, today: Date | null, state: OverviewState) {
  if (entry.charge && today) {
    return `${relativeDueDate(entry.charge.dueDate, today)} · ${naira(balanceForCharge(entry.charge, state.payments))}`;
  }
  if (entry.lease && today) {
    return `Lease ${relativeDueDate(entry.lease.endDate, today)}`;
  }
  return "";
}
