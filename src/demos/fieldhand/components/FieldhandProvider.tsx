"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

import { createSeedData } from "@/src/demos/fieldhand/data/seedData";
import { fieldhandReducer, initialFieldhandState } from "@/src/demos/fieldhand/lib/fieldhandReducer";
import { readPersistedFieldhandState, savePersistedFieldhandState } from "@/src/demos/fieldhand/lib/persistence";
import type { FieldhandFilters, Job, JobStatus, ThemeMode } from "@/src/demos/fieldhand/types";
import type { FieldhandState } from "@/src/demos/fieldhand/lib/fieldhandReducer";

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

  useEffect(() => {
    const seedData = createSeedData(new Date());
    const persistedState = readPersistedFieldhandState();
    dispatch({ type: "hydrate", payload: persistedState ?? { ...seedData, themeMode: "system" } });
  }, []);

  useEffect(() => {
    if (!state.isLoaded) return;
    savePersistedFieldhandState({
      customers: state.customers,
      technicians: state.technicians,
      jobs: state.jobs,
      quotes: state.quotes,
      themeMode: state.themeMode,
    });
  }, [state]);

  return { state, dispatch };
}

type FieldhandProviderProps = Readonly<{ children: React.ReactNode }>;

export function FieldhandProvider({ children }: FieldhandProviderProps) {
  const { state, dispatch } = useFieldhandState();
  const contextValue = useMemo<FieldhandContextValue>(
    () => ({
      state,
      moveJob: (jobId, status, technicianId) => dispatch({ type: "move_job", jobId, status, technicianId: technicianId ?? null }),
      createJob: (job) => dispatch({ type: "create_job", job }),
      updateNotes: (jobId, notes) => dispatch({ type: "update_notes", jobId, notes }),
      setFilters: (filters) => dispatch({ type: "set_filters", filters }),
      setThemeMode: (themeMode) => dispatch({ type: "set_theme", themeMode }),
      resetDemo: () => dispatch({ type: "reset", payload: createSeedData(new Date()) }),
      simulateLiveUpdate: () => dispatch({ type: "live_update" }),
      dismissToast: (toastId) => dispatch({ type: "dismiss_toast", toastId }),
    }),
    [dispatch, state],
  );

  return <FieldhandContext.Provider value={contextValue}>{children}</FieldhandContext.Provider>;
}

export function useFieldhand() {
  const contextValue = useContext(FieldhandContext);
  if (!contextValue) throw new Error("useFieldhand must be used within FieldhandProvider.");
  return contextValue;
}
