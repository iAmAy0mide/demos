"use client";

import { AlertTriangle, Bolt, Ellipsis, MapPin, Plus, Snowflake, Sun, Wrench } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AssignPicker } from "@/src/demos/fieldhand/components/AssignPicker";
import { useFieldhand } from "@/src/demos/fieldhand/components/FieldhandProvider";
import { PhoneDispatchSheets } from "@/src/demos/fieldhand/components/PhoneDispatchSheets";
import {
  countJobsForStatus,
  filterJobs,
  findSchedulingConflicts,
} from "@/src/demos/fieldhand/lib/jobUtils";
import type { Job, JobStatus, ServiceCategory } from "@/src/demos/fieldhand/types";
import { formatLagosLongDate, formatLagosTime } from "@/src/shared/lib/lagos-time";
import { useDismissibleLayer } from "@/src/shared/lib/useDismissibleLayer";
import { useLagosNow } from "@/src/shared/lib/useLagosNow";

const boardColumns: { status: JobStatus; label: string }[] = [
  { status: "unassigned", label: "Unassigned" },
  { status: "scheduled", label: "Scheduled" },
  { status: "en_route", label: "En route" },
  { status: "on_site", label: "On site" },
  { status: "done", label: "Done" },
];
const TECHNICIAN_REQUIRED: JobStatus[] = ["scheduled", "en_route", "on_site", "done"];
const categoryIcons: Record<ServiceCategory, typeof Bolt> = {
  generator: Wrench,
  ac: Snowflake,
  solar: Sun,
  electrical: Bolt,
};
const technicianHues: Record<string, string> = {
  "tech-ade": "bg-sky-700",
  "tech-ngozi": "bg-violet-700",
  "tech-tobi": "bg-amber-700",
  "tech-sade": "bg-emerald-700",
  "tech-ibrahim": "bg-rose-700",
  "tech-chioma": "bg-cyan-700",
};

function formatTime(value: string | null) {
  return value ? formatLagosTime(new Date(value)) : "Unscheduled";
}
function requiresTechnician(status: JobStatus) {
  return TECHNICIAN_REQUIRED.includes(status);
}

type JobCardProps = {
  job: Job;
  menuId: string;
  isMenuOpen: boolean;
  onAssign: (job: Job) => void;
  onCloseMenu: () => void;
  onMove: (job: Job, status: JobStatus) => void;
  onToggleMenu: (jobId: string) => void;
};

