"use client";
import { useEffect, useMemo, useState } from "react";

import { lagosDateKey } from "@/src/shared/lib/lagos-time";
import { useIsEmbedded } from "@/src/shared/lib/useIsEmbedded";
import { useLagosNow } from "@/src/shared/lib/useLagosNow";

import { useRentbook } from "./RentbookProvider";
import { balanceForCharge, naira } from "../lib/finance";
export function PaymentDialog() {
  const { state, dispatch } = useRentbook();
  const now = useLagosNow();
  const isEmbedded = useIsEmbedded();
  const [open, setOpen] = useState(false);
  const [tenantId, setTenantId] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  useEffect(() => {
    const show = (event: Event) => {
      const detail =
        event instanceof CustomEvent ? (event.detail as { tenantId?: string }) : undefined;
      setOpen(true);
      setError("");
      setTenantId(detail?.tenantId ?? "");
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("rentbook:payment", show);
    window.addEventListener("keydown", escape);
    return () => {
      window.removeEventListener("rentbook:payment", show);
      window.removeEventListener("keydown", escape);
    };
  }, []);
  const charges = useMemo(
    () =>
      state.charges
        .filter((c) => state.leases.find((l) => l.id === c.leaseId)?.tenantId === tenantId)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [state, tenantId],
  );
  const total = Number(amount) || 0;
  const outstanding = charges.reduce((sum, c) => sum + balanceForCharge(c, state.payments), 0);
  function save() {
    if (!now || !tenantId) {
      setError("Choose the tenant who made this payment.");
      return;
    }
    if (!Number.isFinite(total) || total <= 0) {
      setError("Enter a payment amount greater than zero.");
      return;
    }
    if (total > outstanding) {
      setError(`This payment exceeds the ${naira(outstanding)} outstanding balance.`);
      return;
    }
    let remaining = total;
    const allocations = charges
      .map((charge) => {
        const value = Math.min(remaining, balanceForCharge(charge, state.payments));
        remaining -= value;
        return { chargeId: charge.id, amount: value };
      })
      .filter((x) => x.amount > 0);
    dispatch({
      type: "record_payment",
      payment: {
        id: `payment-${crypto.randomUUID()}`,
        tenantId,
        amount: total,
        date: lagosDateKey(now),
        method: "bank_transfer",
        reference: "MANUAL",
        allocations,
        notes: "",
      },
    });
    setOpen(false);
    setAmount("");
    setTenantId("");
    setSuccess(`${naira(total)} recorded and allocated to the oldest balances.`);
    window.setTimeout(() => setSuccess(""), 5000);
  }
  if (!open) {
    return success && !isEmbedded ? (
      <p className="rbk-toast" role="status">
        {success}
      </p>
    ) : null;
  }
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Record payment"
      className="rbk-dialog"
      onMouseDown={(e) => {
        if (e.currentTarget === e.target) {
          setOpen(false);
        }
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <h2>Record payment</h2>
        <label>
          Tenant
          <select
            required
            value={tenantId}
            onChange={(e) => {
              setTenantId(e.target.value);
              setError("");
            }}
          >
            <option value="">Choose tenant</option>
            {state.tenants.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Amount
          <input
            required
            inputMode="numeric"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError("");
            }}
            placeholder="250000"
          />
        </label>
        <p>Oldest charges are allocated first. {naira(outstanding)} outstanding.</p>
        {error ? (
          <p className="rbk-form-error" role="alert">
            {error}
          </p>
        ) : null}
        <button className="rbk-primary">Save payment</button>
        <button type="button" onClick={() => setOpen(false)}>
          Cancel
        </button>
      </form>
    </div>
  );
}
