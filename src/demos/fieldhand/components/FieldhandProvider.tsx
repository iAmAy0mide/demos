"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

import {
  createIncomingJob,
  createSeedData,
  MAX_UNASSIGNED_JOBS,
} from "@/src/demos/fieldhand/data/seedData";
import {
  fieldhandReducer,
  initialFieldhandState,
  type FieldhandState,
} from "@/src/demos/fieldhand/lib/fieldhandReducer";
import {
  readPersistedFieldhandState,
  savePersistedFieldhandState,
} from "@/src/demos/fieldhand/lib/persistence";
import type { FieldhandFilters, Job, JobStatus, ThemeMode } from "@/src/demos/fieldhand/types";
import { useLagosNow } from "@/src/shared/lib/useLagosNow";

type FieldhandContextValue = {
  state: FieldhandState;
  moveJob: (jobId: string, status: JobStatus, technicianId?: string | null) => void;
  createJob: (job: Job) => void;
  updateNotes: (jobId: string, notes: string) => void;
  setFilters: (filters: Partial<FieldhandFilters>) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  resetDemo: () => void;
  simulateLiveUpdate: () => void;
  dismissToast: (toastId: string) => void;
};

const FieldhandContext = createContext<FieldhandContextValue | null>(null);

function useFieldhandState() {
  const [state, dispatch] = useReducer(fieldhandReducer, initialFieldhandState);
  const now = useLagosNow();

  useEffect(() => {
    if (!now) {
      return;
    }
    const seedData = createSeedData(now);
    const persistedState = readPersistedFieldhandState();
    dispatch({ type: "hydrate", payload: persistedState ?? { ...seedData, themeMode: "system" } });
  }, [now]);

  useEffect(() => {
    if (!state.isLoaded) {
      return;
    }
    savePersistedFieldhandState({
      customers: state.customers,
      technicians: state.technicians,
      jobs: state.jobs,
      quotes: state.quotes,
      themeMode: state.themeMode,
    });
  }, [state]);

  return { state, dispatch, now };
}

type FieldhandProviderProps = Readonly<{ children: React.ReactNode }>;

export function FieldhandProvider({ children }: FieldhandProviderProps) {
  const { state, dispatch, now } = useFieldhandState();
  const contextValue = useMemo<FieldhandContextValue>(
    () => ({
      state,
      moveJob: (jobId, status, technicianId) =>
        dispatch({ type: "move_job", jobId, status, technicianId: technicianId ?? null }),
      createJob: (job) => dispatch({ type: "create_job", job }),
      updateNotes: (jobId, notes) => dispatch({ type: "update_notes", jobId, notes }),
      setFilters: (filters) => dispatch({ type: "set_filters", filters }),
      setThemeMode: (themeMode) => dispatch({ type: "set_theme", themeMode }),
      resetDemo: () => now && dispatch({ type: "reset", payload: createSeedData(now) }),
      simulateLiveUpdate: () => {
        const unassigned = state.jobs.filter((job) => job.status === "unassigned").length;
        const openTitles = state.jobs
          .filter((job) => job.status !== "done")
          .map((job) => job.title);
        const incomingJobs = state.jobs.filter(
          (job) =>
            job.id.startsWith("VL-10") &&
            job.activity.some((entry) => entry.message === "New job received from service desk."),
        ).length;
        const incomingJob =
          !now || unassigned >= MAX_UNASSIGNED_JOBS
            ? null
            : createIncomingJob(now, incomingJobs, openTitles);
        if (incomingJob) {
          dispatch({ type: "live_update", incomingJob });
        }
      },
      dismissToast: (toastId) => dispatch({ type: "dismiss_toast", toastId }),
    }),
    [dispatch, now, state],
  );

  return <FieldhandContext.Provider value={contextValue}>{children}</FieldhandContext.Provider>;
}

export function useFieldhand() {
  const contextValue = useContext(FieldhandContext);
  if (!contextValue) {
    throw new Error("useFieldhand must be used within FieldhandProvider.");
  }
  return contextValue;
}
