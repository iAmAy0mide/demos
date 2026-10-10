"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useFieldhand } from "@/src/demos/fieldhand/components/FieldhandProvider";

const TOAST_DURATION_MS = 4000;

function ToastItem({
  id,
  message,
  actionJobId,
}: {
  id: string;
  message: string;
  actionJobId?: string;
}) {
  const { dismissToast } = useFieldhand();
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) {
      return;
    }
    const timer = window.setTimeout(() => dismissToast(id), TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [dismissToast, id, paused]);
  return (
    <div
      data-testid="toast"
      className="flex items-center gap-3 border border-[var(--fld-line)] bg-[var(--fld-panel)] px-3 py-2.5 text-sm shadow-xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <span className="min-w-0 flex-1">{message}</span>
      {actionJobId && (
        <Link
          href={`/work/fieldhand?created=${actionJobId}`}
          className="shrink-0 text-xs font-medium text-[var(--fld-signal)] hover:underline"
        >
          View on board
        </Link>
      )}
      <button
        type="button"
        className="grid size-8 place-items-center rounded hover:bg-[var(--fld-hover)]"
        onClick={() => dismissToast(id)}
        aria-label="Dismiss notification"
      >
        <X size={15} />
      </button>
    </div>
  );
}

export function ToastStack() {
  const { state } = useFieldhand();
  return (
    <div
      className="pointer-events-none fixed top-[4.25rem] right-5 z-[60] flex w-[min(22rem,calc(100vw-2.5rem))] flex-col gap-2 max-md:right-3 max-md:left-3 max-md:w-auto"
      aria-live="polite"
    >
      {state.toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem {...toast} />
        </div>
      ))}
    </div>
  );
}
