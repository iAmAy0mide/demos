import type { FieldhandData, FieldhandFilters, Job, JobStatus, ThemeMode } from "@/src/demos/fieldhand/types";

export type FieldhandState = FieldhandData & {
  filters: FieldhandFilters;
  themeMode: ThemeMode;
  toast: string | null;
  isLoaded: boolean;
};

export const defaultFilters: FieldhandFilters = {
  technicianId: "all",
  priority: "all",
  status: "all",
  area: "all",
};

export const initialFieldhandState: FieldhandState = {
  customers: [],
  technicians: [],
  jobs: [],
  quotes: [],
  filters: defaultFilters,
  themeMode: "system",
  toast: null,
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
  | { type: "live_update" };

export function fieldhandReducer(state: FieldhandState, action: FieldhandAction): FieldhandState {
  switch (action.type) {
    case "hydrate":
      return { ...action.payload, filters: defaultFilters, isLoaded: true, toast: null };
    case "move_job":
      return {
        ...state,
        jobs: state.jobs.map((job) =>
          job.id === action.jobId
            ? { ...job, status: action.status, technicianId: action.technicianId ?? job.technicianId }
            : job,
        ),
      };
    case "create_job":
      return { ...state, jobs: [action.job, ...state.jobs], toast: `${action.job.id} created and ready to dispatch.` };
    case "set_filters":
      return { ...state, filters: { ...state.filters, ...action.filters } };
    case "update_notes":
      return { ...state, jobs: state.jobs.map((job) => job.id === action.jobId ? { ...job, notes: action.notes } : job) };
    case "set_theme":
      return { ...state, themeMode: action.themeMode };
    case "reset":
      return { ...action.payload, filters: defaultFilters, themeMode: state.themeMode, isLoaded: true, toast: "Demo data restored." };
    case "live_update":
      return { ...state, jobs: state.jobs.map((job) => job.id === "VL-1039" ? { ...job, status: "on_site" } : job), toast: "Ade has arrived at VL-1039." };
  }
}
