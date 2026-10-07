"use client";

import { X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { useFieldhand } from "@/src/demos/fieldhand/components/FieldhandProvider";
import type { JobStatus } from "@/src/demos/fieldhand/types";

const statuses: JobStatus[] = ["unassigned", "scheduled", "en_route", "on_site", "done"];

export function JobDrawer() {
  const { state, moveJob, updateNotes } = useFieldhand();
  const router = useRouter();
  const params = useSearchParams();
  const job = state.jobs.find((item) => item.id === params.get("job"));
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  if (!job) return null;
  const customer = state.customers.find((item) => item.id === job.customerId);
  const technician = state.technicians.find((item) => item.id === job.technicianId);

  return <aside className="fixed inset-y-0 right-0 z-40 flex w-full max-w-md flex-col border-l border-[var(--fld-line)] bg-[var(--fld-panel)] shadow-2xl" aria-label={`Job details for ${job.id}`}>
    <header className="flex items-start justify-between border-b border-[var(--fld-line)] p-5"><div><p className="font-mono text-xs text-[var(--fld-muted)]">{job.id}</p><h2 className="mt-2 text-lg font-semibold">{job.title}</h2></div><button className="grid size-10 place-items-center hover:bg-[var(--fld-hover)]" type="button" onClick={() => router.push("/work/fieldhand")} aria-label="Close job details"><X size={18} /></button></header>
    <div className="flex-1 space-y-6 overflow-y-auto p-5"><section><h3 className="text-sm font-medium">Status</h3><select className="mt-2 h-10 w-full border border-[var(--fld-line)] bg-[var(--fld-raised)] px-3 text-sm" value={job.status} onChange={(event) => moveJob(job.id, event.target.value as JobStatus)}>{statuses.map((status) => <option key={status} value={status}>{status.replace("_", " ")}</option>)}</select></section>
      <section className="border-t border-[var(--fld-line)] pt-5"><h3 className="text-sm font-medium">Customer</h3><p className="mt-2 text-sm">{customer?.name}</p><a className="mt-1 block text-sm text-[var(--fld-signal)]" href={`tel:${customer?.phone.replaceAll(" ", "")}`}>{customer?.phone}</a><p className="mt-2 text-sm text-[var(--fld-muted)]">{job.address}, {job.area}</p></section>
      <section className="border-t border-[var(--fld-line)] pt-5"><div className="flex justify-between"><h3 className="text-sm font-medium">Dispatcher notes</h3><button className="text-xs text-[var(--fld-signal)]" type="button" onClick={() => setIsEditingNotes((value) => !value)}>{isEditingNotes ? "Cancel" : "Edit"}</button></div>{isEditingNotes ? <textarea className="mt-2 min-h-28 w-full border border-[var(--fld-line)] bg-[var(--fld-raised)] p-3 text-sm" defaultValue={job.notes} onBlur={(event) => { updateNotes(job.id, event.target.value); setIsEditingNotes(false); }} autoFocus /> : <p className="mt-2 text-sm leading-6 text-[var(--fld-muted)]">{job.notes}</p>}</section>
      <section className="border-t border-[var(--fld-line)] pt-5"><h3 className="text-sm font-medium">Activity</h3><ol className="mt-3 space-y-3">{job.activity.map((entry) => <li key={entry.id} className="border-l border-[var(--fld-line)] pl-3"><p className="text-sm">{entry.message}</p><p className="mt-1 font-mono text-[11px] text-[var(--fld-muted)]">{entry.actor}</p></li>)}</ol></section>
      <section className="border-t border-[var(--fld-line)] pt-5"><h3 className="text-sm font-medium">Assignment</h3><p className="mt-2 text-sm text-[var(--fld-muted)]">{technician ? `${technician.name} · ${technician.phone}` : "Awaiting dispatcher assignment"}</p></section>
      <section className="border-t border-[var(--fld-line)] pt-5"><h3 className="text-sm font-medium">Attachments</h3><p className="mt-2 border border-dashed border-[var(--fld-line)] p-3 text-sm text-[var(--fld-muted)]">No files attached to this job.</p></section>
    </div>
  </aside>;
}
