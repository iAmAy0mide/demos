"use client";

import { AlertTriangle, Plus } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

import { useFieldhand } from "@/src/demos/fieldhand/components/FieldhandProvider";
import { countJobsForStatus, filterJobs } from "@/src/demos/fieldhand/lib/jobUtils";
import type { Job, JobStatus } from "@/src/demos/fieldhand/types";

const boardColumns: { status: JobStatus; label: string }[] = [
  { status: "unassigned", label: "Unassigned" },
  { status: "scheduled", label: "Scheduled" },
  { status: "en_route", label: "En route" },
  { status: "on_site", label: "On site" },
  { status: "done", label: "Done" },
];

const priorityLabel: Record<Job["priority"], string> = { low: "Low", normal: "Normal", high: "High", urgent: "Urgent" };

function JobCard({ job }: { job: Job }) {
  const { moveJob, state } = useFieldhand();
  const [isMoving, setIsMoving] = useState(false);
  const technician = state.technicians.find(({ id }) => id === job.technicianId);

  return (
    <article draggable onDragStart={(event) => event.dataTransfer.setData("text/plain", job.id)} className="border border-[var(--fld-line)] bg-[var(--fld-raised)] p-3 shadow-[0_1px_0_rgba(0,0,0,.16)]">
      <div className="flex items-start justify-between gap-2"><span className="font-mono text-[11px] text-[var(--fld-muted)]">{job.id}</span>{job.priority === "urgent" && <AlertTriangle className="text-[var(--fld-signal)]" size={15} aria-label="Urgent" />}</div>
      <h2 className="mt-2 text-sm font-medium leading-5"><Link className="hover:text-[var(--fld-signal)]" href={`/work/fieldhand?job=${job.id}`}>{job.title}</Link></h2>
      <p className="mt-2 text-xs text-[var(--fld-muted)]">{job.area} · {priorityLabel[job.priority]}</p>
      <div className="mt-3 flex items-center justify-between text-xs"><span className="font-mono text-[var(--fld-muted)]">{technician?.initials ?? "—"}</span><button type="button" className="text-[var(--fld-signal)] hover:underline" onClick={() => setIsMoving((value) => !value)}>Move</button></div>
      {isMoving && <div className="mt-2 grid grid-cols-2 gap-1">{boardColumns.filter(({ status }) => status !== job.status).map(({ status, label }) => <button key={status} type="button" className="border border-[var(--fld-line)] px-1.5 py-1 text-left text-[11px] hover:border-[var(--fld-signal)]" onClick={() => { moveJob(job.id, status); setIsMoving(false); }}>{label}</button>)}</div>}
    </article>
  );
}

export function DispatchBoard() {
  const { state, moveJob, setFilters } = useFieldhand();
  const filteredJobs = filterJobs(state.jobs, state.filters);

  if (!state.isLoaded) return <main className="p-6 text-sm text-[var(--fld-muted)]" aria-live="polite">Loading dispatch board…</main>;

  return (
    <main className="min-w-0 p-4 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-xs text-[var(--fld-muted)]">Tuesday · Lagos operations</p><h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">Dispatch board</h1></div><button type="button" className="inline-flex min-h-10 items-center gap-2 bg-[var(--fld-signal)] px-3 text-sm font-medium text-white hover:brightness-110"><Plus size={16} />New job</button></div>
      <section className="mt-5 grid grid-cols-2 border-y border-[var(--fld-line)] md:grid-cols-4" aria-label="Today’s operations"><Metric label="Jobs today" value={state.jobs.length.toString()} /><Metric label="On-time rate" value="94%" /><Metric label="Unassigned" value={countJobsForStatus(state.jobs, "unassigned").toString()} /><Metric label="Revenue today" value="₦418k" /></section>
      <div className="mt-5 flex gap-2"><select aria-label="Filter by priority" value={state.filters.priority} onChange={(event) => setFilters({ priority: event.target.value as typeof state.filters.priority })} className="h-9 border border-[var(--fld-line)] bg-[var(--fld-raised)] px-2 text-sm"><option value="all">All priorities</option><option value="urgent">Urgent</option><option value="high">High</option><option value="normal">Normal</option><option value="low">Low</option></select><button type="button" className="border border-[var(--fld-line)] px-3 text-sm hover:border-[var(--fld-signal)]" onClick={() => setFilters({ priority: "all", technicianId: "all", status: "all", area: "all" })}>Clear filters</button></div>
      <section className="mt-3 overflow-x-auto pb-3" aria-label="Job status board"><div className="grid min-w-[1100px] grid-cols-5 gap-3">{boardColumns.map(({ status, label }) => <section key={status} onDragOver={(event) => event.preventDefault()} onDrop={(event) => moveJob(event.dataTransfer.getData("text/plain"), status)}><div className="mb-2 flex items-center justify-between border-b border-[var(--fld-line)] pb-2"><h2 className="text-sm font-medium">{label}</h2><span className="font-mono text-xs text-[var(--fld-muted)]">{countJobsForStatus(filteredJobs, status)}</span></div><div className="space-y-2">{filteredJobs.filter((job) => job.status === status).map((job) => <JobCard key={job.id} job={job} />)}</div></section>)}</div></section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="border-r border-[var(--fld-line)] p-3 last:border-r-0"><p className="text-xs text-[var(--fld-muted)]">{label}</p><p className="mt-1 font-mono text-lg">{value}</p></div>; }
