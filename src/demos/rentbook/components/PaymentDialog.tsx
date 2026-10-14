"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { lagosDateKey } from "@/src/shared/lib/lagos-time";
import { useDismissibleLayer } from "@/src/shared/lib/useDismissibleLayer";
import { useIsEmbedded } from "@/src/shared/lib/useIsEmbedded";
import { useLagosNow } from "@/src/shared/lib/useLagosNow";

import { useRentbook } from "./RentbookProvider";
import { allocatePayment, balanceForCharge, naira, parseNairaInput } from "../lib/finance";

import type { PaymentMethod } from "../types";

type PaymentErrors = Partial<Record<"tenant" | "amount" | "reference", string>>;
const REFERENCE_METHODS: PaymentMethod[] = ["bank_transfer", "pos", "cheque"];

export function PaymentDialog() {
  const { state, dispatch } = useRentbook();
  const now = useLagosNow();
  const isEmbedded = useIsEmbedded();
  const dialogRef = useRef<HTMLDivElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [tenantId, setTenantId] = useState("");
  const [tenantQuery, setTenantQuery] = useState("");
  const [amountInput, setAmountInput] = useState("");
  const [date, setDate] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("bank_transfer");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [keepCredit, setKeepCredit] = useState(false);
  const [errors, setErrors] = useState<PaymentErrors>({});
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const amount = parseNairaInput(amountInput) ?? 0;
  const charges = useMemo(() => chargesForTenant(state, tenantId), [state, tenantId]);
  const preview = useMemo(
    () => (amount > 0 ? allocatePayment(charges, state.payments, amount) : null),
    [amount, charges, state.payments],
  );
  const isDirty = Boolean(
    tenantId || amountInput || reference || notes || method !== "bank_transfer",
  );
  useDismissibleLayer({ isOpen, onDismiss: requestClose, layerRef: dialogRef });

  useEffect(() => {
    const openPayment = (event: Event) => {
      const detail =
        event instanceof CustomEvent ? (event.detail as { tenantId?: string }) : undefined;
      lastFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setTenantId(detail?.tenantId ?? "");
      setTenantQuery(state.tenants.find((tenant) => tenant.id === detail?.tenantId)?.name ?? "");
      setDate(now ? lagosDateKey(now) : "");
      setIsOpen(true);
      setErrors({});
    };
    window.addEventListener("rentbook:payment", openPayment);
    return () => window.removeEventListener("rentbook:payment", openPayment);
  }, [now, state.tenants]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    dialogRef.current?.querySelector<HTMLElement>("input, button, select, textarea")?.focus();
    const trapFocus = (event: KeyboardEvent) => trapDialogFocus(event, dialogRef.current);
    document.addEventListener("keydown", trapFocus);
    return () => document.removeEventListener("keydown", trapFocus);
  }, [isOpen]);

  function requestClose() {
    if (isDirty && !confirmDiscard) {
      setConfirmDiscard(true);
      return;
    }
    close();
  }
  function close() {
    setIsOpen(false);
    setConfirmDiscard(false);
    setTenantId("");
    setTenantQuery("");
    setAmountInput("");
    setReference("");
    setNotes("");
    setKeepCredit(false);
    window.setTimeout(() => lastFocusRef.current?.focus(), 0);
  }
  function validate() {
    const next: PaymentErrors = {};
    if (!tenantId) {
      next.tenant = "Choose the tenant who made this payment.";
    }
    if (parseNairaInput(amountInput) === null || amount <= 0) {
      next.amount = "Enter a payment amount greater than zero.";
    }
    if (REFERENCE_METHODS.includes(method) && !reference.trim()) {
      next.reference = "Add the bank, POS or cheque reference.";
    }
    if (preview && preview.creditAmount > 0 && !keepCredit) {
      next.amount = "Confirm that the extra amount should remain as tenant credit.";
    }
    setErrors(next);
    return next;
  }
  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length || !now || !preview) {
      const field = Object.keys(nextErrors)[0];
      dialogRef.current?.querySelector<HTMLElement>(`[name="${field}"]`)?.focus();
      return;
    }
    const paymentId = `payment-${crypto.randomUUID()}`;
    dispatch({
      type: "record_payment",
      payment: {
        id: paymentId,
        tenantId,
        amount,
        date,
        method,
        reference: reference.trim(),
        allocations: preview.allocations,
        notes: notes.trim(),
        creditAmount: keepCredit ? preview.creditAmount : 0,
      },
    });
    setReceiptId(`receipt-${paymentId}`);
    close();
    window.setTimeout(() => setReceiptId(null), 5_000);
  }

  if (!isOpen) {
    return receiptId && !isEmbedded ? (
      <p className="rbk-toast" role="status">
        Payment recorded <a href={`/work/rentbook/payments?receipt=${receiptId}`}>Open receipt</a>
      </p>
    ) : null;
  }
  return (
    <div className="rbk-dialog">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-title"
        className="rbk-payment-drawer"
        data-testid="payment-drawer"
      >
        {confirmDiscard ? (
          <section className="rbk-discard-confirm" aria-live="assertive">
            <p>Discard this payment entry?</p>
            <button type="button" onClick={close}>
              Discard
            </button>
            <button type="button" onClick={() => setConfirmDiscard(false)}>
              Keep editing
            </button>
          </section>
        ) : null}
        <form onSubmit={save} noValidate>
          <header>
            <div>
              <p>Collection entry</p>
              <h2 id="payment-title">Record payment</h2>
            </div>
            <button type="button" onClick={requestClose} aria-label="Close record payment">
              ×
            </button>
          </header>
          <label>
            Tenant{" "}
            <input
              name="tenant"
              role="combobox"
              aria-autocomplete="list"
              aria-controls="rentbook-tenants"
              aria-expanded="false"
              list="rentbook-tenants"
              value={tenantQuery}
              onChange={(event) => {
                setTenantQuery(event.target.value);
                const match = state.tenants.find(
                  (item) => item.name.toLowerCase() === event.target.value.toLowerCase(),
                );
                setTenantId(match?.id ?? "");
              }}
              aria-describedby={errors.tenant ? "tenant-error" : undefined}
              placeholder="Search tenant"
            />
            <datalist id="rentbook-tenants">
              {state.tenants.map((item) => (
                <option key={item.id} value={item.name} />
              ))}
            </datalist>
          </label>
          {errors.tenant ? (
            <p id="tenant-error" className="rbk-form-error">
              {errors.tenant}
            </p>
          ) : null}
          <div className="rbk-payment-field-grid">
            <label>
              Amount{" "}
              <input
                name="amount"
                inputMode="decimal"
                className="rbk-money-input"
                value={amountInput}
                onBlur={() => validate()}
                onChange={(event) => setAmountInput(event.target.value)}
                placeholder="1,500,000 or 1.5m"
                aria-describedby={errors.amount ? "amount-error" : undefined}
              />
            </label>
            <label>
              Date{" "}
              <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
            </label>
          </div>
          {errors.amount ? (
            <p id="amount-error" className="rbk-form-error">
              {errors.amount}
            </p>
          ) : null}
          <div className="rbk-payment-field-grid">
            <label>
              Method{" "}
              <select
                value={method}
                onChange={(event) => setMethod(event.target.value as PaymentMethod)}
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Transfer</option>
                <option value="pos">POS</option>
                <option value="cheque">Cheque</option>
              </select>
            </label>
            <label>
              Reference{" "}
              {REFERENCE_METHODS.includes(method) ? (
                <input
                  name="reference"
                  value={reference}
                  onBlur={() => validate()}
                  onChange={(event) => setReference(event.target.value)}
                  aria-describedby={errors.reference ? "reference-error" : undefined}
                />
              ) : (
                <input value="Not required for cash" disabled />
              )}
            </label>
          </div>
          {errors.reference ? (
            <p id="reference-error" className="rbk-form-error">
              {errors.reference}
            </p>
          ) : null}
          <label>
            Notes{" "}
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} />
          </label>
          <PaymentPreview
            charges={charges}
            preview={preview}
            keepCredit={keepCredit}
            onKeepCredit={setKeepCredit}
          />
          <footer>
            <button type="button" onClick={requestClose}>
              Cancel
            </button>
            <button className="rbk-primary" type="submit">
              Save payment
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}

