import type { FieldhandData, FieldhandFilters, Job, JobStatus, ThemeMode, Toast } from "@/src/demos/fieldhand/types";

export type FieldhandState = FieldhandData & {
  filters: FieldhandFilters;
  themeMode: ThemeMode;
  toasts: Toast[];
  isLoaded: boolean;
};

export const defaultFilters: FieldhandFilters = {
  technicianId: "all",
  priority: "all",
  status: "all",
  area: "all",
  category: "all",
};

export const initialFieldhandState: FieldhandState = {
  customers: [],
  technicians: [],
  jobs: [],
  quotes: [],
  filters: defaultFilters,
  themeMode: "system",
  toasts: [],
  isLoaded: false,
};

export type FieldhandAction =
  | { type: "hydrate"; payload: FieldhandData & { themeMode: ThemeMode } }
  | { type: "move_job"; jobId: string; status: JobStatus; technicianId: string | null }
  | { type: "create_job"; job: Job }
  | { type: "update_notes"; jobId: string; notes: string }
  | { type: "set_filters"; filters: Partial<FieldhandFilters> }
  | { type: "set_theme"; themeMode: ThemeMode }
  | { type: "reset"; payload: FieldhandData }
  | { type: "live_update"; incomingJob: Job }
  | { type: "dismiss_toast"; toastId: string };

const ASSIGNMENT_REQUIRED_STATUSES: JobStatus[] = ["scheduled", "en_route", "on_site", "done"];

function requiresTechnician(status: JobStatus) {
  return ASSIGNMENT_REQUIRED_STATUSES.includes(status);
}

function addToast(state: FieldhandState, message: string): FieldhandState {
  const toast = { id: `${Date.now()}-${message}`, message };
  return { ...state, toasts: [...state.toasts, toast].slice(-3) };
}

export function fieldhandReducer(state: FieldhandState, action: FieldhandAction): FieldhandState {
  switch (action.type) {
    case "hydrate":
      return { ...action.payload, filters: defaultFilters, isLoaded: true, toasts: [] };
    case "move_job":
      return {
        ...state,
        jobs: state.jobs.map((job) =>
          job.id !== action.jobId ? job : (() => {
            const technicianId = action.technicianId ?? job.technicianId;
            // Dispatch rule: travel, site work, and completion always have an accountable technician.
            if (requiresTechnician(action.status) && !technicianId) return job;
            return { ...job, status: action.status, technicianId };
          })(),
        ),
      };
    case "create_job":
      return addToast({ ...state, jobs: [action.job, ...state.jobs] }, `${action.job.id} created and ready to dispatch.`);
    case "set_filters":
      return { ...state, filters: { ...state.filters, ...action.filters } };
    case "update_notes":
      return { ...state, jobs: state.jobs.map((job) => job.id === action.jobId ? { ...job, notes: action.notes } : job) };
    case "set_theme":
      return { ...state, themeMode: action.themeMode };
    case "reset":
      return addToast({ ...action.payload, filters: defaultFilters, themeMode: state.themeMode, isLoaded: true, toasts: [] }, "Demo data restored.");
    case "live_update":
      return addToast({ ...state, jobs: [action.incomingJob, ...state.jobs.map((job) => job.id === "VL-1039" && job.technicianId ? { ...job, status: "on_site" as const } : job)] }, `${action.incomingJob.id} received from service desk.`);
    case "dismiss_toast":
      return { ...state, toasts: state.toasts.filter((toast) => toast.id !== action.toastId) };
  }
}