function JobCard({
  job,
  menuId,
  isMenuOpen,
  onAssign,
  onCloseMenu,
  onMove,
  onToggleMenu,
}: JobCardProps) {
  const { state } = useFieldhand();
  const menuRef = useRef<HTMLDivElement>(null);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const technician = state.technicians.find((item) => item.id === job.technicianId);
  const Icon = categoryIcons[job.category];
  const priorityTone = getPriorityTone(job.priority);
  useDismissibleLayer({
    isOpen: isMenuOpen,
    onDismiss: onCloseMenu,
    layerRef: menuRef,
    triggerRef: menuTriggerRef,
  });
  return (
    <article
      draggable
      data-testid={`job-card-${job.id}`}
      onDragStart={(event) => {
        onCloseMenu();
        event.dataTransfer.setData("text/plain", job.id);
      }}
      className="group relative border border-[var(--fld-line)] bg-[var(--fld-raised)] p-3 shadow-[0_1px_0_rgba(0,0,0,.16)]"
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${priorityTone}`} aria-hidden="true" />
      <div className="flex items-start justify-between gap-2 pl-1">
        <span className="font-mono text-[11px] text-[var(--fld-muted)]">{job.id}</span>
        <div className="ml-auto flex items-center gap-1">
          {(job.priority === "urgent" || job.priority === "high") && (
            <AlertTriangle
              size={15}
              className={job.priority === "urgent" ? "text-red-400" : "text-amber-400"}
              aria-label={`${job.priority} priority`}
            />
          )}
          <div className="relative">
            <button
              ref={menuTriggerRef}
              data-testid={`job-card-menu-${job.id}`}
              className="grid size-8 place-items-center rounded hover:bg-[var(--fld-hover)]"
              type="button"
              onClick={() => onToggleMenu(menuId)}
              aria-label={`Actions for ${job.id}`}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
            >
              <Ellipsis size={16} />
            </button>
            {isMenuOpen && (
              <div
                ref={menuRef}
                data-testid="job-menu"
                className="absolute top-8 right-0 z-20 w-36 border border-[var(--fld-line)] bg-[var(--fld-panel)] py-1 shadow-xl"
                role="menu"
                onKeyDown={(event) => {
                  const items = Array.from(
                    event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'),
                  );
                  const currentIndex = items.indexOf(document.activeElement as HTMLElement);
                  if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                    event.preventDefault();
                    const offset = event.key === "ArrowDown" ? 1 : -1;
                    items[(currentIndex + offset + items.length) % items.length]?.focus();
                  }
                }}
              >
                <Link
                  data-testid="job-menu-item-open"
                  href={`/work/fieldhand?job=${job.id}`}
                  className="block px-3 py-2 text-sm hover:bg-[var(--fld-hover)]"
                  role="menuitem"
                  onClick={onCloseMenu}
                >
                  Open
                </Link>
                {(!job.technicianId || job.status !== "done") && (
                  <button
                    data-testid="job-menu-item-assign"
                    type="button"
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-[var(--fld-hover)]"
                    role="menuitem"
                    onClick={() => {
                      onCloseMenu();
                      onAssign(job);
                    }}
                  >
                    Assign to...
                  </button>
                )}
                {boardColumns
                  .filter((column) => column.status !== job.status)
                  .map((column) => (
                    <button
                      data-testid={`job-menu-item-move-to-${column.status}`}
                      key={column.status}
                      type="button"
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-[var(--fld-hover)]"
                      role="menuitem"
                      onClick={() => {
                        onMove(job, column.status);
                        onCloseMenu();
                      }}
                    >
                      Move to {column.label}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <h3 className="mt-1 pl-1 text-sm leading-5 font-medium">
        <Link href={`/work/fieldhand?job=${job.id}`} className="hover:text-[var(--fld-signal)]">
          {job.title}
        </Link>
      </h3>
      <div className="mt-2 flex items-center gap-2 pl-1 text-xs text-[var(--fld-muted)]">
        <Icon size={14} aria-hidden="true" />
        <MapPin size={13} aria-hidden="true" />
        <span>{job.area}</span>
        <span className="ml-auto font-mono">{formatTime(job.scheduledStart)}</span>
      </div>
      <div className="mt-3 flex items-center justify-between pl-1 text-xs">
        {technician ? (
          <span className="flex items-center gap-2">
            <span
              className={`grid size-7 place-items-center rounded-full text-[10px] font-semibold text-white ${technicianHues[technician.id]}`}
            >
              {technician.initials}
            </span>
            {technician.name.split(" ")[0]}
          </span>
        ) : (
          <button
            data-testid={`job-card-assign-${job.id}`}
            type="button"
            className="flex items-center gap-2 text-[var(--fld-signal)] hover:underline"
            onClick={() => onAssign(job)}
          >
            <span className="grid size-7 place-items-center rounded-full border border-dashed border-[var(--fld-signal)]">
              +
            </span>
            Assign
          </button>
        )}
      </div>
    </article>
  );
}

function getPriorityTone(priority: Job["priority"]) {
  if (priority === "urgent") {
    return "bg-red-500";
  }
  if (priority === "high") {
    return "bg-amber-500";
  }
  return "bg-transparent";
}

function CreateJobDialog({ onClose }: { onClose: () => void }) {
  const { state, createJob } = useFieldhand();
  const [title, setTitle] = useState("");
  const [area, setArea] = useState<Job["area"]>("Lekki");
  const [category, setCategory] = useState<ServiceCategory>("electrical");
  const canCreate = title.trim().length >= 4;
  const create = () => {
    if (!canCreate) {
      return;
    }
    createJob({
      id: `VL-${1050 + state.jobs.length}`,
      title: title.trim(),
      customerId: "cus-001",
      address: "Dispatch intake",
      area,
      category,
      priority: "normal",
      status: "unassigned",
      technicianId: null,
      scheduledStart: null,
      durationMinutes: 90,
      notes: "Created from the dispatch board.",
      activity: [],
      quoteId: null,
    });
    onClose();
  };
  return (
    <div
      data-testid="create-job-dialog"
      className="fixed inset-0 z-[70] grid place-items-center bg-[var(--fld-backdrop)] p-4 backdrop-blur-sm max-md:p-0"
      role="presentation"
    >
      <form
        className="w-full max-w-md border border-[var(--fld-border-strong)] bg-[var(--fld-surface-overlay)] p-5 shadow-[var(--fld-shadow-overlay)] max-md:max-w-none max-md:self-stretch max-md:overflow-y-auto max-md:pt-10"
        onSubmit={(event) => {
          event.preventDefault();
          create();
        }}
      >
        <h2 className="text-lg font-semibold">Create job</h2>
        <p className="mt-1 text-sm text-[var(--fld-muted)]">
          Log an intake for dispatch. It will start unassigned.
        </p>
        <label className="mt-5 block text-sm" htmlFor="job-title">
          What needs attention?
        </label>
        <input
          id="job-title"
          autoFocus
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-2 h-11 w-full border border-[var(--fld-line)] bg-[var(--fld-raised)] px-3 text-sm focus:outline-none"
          placeholder="e.g. Inverter fault investigation"
        />
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="text-sm">
            Area
            <select
              value={area}
              onChange={(event) => setArea(event.target.value as Job["area"])}
              className="mt-1 h-10 w-full border border-[var(--fld-line)] bg-[var(--fld-raised)] px-2 text-sm"
            >
              <option>Lekki</option>
              <option>Ikeja</option>
              <option>Yaba</option>
              <option>Surulere</option>
              <option>Victoria Island</option>
              <option>Ajah</option>
            </select>
          </label>
          <label className="text-sm">
            Service
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as ServiceCategory)}
              className="mt-1 h-10 w-full border border-[var(--fld-line)] bg-[var(--fld-raised)] px-2 text-sm"
            >
              <option value="electrical">Electrical</option>
              <option value="generator">Generator</option>
              <option value="ac">Air conditioning</option>
              <option value="solar">Solar</option>
            </select>
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button className="min-h-10 px-3 text-sm" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="min-h-10 bg-[var(--fld-signal)] px-3 text-sm font-medium text-white disabled:opacity-50"
            type="submit"
            disabled={!canCreate}
          >
            Create job
          </button>
        </div>
      </form>
    </div>
  );
}

export function DispatchBoard() {
  const { state, moveJob, setFilters } = useFieldhand();
  const router = useRouter();
  const now = useLagosNow();
  const [isCreating, setIsCreating] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [openMenuJobId, setOpenMenuJobId] = useState<string | null>(null);
  const [assignmentRequest, setAssignmentRequest] = useState<{
    job: Job;
    status?: JobStatus;
  } | null>(null);
  const [phoneStatus, setPhoneStatus] = useState<JobStatus>("unassigned");
  const dateLabel = now ? formatLagosLongDate(now) : "Lagos operations";
  useEffect(() => {
    const openCreate = () => setIsCreating(true);
    window.addEventListener("fieldhand:create-job", openCreate);
    return () => window.removeEventListener("fieldhand:create-job", openCreate);
  }, []);
  if (!state.isLoaded) {
    return (
      <main className="grid h-full place-items-center text-sm text-[var(--fld-muted)]">
        Loading dispatch board…
      </main>
    );
  }
  const filteredJobs = filterJobs(state.jobs, state.filters);
  const conflicts = findSchedulingConflicts(state.jobs, "tech-ade");
  const move = (job: Job, status: JobStatus) => {
    if (requiresTechnician(status) && !job.technicianId) {
      setAssignmentRequest({ job, status });
      return;
    }
    moveJob(job.id, status);
  };
  const openAssignmentPicker = (job: Job) => setAssignmentRequest({ job });
  const closeMenu = () => setOpenMenuJobId(null);
  const savedViews = [
    { label: "All", filters: {} },
    { label: "Urgent", filters: { priority: "urgent" as const } },
    { label: "Unassigned", filters: { status: "unassigned" as const } },
    { label: "Lekki", filters: { area: "Lekki" as const } },
  ];
  return (
    <main
      className="grid h-full min-h-0 min-w-0 grid-rows-[auto_auto_auto_minmax(0,1fr)] overflow-hidden max-[560px]:h-auto max-[560px]:overflow-visible"
      data-testid="board"
    >
      <header className="flex min-h-14 min-w-0 items-center justify-between gap-2 px-3 pt-2 md:gap-3 md:px-6">
        <div className="min-w-0">
          <p className="font-mono text-xs text-[var(--fld-muted)] md:hidden">Thu 8 Oct</p>
          <h1 className="text-xl font-semibold tracking-[-.04em]">
            Dispatch board
            <span className="ml-2 hidden font-mono text-xs font-normal text-[var(--fld-muted)] md:inline">
              {dateLabel}
            </span>
          </h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="inline-flex min-h-11 items-center gap-1 border border-red-500/50 bg-red-500/10 px-2 text-xs md:min-h-0 md:py-1"
            onClick={() => setIsAlertsOpen(true)}
          >
            <AlertTriangle size={13} />
            <span className="md:hidden">2 need attention</span>
            <span className="hidden md:inline">Urgent</span>
          </button>
          <button
            data-testid="new-job-button"
            type="button"
            className="hidden items-center gap-1 border border-amber-500/50 bg-amber-500/10 px-2 py-1 text-xs md:inline-flex"
            onClick={() => setFilters({ technicianId: "tech-ade" })}
          >
            <AlertTriangle size={13} />
            {conflicts.length} conflict
          </button>
          <button
            type="button"
            className="hidden min-h-9 items-center gap-2 bg-[var(--fld-signal)] px-3 text-sm font-medium text-white md:inline-flex"
            onClick={() => setIsCreating(true)}
          >
            <Plus size={16} />
            New job
          </button>
        </div>
      </header>
      <section
        className="mx-3 flex min-w-0 snap-x gap-0 overflow-x-auto border-y border-[var(--fld-line)] text-sm md:mx-6 md:grid md:grid-cols-4"
        aria-label="Today’s operations"
      >
        {[
          ["Jobs today", state.jobs.length],
          ["On-time rate", "94%"],
          ["Unassigned", countJobsForStatus(state.jobs, "unassigned")],
          ["Revenue today", "₦418k"],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            data-testid={`stat-${String(label).toLowerCase().replaceAll(" ", "-").replace("on-time-rate", "on-time").replace("revenue-today", "revenue")}`}
            className="flex shrink-0 snap-start items-baseline gap-2 border-r border-[var(--fld-line)] px-2 py-1.5 last:border-r-0 md:shrink"
          >
            <span className="text-xs text-[var(--fld-muted)]">{label}</span>
            <span className="font-mono text-sm tabular-nums">{value}</span>
          </div>
        ))}
      </section>
      <div
        className="flex min-w-0 items-center gap-1 overflow-x-auto px-3 py-2 md:px-6"
        aria-label="Saved views and filters"
      >
        {savedViews.map((view) => (
          <button
            key={view.label}
            type="button"
            className="min-h-8 shrink-0 border-b-2 border-transparent px-2 text-sm hover:border-[var(--fld-signal)] hover:text-[var(--fld-signal)]"
            onClick={() =>
              setFilters({
                technicianId: "all",
                priority: "all",
                status: "all",
                area: "all",
                category: "all",
                ...view.filters,
              })
            }
          >
            {view.label}
          </button>
        ))}
        <button
          data-testid="filters-button"
          type="button"
          className="ml-2 min-h-8 shrink-0 border border-[var(--fld-line)] px-2 text-sm"
          onClick={() => setIsFiltersOpen(true)}
        >
          Filters
        </button>
      </div>
      <section
        className="min-h-0 overflow-y-auto px-3 pb-[var(--axm-shell-clearance)] md:hidden"
        aria-label="Phone job status board"
      >
        <div
          className="sticky top-0 z-20 -mx-3 flex h-11 gap-2 overflow-x-auto border-y border-[var(--fld-line)] bg-[var(--fld-canvas)] px-3"
          role="tablist"
          aria-label="Job status"
        >
          {boardColumns.map(({ status, label }) => (
            <button
              key={status}
              data-testid={`status-tab-${status}`}
              role="tab"
              aria-selected={phoneStatus === status}
              onClick={() => setPhoneStatus(status)}
              className={`min-h-11 shrink-0 border-b-2 px-2 text-sm whitespace-nowrap ${phoneStatus === status ? "border-[var(--fld-signal)] text-[var(--fld-signal)]" : "border-transparent"}`}
            >
              {label} {countJobsForStatus(filteredJobs, status)}
            </button>
          ))}
        </div>
        <div className="space-y-2 py-2">
          {filteredJobs
            .filter((job) => job.status === phoneStatus)
            .map((job) => (
              <JobCard
                key={job.id}
                job={job}
                menuId={`phone:${job.id}`}
                isMenuOpen={openMenuJobId === `phone:${job.id}`}
                onAssign={openAssignmentPicker}
                onCloseMenu={closeMenu}
                onMove={move}
                onToggleMenu={(menuId) =>
                  setOpenMenuJobId((current) => (current === menuId ? null : menuId))
                }
              />
            ))}
          {!filteredJobs.some((job) => job.status === phoneStatus) && (
            <p className="border border-dashed border-[var(--fld-line)] p-4 text-center text-sm text-[var(--fld-muted)]">
              Nothing here yet.
            </p>
          )}
        </div>
      </section>
      <section
        className="hidden min-h-0 overflow-x-auto px-4 pb-4 md:block md:px-6"
        aria-label="Job status board"
      >
        <p className="mb-1 text-xs text-[var(--fld-muted)]">Scroll sideways to see every status</p>
        <div className="grid h-full min-w-[1160px] snap-x grid-cols-5 gap-3">
          {boardColumns.map(({ status, label }) => (
            <section
              key={status}
              data-testid={`board-column-${status}`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                const job = state.jobs.find(
                  (item) => item.id === event.dataTransfer.getData("text/plain"),
                );
                if (job) {
                  move(job, status);
                }
              }}
              className="flex min-h-0 min-w-[232px] snap-start flex-col border-t border-[var(--fld-line)]"
            >
              <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between border-b border-[var(--fld-line)] bg-[var(--fld-canvas)] py-2">
                <h2 className="flex items-center gap-2 text-sm font-medium">
                  <span className="size-2 rounded-full bg-[var(--fld-signal)]" />
                  {label}
                </h2>
                <span
                  className="font-mono text-xs text-[var(--fld-muted)]"
                  data-testid={`board-column-count-${status}`}
                >
                  {countJobsForStatus(filteredJobs, status)}
                </span>
              </header>
              <div className="min-h-0 flex-1 [scrollbar-width:thin] [scrollbar-color:var(--fld-line)_transparent] space-y-2 overflow-y-auto overscroll-contain py-2 pr-1">
                {filteredJobs
                  .filter((job) => job.status === status)
                  .map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      menuId={`desktop:${job.id}`}
                      isMenuOpen={openMenuJobId === `desktop:${job.id}`}
                      onAssign={openAssignmentPicker}
                      onCloseMenu={closeMenu}
                      onMove={move}
                      onToggleMenu={(menuId) =>
                        setOpenMenuJobId((current) => (current === menuId ? null : menuId))
                      }
                    />
                  ))}
                {!filteredJobs.some((job) => job.status === status) && (
                  <p className="border border-dashed border-[var(--fld-line)] p-4 text-center text-xs text-[var(--fld-muted)]">
                    Nothing here yet.
                  </p>
                )}
              </div>
            </section>
          ))}
        </div>
      </section>
      {isCreating && <CreateJobDialog onClose={() => setIsCreating(false)} />}
      {assignmentRequest && (
        <AssignPicker
          job={assignmentRequest.job}
          targetStatus={assignmentRequest.status}
          onClose={() => setAssignmentRequest(null)}
        />
      )}
      <PhoneDispatchSheets
        filters={state.filters}
        isAlertsOpen={isAlertsOpen}
        isFiltersOpen={isFiltersOpen}
        onClose={() => {
          setIsAlertsOpen(false);
          setIsFiltersOpen(false);
        }}
        onFiltersChange={setFilters}
        urgentJob={state.jobs.find(
          (job) => job.priority === "urgent" && job.status === "unassigned",
        )}
        conflictJob={conflicts[0]}
        onOpenJob={(job) => {
          router.push(`/work/fieldhand?job=${job.id}`);
        }}
      />
    </main>
  );
}
