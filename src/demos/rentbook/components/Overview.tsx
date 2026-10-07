"use client";

import { Building2, CircleAlert, WalletCards } from "lucide-react";
import type { ReactNode } from "react";
import { balanceForCharge, getChargeStatus, naira } from "../lib/finance";
import { useRentbook } from "./RentbookProvider";

export function Overview() {
  const { state } = useRentbook();
  if (!state.isLoaded) return <main className="rbk-page"><p>Preparing your ledger…</p></main>;
  const today = new Date();
  const outstanding = state.charges.reduce((total, charge) => total + balanceForCharge(charge, state.payments), 0);
  const collected = state.payments.reduce((total, payment) => total + payment.amount, 0);
  const overdue = state.charges.filter((charge) => getChargeStatus(charge, state.payments, today) === "overdue");
  const occupied = state.units.filter((unit) => unit.status === "occupied").length;
  return <main className="rbk-page"><header className="rbk-page-header"><div><p>Tuesday, 7 October 2026</p><h1>Good morning, Okafor &amp; Sons.</h1><span>Everything worth checking before your first site call.</span></div><button className="rbk-primary">Record payment</button></header><section className="rbk-summary" aria-label="Portfolio summary"><Metric icon={<WalletCards/>} label="Collected this year" value={naira(collected)}/><Metric icon={<CircleAlert/>} label="Outstanding" value={naira(outstanding)}/><Metric icon={<Building2/>} label="Occupancy" value={`${occupied}/${state.units.length || 1}`}/></section><section className="rbk-attention"><div><p>Needs attention</p><h2>{overdue.length ? `${overdue.length} rent account${overdue.length > 1 ? "s are" : " is"} overdue` : "Nothing overdue today."}</h2></div>{overdue.map((charge) => { const lease = state.leases.find((entry) => entry.id === charge.leaseId); const tenant = state.tenants.find((entry) => entry.id === lease?.tenantId); return <article key={charge.id}><span className="rbk-stamp">OVERDUE</span><b>{tenant?.name}</b><span>{charge.description}</span><strong>{naira(balanceForCharge(charge, state.payments))}</strong></article>; })}</section></main>;
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) { return <article><span>{icon}</span><p>{label}</p><strong>{value}</strong></article>; }
