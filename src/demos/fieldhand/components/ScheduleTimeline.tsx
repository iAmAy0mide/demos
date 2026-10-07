"use client";

import { useFieldhand } from "@/src/demos/fieldhand/components/FieldhandProvider";
import { findSchedulingConflicts } from "@/src/demos/fieldhand/lib/jobUtils";

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16];

export function ScheduleTimeline() {
  const { state } = useFieldhand();
  if (!state.isLoaded) return <main className="p-6 text-sm text-[var(--fld-muted)]">Loading schedule…</main>;
  return <main className="h-full min-h-0 overflow-auto p-4 md:p-6"><header><p className="font-mono text-xs text-[var(--fld-muted)]">Tuesday · Lagos</p><h1 className="mt-1 text-2xl font-semibold tracking-[-.04em]">Technician timeline</h1></header><div className="mt-6 overflow-x-auto border border-[var(--fld-line)]"><div className="min-w-[950px]"><div className="grid grid-cols-[170px_repeat(9,1fr)] border-b border-[var(--fld-line)]">{["Technician", ...HOURS.map((hour) => `${hour}:00`)].map((label) => <div key={label} className="border-r border-[var(--fld-line)] p-2 font-mono text-xs text-[var(--fld-muted)]">{label}</div>)}</div>{state.technicians.map((technician) => { const conflicts = new Set(findSchedulingConflicts(state.jobs, technician.id).map((job) => job.id)); const jobs = state.jobs.filter((job) => job.technicianId === technician.id && job.scheduledStart); return <div key={technician.id} className="grid min-h-20 grid-cols-[170px_repeat(9,1fr)] border-b border-[var(--fld-line)]"><div className="border-r border-[var(--fld-line)] p-3"><p className="text-sm font-medium">{technician.name}</p><p className="mt-1 text-xs text-[var(--fld-muted)]">{technician.status.replace("_", " ")}</p></div>{HOURS.map((hour) => <div key={hour} className="relative border-r border-[var(--fld-line)]">{jobs.filter((job) => new Date(job.scheduledStart as string).getHours() === hour).map((job) => <div key={job.id} className={`absolute inset-x-1 top-2 overflow-hidden border px-2 py-1 text-xs ${conflicts.has(job.id) ? "border-[var(--fld-signal)] bg-[var(--fld-selected)]" : "border-[var(--fld-line)] bg-[var(--fld-raised)]"}`}><span className="font-mono">{job.id}</span><br />{job.title}</div>)}</div>)}</div>})}</div></div></main>;
}
