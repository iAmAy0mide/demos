"use client";

import { useEffect, useMemo, useRef } from "react";

import { useFieldhand } from "@/src/demos/fieldhand/components/FieldhandProvider";
import { suggestSlot } from "@/src/demos/fieldhand/lib/suggestSlot";
import type { Job, JobStatus, Technician } from "@/src/demos/fieldhand/types";
import { formatLagosTime } from "@/src/shared/lib/lagos-time";
import { useDismissibleLayer } from "@/src/shared/lib/useDismissibleLayer";

const technicianHues: Record<string, string> = {
  "tech-ade": "bg-sky-700",
  "tech-ngozi": "bg-violet-700",
  "tech-tobi": "bg-amber-700",
  "tech-sade": "bg-emerald-700",
  "tech-ibrahim": "bg-rose-700",
  "tech-chioma": "bg-cyan-700",
};
type AssignPickerProps = { job: Job; onClose: () => void; targetStatus?: JobStatus };

export function AssignPicker({ job, onClose, targetStatus }: AssignPickerProps) {
  const { assignJob, state } = useFieldhand();
  const panelRef = useRef<HTMLDivElement>(null);
  const options = useMemo(
    () => rankTechnicians(state.technicians, state.jobs, job),
    [job, state.jobs, state.technicians],
  );
  useDismissibleLayer({ isOpen: true, onDismiss: onClose, layerRef: panelRef });
  useEffect(() => {
    panelRef.current?.querySelector<HTMLButtonElement>("[data-suggested]")?.focus();
  }, []);
  const select = (technician: Technician) => {
    const jobs = state.jobs.filter(
      (item) => item.technicianId === technician.id && item.id !== job.id,
    );
    const suggested = suggestSlot({
      technicianJobs: jobs,
      durationMinutes: job.durationMinutes,
      day: new Date(),
      existingStart: job.scheduledStart,
    });
    assignJob(job.id, technician.id, targetStatus, suggested.start);
    onClose();
  };
  return (
    <div
      className="fixed inset-0 z-[80] flex items-end bg-[var(--fld-backdrop)] p-0 md:pointer-events-none md:items-start md:justify-end md:bg-transparent md:p-6"
      role="presentation"
    >
      <div
        ref={panelRef}
        data-testid="assign-picker"
        role="dialog"
        aria-modal="true"
        aria-label="Assign technician"
        className="pointer-events-auto w-full border border-[var(--fld-border-strong)] bg-[var(--fld-surface-overlay)] p-4 shadow-[var(--fld-shadow-overlay)] md:mt-16 md:max-w-sm"
      >
        <h2 className="text-lg font-semibold">Assign {job.id}</h2>
        <p className="mt-1 text-sm text-[var(--fld-muted)]">Choose a technician for this visit.</p>
        <div
          className="mt-4 space-y-1"
          role="listbox"
          onKeyDown={(event) => {
            const buttons = Array.from(
              event.currentTarget.querySelectorAll<HTMLButtonElement>("button"),
            );
            const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              buttons[
                (index + (event.key === "ArrowDown" ? 1 : buttons.length - 1)) % buttons.length
              ]?.focus();
            }
          }}
        >
          {options.map(({ technician, suggested, load }, index) => (
            <button
              key={technician.id}
              data-testid={`assign-option-${technician.id}`}
              data-suggested={index === 0 ? "true" : undefined}
              type="button"
              className="flex min-h-11 w-full items-center gap-3 border border-[var(--fld-line)] p-2 text-left hover:bg-[var(--fld-hover)] focus-visible:ring-2 focus-visible:ring-[var(--fld-signal)]/50 focus-visible:outline-none"
              onClick={() => select(technician)}
            >
              <span
                className={`grid size-8 place-items-center rounded-full text-xs font-semibold text-white ${technicianHues[technician.id]}`}
              >
                {technician.initials}
              </span>
              <span className="min-w-0 flex-1">
                <b className="block text-sm">{technician.name}</b>
                <span className="block text-xs text-[var(--fld-muted)]">
                  {load} jobs today ·{" "}
                  {suggested.start
                    ? `free ${formatLagosTime(new Date(suggested.start))}`
                    : suggested.reason}
                </span>
              </span>
              {index === 0 && <span className="text-xs text-[var(--fld-signal)]">Suggested</span>}
            </button>
          ))}
        </div>
        <button
          data-testid="assign-picker-cancel"
          type="button"
          className="mt-3 min-h-11 px-3 text-sm hover:text-[var(--fld-signal)]"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function rankTechnicians(technicians: Technician[], jobs: Job[], job: Job) {
  return technicians
    .map((technician) => {
      const load = jobs.filter(
        (item) => item.technicianId === technician.id && item.status !== "done",
      ).length;
      const suggested = suggestSlot({
        technicianJobs: jobs.filter(
          (item) => item.technicianId === technician.id && item.id !== job.id,
        ),
        durationMinutes: job.durationMinutes,
        day: new Date(),
        existingStart: job.scheduledStart,
      });
      return {
        technician,
        load,
        suggested,
        matches: Number(technician.skills.includes(job.category)),
      };
    })
    .sort(
      (first, second) =>
        second.matches - first.matches ||
        first.load - second.load ||
        first.technician.name.localeCompare(second.technician.name),
    );
}
