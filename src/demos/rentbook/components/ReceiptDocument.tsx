import { buildWhatsAppLinkTo, toInternationalNigerianNumber } from "@/src/shared/config/contact";

import { amountInWords, formatRentbookDate, naira } from "../lib/finance";

import type { RentbookState } from "../lib/rentbookReducer";
import type { Payment, Receipt } from "../types";

type ReceiptDocumentProps = {
  state: RentbookState;
  receipt: Receipt;
  payment: Payment;
  tenantName: string;
  tenantPhone?: string;
  propertyName: string;
  unitLabel: string;
  balance: number;
  thermal: boolean;
  copyStatus: string;
  onClose: () => void;
  onThermalChange: () => void;
  onCopy: (summary: string) => void;
  dialogRef: React.RefObject<HTMLElement | null>;
};

export function ReceiptDocument({
  state,
  receipt,
  payment,
  tenantName,
  tenantPhone,
  propertyName,
  unitLabel,
  balance,
  thermal,
  copyStatus,
  onClose,
  onThermalChange,
  onCopy,
  dialogRef,
}: ReceiptDocumentProps) {
  const summary = `${receipt.number}: ${naira(payment.amount)} received for ${unitLabel}; balance after payment ${naira(balance)}.`;
  const phone = tenantPhone ? toInternationalNigerianNumber(tenantPhone) : null;
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
          onClick={onClose}
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
          <ReceiptDetail label="Received from" value={tenantName} />
          <ReceiptDetail label="Property / unit" value={`${propertyName} · ${unitLabel}`} />
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
          <button type="button" onClick={onThermalChange}>
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
          <button type="button" onClick={() => onCopy(summary)}>
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