function chargesForTenant(state: ReturnType<typeof useRentbook>["state"], tenantId: string) {
  const leaseIds = new Set(
    state.leases.filter((lease) => lease.tenantId === tenantId).map((lease) => lease.id),
  );
  return state.charges
    .filter(
      (charge) => leaseIds.has(charge.leaseId) && balanceForCharge(charge, state.payments) > 0,
    )
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

function trapDialogFocus(event: KeyboardEvent, dialog: HTMLDivElement | null) {
  if (event.key !== "Tab") {
    return;
  }
  const targets = [
    ...(dialog?.querySelectorAll<HTMLElement>(
      "button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])",
    ) ?? []),
  ];
  if (!targets.length) {
    return;
  }
  const first = targets[0];
  const last = targets.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last?.focus();
  }
  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function PaymentPreview({
  charges,
  preview,
  keepCredit,
  onKeepCredit,
}: {
  charges: ReturnType<typeof chargesForTenant>;
  preview: ReturnType<typeof allocatePayment> | null;
  keepCredit: boolean;
  onKeepCredit: (value: boolean) => void;
}) {
  if (!preview) {
    return (
      <aside className="rbk-allocation-preview">
        <b>Allocation preview</b>
        <p>Enter an amount to see how it applies oldest first.</p>
      </aside>
    );
  }
  return (
    <aside className="rbk-allocation-preview">
      <b>Allocation preview</b>
      {preview.allocations.length ? (
        <ul>
          {preview.allocations.map((allocation) => {
            const charge = charges.find((item) => item.id === allocation.chargeId);
            return (
              <li key={allocation.chargeId}>
                <span>{charge?.description}</span>
                <strong>{naira(allocation.amount)}</strong>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No outstanding charges for this tenant.</p>
      )}
      <p>
        Remaining balance <strong>{naira(preview.remainingBalance)}</strong>
      </p>
      {preview.creditAmount > 0 ? (
        <label className="rbk-credit-toggle">
          <input
            type="checkbox"
            checked={keepCredit}
            onChange={(event) => onKeepCredit(event.target.checked)}
          />{" "}
          Keep the extra {naira(preview.creditAmount)} as credit
        </label>
      ) : null}
    </aside>
  );
}
