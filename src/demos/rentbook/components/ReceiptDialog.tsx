"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ReceiptDocument } from "./ReceiptDocument";
import { useRentbook } from "./RentbookProvider";

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
  return (
    <ReceiptDocument
      state={state}
      receipt={receipt}
      payment={payment}
      tenantName={tenant?.name ?? "Tenant"}
      tenantPhone={tenant?.phone}
      propertyName={property?.name ?? "Property"}
      unitLabel={unit?.label ?? "Unit"}
      balance={balance}
      thermal={thermal}
      copyStatus={copyStatus}
      onClose={close}
      onThermalChange={() => setThermal((isThermal) => !isThermal)}
      onCopy={(summary) => copySummary(summary, setCopyStatus)}
      dialogRef={dialogRef}
    />
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

function copySummary(summary: string, setCopyStatus: (status: string) => void) {
  void navigator.clipboard.writeText(summary).then(
    () => setCopyStatus("Receipt summary copied."),
    () => setCopyStatus("Could not copy the receipt summary."),
  );
}
