"use client";

import { AlertTriangle, X } from "lucide-react";

import type { FieldhandFilters, Job } from "@/src/demos/fieldhand/types";

type PhoneDispatchSheetsProps = {
  filters: FieldhandFilters;
  isAlertsOpen: boolean;
  isFiltersOpen: boolean;
  onClose: () => void;
  onFiltersChange: (filters: Partial<FieldhandFilters>) => void;
  onOpenJob: (job: Job) => void;
  urgentJob: Job | undefined;
  conflictJob: Job | undefined;
};

const AREAS: FieldhandFilters["area"][] = [
  "all",
  "Lekki",
  "Ikeja",
  "Yaba",
  "Surulere",
  "Victoria Island",
  "Ajah",
];
const PRIORITIES: FieldhandFilters["priority"][] = ["all", "urgent", "high", "normal", "low"];
const CATEGORIES: FieldhandFilters["category"][] = [
  "all",
  "generator",
  "ac",
  "solar",
  "electrical",
];

export function PhoneDispatchSheets({
  filters,
  isAlertsOpen,
  isFiltersOpen,
  onClose,
  onFiltersChange,
  onOpenJob,
  urgentJob,
  conflictJob,
}: PhoneDispatchSheetsProps) {
  if (!isAlertsOpen && !isFiltersOpen) {
    return null;
  }
  return (
    <div
      className="fieldhand-overlay fixed inset-0 z-[90] bg-[var(--fld-backdrop)] p-3 md:hidden"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        data-testid={isFiltersOpen ? "filters-sheet" : undefined}
        className="absolute right-0 bottom-0 left-0 max-h-[82dvh] overflow-y-auto border-t border-[var(--fld-border-strong)] bg-[var(--fld-surface-overlay)] p-4 shadow-[var(--fld-shadow-overlay)]"
        role="dialog"
        aria-modal="true"
        aria-label={isAlertsOpen ? "Dispatch attention" : "Filters"}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex min-h-11 items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">{isAlertsOpen ? "Needs attention" : "Filters"}</h2>
          <button
            className="grid size-11 place-items-center"
            type="button"
            aria-label="Close"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </header>
        {isAlertsOpen ? (
          <AttentionList urgentJob={urgentJob} conflictJob={conflictJob} onOpenJob={onOpenJob} />
        ) : (
          <FilterControls filters={filters} onClose={onClose} onFiltersChange={onFiltersChange} />
        )}
      </section>
    </div>
  );
}

function AttentionList({
  urgentJob,
  conflictJob,
  onOpenJob,
}: Pick<PhoneDispatchSheetsProps, "urgentJob" | "conflictJob" | "onOpenJob">) {
  const items = [urgentJob, conflictJob].filter((job): job is Job => Boolean(job));
  return (
    <div className="mt-3 space-y-2">
      {items.map((job) => (
        <button
          key={job.id}
          type="button"
          className="flex min-h-11 w-full items-center gap-3 border border-[var(--fld-line)] p-3 text-left text-sm hover:bg-[var(--fld-hover)]"
          onClick={() => onOpenJob(job)}
        >
          <AlertTriangle className="shrink-0 text-amber-400" size={17} />
          <span className="min-w-0">
            <b className="block truncate">{job.title}</b>
            <span className="text-[var(--fld-muted)]">
              {job.id} · {job.area}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}

function FilterControls({
  filters,
  onClose,
  onFiltersChange,
}: Pick<PhoneDispatchSheetsProps, "filters" | "onClose" | "onFiltersChange">) {
  return (
    <div className="mt-3 space-y-3">
      <FilterSelect
        label="Priority"
        value={filters.priority}
        values={PRIORITIES}
        onChange={(priority) => onFiltersChange({ priority })}
      />
      <FilterSelect
        label="Area"
        value={filters.area}
        values={AREAS}
        onChange={(area) => onFiltersChange({ area })}
      />
      <FilterSelect
        label="Category"
        value={filters.category}
        values={CATEGORIES}
        onChange={(category) => onFiltersChange({ category })}
      />
      <div className="grid grid-cols-2 gap-2 pt-2">
        <button
          className="min-h-11 border border-[var(--fld-line)] text-sm"
          type="button"
          onClick={() =>
            onFiltersChange({
              technicianId: "all",
              priority: "all",
              status: "all",
              area: "all",
              category: "all",
            })
          }
        >
          Clear
        </button>
        <button
          className="min-h-11 bg-[var(--fld-signal)] text-sm font-medium text-white"
          type="button"
          onClick={onClose}
        >
          Apply filters
        </button>
      </div>
    </div>
  );
}

function FilterSelect<T extends string>({
  label,
  value,
  values,
  onChange,
}: {
  label: string;
  value: T;
  values: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="block text-sm">
      {label}
      <select
        value={value}
        className="mt-1 h-11 w-full border border-[var(--fld-line)] bg-[var(--fld-raised)] px-3"
        onChange={(event) => onChange(event.target.value as T)}
      >
        {values.map((option) => (
          <option key={option} value={option}>
            {option === "all" ? `All ${label.toLowerCase()}s` : option}
          </option>
        ))}
      </select>
    </label>
  );
}
