"use client";

import { useState } from "react";

import { useFieldhand } from "@/src/demos/fieldhand/components/FieldhandProvider";
import { findSchedulingConflicts } from "@/src/demos/fieldhand/lib/jobUtils";
import { lagosHour, lagosWeekday } from "@/src/shared/lib/lagos-time";
import { useLagosNow } from "@/src/shared/lib/useLagosNow";

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16];

export function ScheduleTimeline() {
  const { state } = useFieldhand();
  const [selectedTechnicianId, setSelectedTechnicianId] = useState("");
  const now = useLagosNow();
  const scheduleDay = now ? lagosWeekday(now) : "Lagos";
  if (!state.isLoaded) {
    return <main className="p-6 text-sm text-[var(--fld-muted)]">Loading schedule…</main>;
  }
  const selectedTechnician =
    state.technicians.find(({ id }) => id === selectedTechnicianId) ?? state.technicians[0];
  const scheduledJobs = state.jobs.filter(
    (job) => job.technicianId === selectedTechnician.id && job.scheduledStart,
  );
  return (
    <main className="min-h-full min-w-0 overflow-x-clip overflow-y-visible p-3 pb-[var(--axm-shell-clearance)] md:h-full md:min-h-0 md:overflow-auto md:p-6">
      <header className="min-w-0">
        <p className="font-mono text-xs text-[var(--fld-muted)]">{scheduleDay} · Lagos</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-[-.04em]">Technician timeline</h1>
      </header>
      <section className="mt-4 md:hidden" aria-label="Technician day timeline">
        <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-3">
          {state.technicians.map((technician) => (
            <button
              key={technician.id}
              type="button"
              onClick={() => setSelectedTechnicianId(technician.id)}
              className={`min-h-11 shrink-0 rounded-full border px-3 text-sm ${selectedTechnician.id === technician.id ? "border-[var(--fld-signal)] text-[var(--fld-signal)]" : "border-[var(--fld-line)]"}`}
            >
              {technician.initials} {technician.name.split(" ")[0]}
            </button>
          ))}
        </div>
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="grid min-h-16 grid-cols-[3rem_1fr] border-t border-[var(--fld-line)] py-2"
          >
            <span className="font-mono text-xs text-[var(--fld-muted)]">{hour}:00</span>
            <div className="min-w-0 space-y-1">
              {scheduledJobs
                .filter((job) => lagosHour(new Date(job.scheduledStart as string)) === hour)
                .map((job) => (
                  <div
                    key={job.id}
                    className="min-w-0 border border-[var(--fld-line)] bg-[var(--fld-raised)] p-2 text-sm"
                  >
                    <span className="font-mono text-xs text-[var(--fld-signal)]">{job.id}</span>
                    <br />
                    <span className="mt-0.5 block break-words">{job.title}</span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </section>
      <div className="mt-6 hidden overflow-x-auto border border-[var(--fld-line)] md:block">
        <div className="min-w-[950px]">
          <div className="grid grid-cols-[170px_repeat(9,1fr)] border-b border-[var(--fld-line)]">
            {["Technician", ...HOURS.map((hour) => `${hour}:00`)].map((label) => (
              <div
                key={label}
                className="border-r border-[var(--fld-line)] p-2 font-mono text-xs text-[var(--fld-muted)]"
              >
                {label}
              </div>
            ))}
          </div>
          {state.technicians.map((technician) => {
            const conflicts = new Set(
              findSchedulingConflicts(state.jobs, technician.id).map((job) => job.id),
            );
            const jobs = state.jobs.filter(
              (job) => job.technicianId === technician.id && job.scheduledStart,
            );
            return (
              <div
                key={technician.id}
                className="grid min-h-20 grid-cols-[170px_repeat(9,1fr)] border-b border-[var(--fld-line)]"
              >
                <div className="border-r border-[var(--fld-line)] p-3">
                  <p className="text-sm font-medium">{technician.name}</p>
                  <p className="mt-1 text-xs text-[var(--fld-muted)]">
                    {technician.status.replace("_", " ")}
                  </p>
                </div>
                {HOURS.map((hour) => (
                  <div key={hour} className="relative border-r border-[var(--fld-line)]">
                    {jobs
                      .filter((job) => lagosHour(new Date(job.scheduledStart as string)) === hour)
                      .map((job) => (
                        <div
                          key={job.id}
                          className={`absolute inset-x-1 top-2 overflow-hidden border px-2 py-1 text-xs ${conflicts.has(job.id) ? "border-[var(--fld-signal)] bg-[var(--fld-selected)]" : "border-[var(--fld-line)] bg-[var(--fld-raised)]"}`}
                        >
                          <span className="font-mono">{job.id}</span>
                          <br />
                          {job.title}
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
