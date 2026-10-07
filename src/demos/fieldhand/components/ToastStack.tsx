"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { useFieldhand } from "@/src/demos/fieldhand/components/FieldhandProvider";

const TOAST_DURATION_MS = 4000;

function ToastItem({ id, message }: { id: string; message: string }) {
  const { dismissToast } = useFieldhand();
  const [paused, setPaused] = useState(false);
  useEffect(() => { if (paused) return; const timer = window.setTimeout(() => dismissToast(id), TOAST_DURATION_MS); return () => window.clearTimeout(timer); }, [dismissToast, id, paused]);
  return <div className="flex items-center gap-3 border border-[var(--fld-line)] bg-[var(--fld-panel)] px-3 py-2.5 text-sm shadow-xl" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}><span className="min-w-0 flex-1">{message}</span><button type="button" className="grid size-8 place-items-center rounded hover:bg-[var(--fld-hover)]" onClick={() => dismissToast(id)} aria-label="Dismiss notification"><X size={15} /></button></div>;
}

export function ToastStack() { const { state } = useFieldhand(); return <div className="pointer-events-none fixed right-5 top-[4.25rem] z-[60] flex w-[min(22rem,calc(100vw-2.5rem))] flex-col gap-2" aria-live="polite">{state.toasts.map((toast) => <div key={toast.id} className="pointer-events-auto"><ToastItem {...toast} /></div>)}</div>; }
