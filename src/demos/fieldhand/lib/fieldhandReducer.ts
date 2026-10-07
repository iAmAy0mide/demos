import type { FieldhandData, FieldhandFilters, JobStatus, ThemeMode } from "@/src/demos/fieldhand/types";

export type FieldhandState = FieldhandData & {
  filters: FieldhandFilters;
  themeMode: ThemeMode;
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
  isLoaded: false,
};

export type FieldhandAction =
  | { type: "hydrate"; payload: FieldhandData & { themeMode: ThemeMode } }
  | { type: "move_job"; jobId: string; status: JobStatus; technicianId: string | null }
  | { type: "set_filters"; filters: Partial<FieldhandFilters> }
  | { type: "set_theme"; themeMode: ThemeMode }
  | { type: "reset"; payload: FieldhandData };

export function fieldhandReducer(state: FieldhandState, action: FieldhandAction): FieldhandState {
  switch (action.type) {
    case "hydrate":
      return { ...action.payload, filters: defaultFilters, isLoaded: true };
    case "move_job":
      return {
        ...state,
        jobs: state.jobs.map((job) =>
          job.id === action.jobId
            ? { ...job, status: action.status, technicianId: action.technicianId ?? job.technicianId }
            : job,
        ),
      };
    case "set_filters":
      return { ...state, filters: { ...state.filters, ...action.filters } };
    case "set_theme":
      return { ...state, themeMode: action.themeMode };
    case "reset":
      return { ...action.payload, filters: defaultFilters, themeMode: state.themeMode, isLoaded: true };
  }
}
