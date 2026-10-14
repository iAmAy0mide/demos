"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { lagosDateKey } from "@/src/shared/lib/lagos-time";

import { ReminderDialogContent } from "./ReminderDialogContent";
import { useRentbook } from "./RentbookProvider";
import { balanceForCharge, naira, relativeDueDate } from "../lib/finance";
import { buildReminderMessage, type ReminderTone } from "../lib/reminders";

type ReminderRequest = { tenantId?: string; tenantIds?: string[] };

export function ReminderDialog() {
  const { state, dispatch } = useRentbook();
  const dialogRef = useRef<HTMLElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const [tenantIds, setTenantIds] = useState<string[]>([]);
  const [position, setPosition] = useState(0);
  const [tone, setTone] = useState<ReminderTone>("gentle");
  const [message, setMessage] = useState("");
  const [copyStatus, setCopyStatus] = useState("");
  const details = useMemo(
    () => reminderDetails(state, tenantIds[position]),
    [position, state, tenantIds],
  );
  const close = useCallback(() => {
    setTenantIds([]);
    setPosition(0);
    window.setTimeout(() => returnFocusRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    const open = (event: Event) => {
      const detail = (event as CustomEvent<ReminderRequest>).detail;
      const ids = detail.tenantIds ?? (detail.tenantId ? [detail.tenantId] : []);
      returnFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setTenantIds(ids);
      setPosition(0);
      setTone("gentle");
    };
    window.addEventListener("rentbook:reminder", open);
    return () => window.removeEventListener("rentbook:reminder", open);
  }, []);
  useEffect(() => {
    if (!details) {
      return;
    }
    dialogRef.current?.querySelector<HTMLElement>("button, select, textarea, a")?.focus();
    const key = (event: KeyboardEvent) => event.key === "Escape" && close();
    const pointer = (event: PointerEvent) =>
      !dialogRef.current?.contains(event.target as Node) && close();
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", pointer);
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", pointer);
    };
  }, [close, details]);
  if (!details) {
    return null;
  }
  const displayedMessage = message || buildReminderMessage(tone, details);
  const advance = () =>
    position + 1 < tenantIds.length ? setPosition((value) => value + 1) : close();
  const sent = () => {
    dispatch({
      type: "log_reminder",
      tenantId: details.tenantId,
      tone,
      date: lagosDateKey(new Date()),
    });
    advance();
  };
  return (
    <ReminderDialogContent
      details={details}
      tenantCount={tenantIds.length}
      position={position}
      tone={tone}
      message={displayedMessage}
      copyStatus={copyStatus}
      dialogRef={dialogRef}
      onClose={close}
      onToneChange={(nextTone) => {
        setTone(nextTone);
        setMessage(buildReminderMessage(nextTone, details));
      }}
      onMessageChange={setMessage}
      onSend={sent}
      onCopy={() => copyReminder(displayedMessage, setCopyStatus)}
      onSkip={advance}
    />
  );
}

function reminderDetails(
  state: ReturnType<typeof useRentbook>["state"],
  tenantId: string | undefined,
) {
  const tenant = state.tenants.find((item) => item.id === tenantId);
  const lease = state.leases.find((item) => item.tenantId === tenantId);
  const unit = state.units.find((item) => item.id === lease?.unitId);
  const property = state.properties.find((item) => item.id === unit?.propertyId);
  const charge = state.charges
    .filter((item) => item.leaseId === lease?.id)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
  if (!tenant || !unit || !property || !charge) {
    return null;
  }
  const today = new Date();
  const daysOverdue = Math.max(
    0,
    Math.round(
      (today.getTime() - new Date(`${charge.dueDate}T12:00:00+01:00`).getTime()) / 86_400_000,
    ),
  );
  return {
    tenantId: tenant.id,
    name: tenant.name,
    phone: tenant.phone,
    unit: unit.label,
    property: property.name,
    amount: naira(balanceForCharge(charge, state.payments)),
    dueDate: relativeDueDate(charge.dueDate, today),
    daysOverdue,
  };
}

function copyReminder(message: string, setCopyStatus: (value: string) => void) {
  void navigator.clipboard.writeText(message).then(
    () => setCopyStatus("Reminder text copied."),
    () => setCopyStatus("Could not copy the reminder text."),
  );
}
