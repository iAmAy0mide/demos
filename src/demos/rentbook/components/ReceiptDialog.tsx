"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { buildWhatsAppLinkTo, toInternationalNigerianNumber } from "@/src/shared/config/contact";

import { useRentbook } from "./RentbookProvider";
import { amountInWords, formatRentbookDate, naira } from "../lib/finance";

export function ReceiptDialog() {
  const { state } = useRentbook();
  const dialogRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(readReceiptId);
  const [thermal, setThermal] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const close = useCallback(() => {
    setReceiptId(null);
    window.history.replaceState({}, "", window.location.pathname);
    window.setTimeout(() => returnFocusRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    const open = (event: Event) => {
      returnFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setReceiptId((event as CustomEvent<{ receiptId: string }>).detail.receiptId);
    };
    const syncWithUrl = () => setReceiptId(readReceiptId());
    window.addEventListener("rentbook:receipt", open);
    window.addEventListener("popstate", syncWithUrl);
    return () => {
      window.removeEventListener("rentbook:receipt", open);
      window.removeEventListener("popstate", syncWithUrl);
    };
  }, []);

  useEffect(() => {
    if (!receiptId) {
      return;
    }
    dialogRef.current?.querySelector<HTMLElement>("button, a")?.focus();
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
      }
    };
    const outside = (event: PointerEvent) => {
      if (!dialogRef.current?.contains(event.target as Node)) {
        close();
      }
    };
    document.addEventListener("keydown", dismiss);
    document.addEventListener("pointerdown", outside);
    return () => {
      document.removeEventListener("keydown", dismiss);
      document.removeEventListener("pointerdown", outside);
    };
  }, [close, receiptId]);

  const receipt = state.receipts.find((item) => item.id === receiptId);
  const payment = state.payments.find((item) => item.id === receipt?.paymentId);
  if (!receipt || !payment) {
    return null;
  }
  const tenant = state.tenants.find((item) => item.id === payment.tenantId);
  const lease = state.leases.find((item) => item.tenantId === payment.tenantId);
  const unit = state.units.find((item) => item.id === lease?.unitId);
  const property = state.properties.find((item) => item.id === unit?.propertyId);
  const balance = paymentBalance(state, payment.tenantId, lease?.id);
  const summary = `${receipt.number}: ${naira(payment.amount)} received for ${unit?.label ?? "the unit"}; balance after payment ${naira(balance)}.`;
  const phone = tenant ? toInternationalNigerianNumber(tenant.phone) : null;

  return (
    <div className="rbk-dialog rbk-receipt-layer">
      <article
        ref={dialogRef}
        className={`rbk-receipt ${thermal ? "rbk-thermal" : ""}`}
        data-testid="receipt"
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-title"
      >
        <button
          className="rbk-receipt-close"
          type="button"
          onClick={close}
          aria-label="Close receipt"
        >
          ×
        </button>
        <header>
          <p>OKAFOR & SONS PROPERTIES</p>
          <h2 id="receipt-title">Payment receipt</h2>
          <span>{receipt.number}</span>
        </header>
        <PaidStamp />
        <dl>
          <ReceiptDetail label="Date" value={formatRentbookDate(payment.date)} />
          <ReceiptDetail label="Received from" value={tenant?.name ?? "Tenant"} />
          <ReceiptDetail
            label="Property / unit"
            value={`${property?.name ?? "Property"} · ${unit?.label ?? "Unit"}`}
          />
          <ReceiptDetail
            label="Method / reference"
            value={`${payment.method.replace("_", " ")} · ${payment.reference || "Cash"}`}
          />
        </dl>
        <p className="rbk-receipt-amount">{naira(payment.amount)}</p>
        <p className="rbk-receipt-words">{amountInWords(Math.round(payment.amount * 100))}</p>
        <section>
          <b>Allocated charges</b>
          {payment.allocations.map((allocation) => (
            <p key={allocation.chargeId}>
              {state.charges.find((charge) => charge.id === allocation.chargeId)?.description ??
                "Charge"}
              <span>{naira(allocation.amount)}</span>
            </p>
          ))}
        </section>
        <p>
          Balance after payment <b>{naira(balance)}</b>
        </p>
        <footer>Authorised signature __________________</footer>
        <div className="rbk-receipt-actions">
          <button type="button" onClick={() => setThermal((isThermal) => !isThermal)}>
            {thermal ? "A4 layout" : "80mm thermal"}
          </button>
          <button type="button" onClick={() => window.print()}>
            Print
          </button>
          {phone ? (
            <a href={buildWhatsAppLinkTo(phone, summary)} target="_blank" rel="noreferrer">
              Share on WhatsApp
            </a>
          ) : (
            <span>Tenant has no phone number</span>
          )}
          <button type="button" onClick={() => copySummary(summary, setCopyStatus)}>
            Copy summary
          </button>
        </div>
        <p className="rbk-sr-only" aria-live="polite">
          {copyStatus}
        </p>
      </article>
    </div>
  );
}

function readReceiptId() {
  return typeof window === "undefined"
    ? null
    : new URLSearchParams(window.location.search).get("receipt");
}

function paymentBalance(
  state: ReturnType<typeof useRentbook>["state"],
  tenantId: string,
  leaseId: string | undefined,
) {
  const charged = state.charges
    .filter((charge) => charge.leaseId === leaseId)
    .reduce((sum, charge) => sum + charge.amount, 0);
  const paid = state.payments
    .filter((item) => item.tenantId === tenantId)
    .reduce((sum, item) => sum + item.amount, 0);
  return Math.max(0, charged - paid);
}

function ReceiptDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function PaidStamp() {
  return (
    <svg className="rbk-paid-stamp" viewBox="0 0 150 70" aria-label="Paid">
      <rect x="4" y="4" width="142" height="62" rx="3" />
      <text x="75" y="46" textAnchor="middle">
        PAID
      </text>
    </svg>
  );
}

function copySummary(summary: string, setCopyStatus: (status: string) => void) {
  void navigator.clipboard.writeText(summary).then(
    () => setCopyStatus("Receipt summary copied."),
    () => setCopyStatus("Could not copy the receipt summary."),
  );
}
