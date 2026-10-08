"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

import { useLagosNow } from "@/src/shared/lib/useLagosNow";

import { createSeedRentbookData } from "../data/seedData";
import { initialRentbookState, rentbookReducer } from "../lib/rentbookReducer";

import type { RentbookData } from "../types";

const STORAGE_KEY = "rentbook-data";
export const RENTBOOK_SCHEMA_VERSION = 2;
const RentbookContext = createContext<ReturnType<typeof useRentbookState> | null>(null);

type PersistedRentbook = {
  version: number;
  data: RentbookData;
  selectedPropertyId: string | "all";
};

function isData(value: unknown): value is RentbookData {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  return [
    "properties",
    "units",
    "tenants",
    "leases",
    "charges",
    "payments",
    "maintenance",
    "activity",
  ].every((key) => Array.isArray((value as Record<string, unknown>)[key]));
}

function persistedData(state: typeof initialRentbookState): PersistedRentbook {
  const { properties, units, tenants, leases, charges, payments, maintenance, activity } = state;
  return {
    version: RENTBOOK_SCHEMA_VERSION,
    data: { properties, units, tenants, leases, charges, payments, maintenance, activity },
    selectedPropertyId: state.selectedPropertyId,
  };
}

function isPersistedRentbook(value: unknown): value is PersistedRentbook {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const entry = value as Record<string, unknown>;
  return (
    entry.version === RENTBOOK_SCHEMA_VERSION &&
    isData(entry.data) &&
    (entry.selectedPropertyId === "all" || typeof entry.selectedPropertyId === "string")
  );
}

function useRentbookState() {
  const [state, dispatch] = useReducer(rentbookReducer, initialRentbookState);
  const now = useLagosNow();

  useEffect(() => {
    if (!now) {
      return;
    }
    const seed = createSeedRentbookData(now);
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as unknown;
      if (!isPersistedRentbook(saved)) {
        dispatch({ type: "hydrate", payload: seed });
        return;
      }
      const selectedPropertyId = saved.selectedPropertyId;
      const isValidProperty =
        selectedPropertyId === "all" ||
        saved.data.properties.some((property) => property.id === selectedPropertyId);
      dispatch({
        type: "hydrate",
        payload: saved.data,
        selectedPropertyId: isValidProperty ? selectedPropertyId : "all",
      });
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      dispatch({ type: "hydrate", payload: seed });
    }
  }, [now]);

  useEffect(() => {
    if (state.isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedData(state)));
    }
  }, [state]);

  return useMemo(() => ({ state, dispatch }), [state]);
}

export function RentbookProvider({ children }: { children: React.ReactNode }) {
  const value = useRentbookState();
  return <RentbookContext.Provider value={value}>{children}</RentbookContext.Provider>;
}

export function useRentbook() {
  const context = useContext(RentbookContext);
  if (!context) {
    throw new Error("useRentbook must be used inside RentbookProvider");
  }
  return context;
}
