"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";

import { useLagosNow } from "@/src/shared/lib/useLagosNow";

import { createSeedRentbookData } from "../data/seedData";
import { initialRentbookState, rentbookReducer } from "../lib/rentbookReducer";

import type { RentbookData } from "../types";

const STORAGE_KEY = "rentbook-data";
const RentbookContext = createContext<ReturnType<typeof useRentbookState> | null>(null);

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

function persistedData(state: typeof initialRentbookState): RentbookData {
  const { properties, units, tenants, leases, charges, payments, maintenance, activity } = state;
  return { properties, units, tenants, leases, charges, payments, maintenance, activity };
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
      dispatch({ type: "hydrate", payload: isData(saved) ? saved : seed });
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
