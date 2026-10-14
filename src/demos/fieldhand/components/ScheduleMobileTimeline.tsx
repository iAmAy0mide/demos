import type { Job, Technician } from "@/src/demos/fieldhand/types";
import { lagosHour } from "@/src/shared/lib/lagos-time";

type ScheduleMobileTimelineProps = {
  technicians: Technician[];
  selectedTechnician: Technician;
  scheduledJobs: Job[];
  onTechnicianChange: (technicianId: string) => void;
  onJobOpen: (jobId: string) => void;
};

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16];

export function ScheduleMobileTimeline({
  technicians,
  selectedTechnician,
  scheduledJobs,
  onTechnicianChange,
  onJobOpen,
}: ScheduleMobileTimelineProps) {
  return (
    <section className="mt-4 md:hidden" aria-label="Technician day timeline">
      <TechnicianChips
        technicians={technicians}
        selectedTechnician={selectedTechnician}
        onTechnicianChange={onTechnicianChange}
      />
      {HOURS.map((hour) => (
        <MobileTimelineHour key={hour} hour={hour} jobs={scheduledJobs} onJobOpen={onJobOpen} />
      ))}
    </section>
  );
}

function TechnicianChips({
  technicians,
  selectedTechnician,
  onTechnicianChange,
}: Pick<ScheduleMobileTimelineProps, "technicians" | "selectedTechnician" | "onTechnicianChange">) {
  return (
    <div
      data-scroll-x="intentional"
      className="relative -mx-3 flex snap-x gap-2 overflow-x-auto px-3 pb-3 after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-8 after:bg-linear-to-l after:from-[var(--fld-canvas)] after:to-transparent"
    >
      {technicians.map((technician) => (
        <button
          key={technician.id}
          data-testid={`technician-chip-${technician.id}`}
          type="button"
          onClick={() => onTechnicianChange(technician.id)}
          className={`min-h-11 shrink-0 snap-start rounded-full border px-3 text-sm ${selectedTechnician.id === technician.id ? "border-[var(--fld-signal)] text-[var(--fld-signal)]" : "border-[var(--fld-line)]"}`}
        >
          {technician.initials} {technician.name.split(" ")[0]}
        </button>
      ))}
    </div>
  );
}

function MobileTimelineHour({
  hour,
  jobs,
  onJobOpen,
}: {
  hour: number;
  jobs: Job[];
  onJobOpen: (jobId: string) => void;
}) {
  const hourlyJobs = jobs.filter(
    (job) => lagosHour(new Date(job.scheduledStart as string)) === hour,
  );
  return (
    <div className="grid min-h-16 min-w-0 grid-cols-[3rem_minmax(0,1fr)] border-t border-[var(--fld-line)] py-2">
      <span className="font-mono text-xs text-[var(--fld-muted)]">{hour}:00</span>
      <div className="min-w-0 space-y-1">
        {hourlyJobs.map((job) => (
          <button
            key={job.id}
            data-testid={`schedule-block-${job.id}`}
            type="button"
            aria-label={`Open ${job.id}: ${job.title}`}
            onClick={() => onJobOpen(job.id)}
            className="min-w-0 border border-[var(--fld-line)] bg-[var(--fld-raised)] p-2 text-left text-sm hover:border-[var(--fld-signal)] focus-visible:ring-2 focus-visible:ring-[var(--fld-signal)] focus-visible:outline-none"
          >
            <span className="font-mono text-xs text-[var(--fld-signal)]">{job.id}</span>
            <br />
            <span className="mt-0.5 block break-words">{job.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
