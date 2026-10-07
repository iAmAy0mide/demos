import type { FieldhandData, Job, JobStatus, ThemeMode } from "@/src/demos/fieldhand/types";

export const FIELDHAND_STORAGE_KEY = "axmion-fieldhand-state";

export type PersistedFieldhandState = FieldhandData & { themeMode: ThemeMode };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

const ASSIGNMENT_REQUIRED_STATUSES: JobStatus[] = ["en_route", "on_site", "done"];

function isPersistedFieldhandState(value: unknown): value is PersistedFieldhandState {
  if (!isRecord(value)) return false;
  return (
    Array.isArray(value.customers) &&
    Array.isArray(value.technicians) &&
    Array.isArray(value.jobs) &&
    Array.isArray(value.quotes) &&
    (value.themeMode === "system" || value.themeMode === "dark" || value.themeMode === "light")
  );
}

function isValidJob(job: unknown): job is Job {
  if (!isRecord(job) || typeof job.status !== "string") return false;
  const status = job.status as JobStatus;
  return !ASSIGNMENT_REQUIRED_STATUSES.includes(status) || typeof job.technicianId === "string";
}

function repairPersistedState(state: PersistedFieldhandState): PersistedFieldhandState | null {
  if (!state.jobs.every(isValidJob)) return null;
  const technicianIds = new Set(state.technicians.map((technician) => technician.id));
  const jobs = state.jobs.map((job) => {
    if (job.technicianId && !technicianIds.has(job.technicianId)) {
      return { ...job, technicianId: null, status: "unassigned" as const };
    }
    return job;
  });
  return { ...state, jobs };
}

export function readPersistedFieldhandState() {
  const rawState = window.localStorage.getItem(FIELDHAND_STORAGE_KEY);
  if (!rawState) return null;

  try {
    const parsedState: unknown = JSON.parse(rawState);
    return isPersistedFieldhandState(parsedState) ? repairPersistedState(parsedState) : null;
  } catch {
    return null;
  }
}

export function savePersistedFieldhandState(state: PersistedFieldhandState) {
  window.localStorage.setItem(FIELDHAND_STORAGE_KEY, JSON.stringify(state));
}
