"use client";

import { useState } from "react";
import { useFieldhand } from "@/src/demos/fieldhand/components/FieldhandProvider";
import { calculateQuoteTotals, formatNaira } from "@/src/demos/fieldhand/lib/quoteUtils";

export function QuoteWorkspace() {
  const { state } = useFieldhand();
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
  const quote = state.quotes.find((item) => item.id === selectedQuoteId) ?? state.quotes[0];
  if (!state.isLoaded || !quote) return <main className="p-6 text-sm text-[var(--fld-muted)]">Loading quotes…</main>;
  const totals = calculateQuoteTotals(quote);
  return <main className="grid h-full min-h-0 grid-cols-1 overflow-auto md:grid-cols-[260px_minmax(0,1fr)]"><aside className="border-r border-[var(--fld-line)] p-4"><h1 className="text-lg font-semibold">Quotes</h1><div className="mt-4 space-y-1">{state.quotes.map((item) => <button key={item.id} type="button" onClick={() => { setSelectedQuoteId(item.id); setIsSent(false); }} className={`w-full border p-3 text-left text-sm ${quote.id === item.id ? "border-[var(--fld-signal)] bg-[var(--fld-selected)]" : "border-[var(--fld-line)]"}`}><span className="font-mono text-xs">{item.id}</span><span className="mt-1 block">{state.customers.find((customer) => customer.id === item.customerId)?.name}</span></button>)}</div></aside><section className="p-6"><p className="font-mono text-xs text-[var(--fld-muted)]">{quote.id} · {quote.status}</p><h2 className="mt-1 text-2xl font-semibold">Quote builder</h2><div className="mt-6 border-y border-[var(--fld-line)]">{quote.lineItems.map((item) => <div key={item.id} className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-[var(--fld-line)] py-3 text-sm"><span>{item.description}</span><span className="font-mono text-[var(--fld-muted)]">{item.quantity} × {formatNaira(item.unitPrice)}</span><span className="font-mono">{formatNaira(item.quantity * item.unitPrice)}</span></div>)}</div><dl className="mt-5 ml-auto max-w-xs space-y-2 text-sm"><div className="flex justify-between"><dt>Subtotal</dt><dd>{formatNaira(totals.subtotal)}</dd></div><div className="flex justify-between"><dt>VAT</dt><dd>{formatNaira(totals.vat)}</dd></div><div className="flex justify-between border-t border-[var(--fld-line)] pt-2 font-semibold"><dt>Total</dt><dd>{formatNaira(totals.total)}</dd></div></dl><button type="button" disabled={isSent} onClick={() => setIsSent(true)} className="mt-6 min-h-10 bg-[var(--fld-signal)] px-4 text-sm font-medium text-white disabled:opacity-60">{isSent ? "Quote sent" : "Send quote"}</button>{isSent && <p className="mt-3 text-sm text-[var(--fld-signal)]" aria-live="polite">Quote sent to the customer. A confirmation has been added to this demo.</p>}</section></main>;
}
