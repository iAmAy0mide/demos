"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useFieldhand } from "@/src/demos/fieldhand/components/FieldhandProvider";
import { findSchedulingConflicts } from "@/src/demos/fieldhand/lib/jobUtils";
import { lagosHour, lagosWeekday } from "@/src/shared/lib/lagos-time";
import { useLagosNow } from "@/src/shared/lib/useLagosNow";

import { ScheduleMobileTimeline } from "./ScheduleMobileTimeline";

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16];

export function ScheduleTimeline() {
  const { state } = useFieldhand();
  const router = useRouter();
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
    <main
      className="min-h-full min-w-0 overflow-x-clip overflow-y-visible p-3 pb-[var(--axm-shell-clearance)] md:h-full md:min-h-0 md:overflow-auto md:p-6"
      data-testid="schedule-timeline"
    >
      <header className="min-w-0">
        <p className="font-mono text-xs text-[var(--fld-muted)]">{scheduleDay} · Lagos</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-[-.04em]">Technician timeline</h1>
      </header>
      <ScheduleMobileTimeline
        technicians={state.technicians}
        selectedTechnician={selectedTechnician}
        scheduledJobs={scheduledJobs}
        onTechnicianChange={setSelectedTechnicianId}
        onJobOpen={(jobId) => router.push(`/work/fieldhand/schedule?job=${jobId}`)}
      />
      <div
        data-scroll-x="intentional"
        className="mt-6 hidden overflow-x-auto border border-[var(--fld-line)] md:block"
      >
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
                        <button
                          key={job.id}
                          data-testid={`schedule-block-${job.id}`}
                          type="button"
                          aria-label={`Open ${job.id}: ${job.title}`}
                          onClick={() => router.push(`/work/fieldhand/schedule?job=${job.id}`)}
                          className={`absolute inset-x-1 top-2 overflow-hidden border px-2 py-1 text-left text-xs focus-visible:ring-2 focus-visible:ring-[var(--fld-signal)] focus-visible:outline-none ${conflicts.has(job.id) ? "border-[var(--fld-signal)] bg-[var(--fld-selected)]" : "border-[var(--fld-line)] bg-[var(--fld-raised)]"}`}
                        >
                          <span className="font-mono">{job.id}</span>
                          <br />
                          {job.title}
                        </button>
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
