"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { seedRentbookData } from "../data/seedData";
import { initialRentbookState, rentbookReducer } from "../lib/rentbookReducer";
import type { RentbookData } from "../types";

const STORAGE_KEY = "rentbook-data";
const RentbookContext = createContext<ReturnType<typeof useRentbookState> | null>(null);
function isData(value: unknown): value is RentbookData { return typeof value === "object" && value !== null && ["properties", "units", "tenants", "leases", "charges", "payments", "maintenance", "activity"].every((key) => Array.isArray((value as Record<string, unknown>)[key])); }
function useRentbookState() { const [state, dispatch] = useReducer(rentbookReducer, initialRentbookState); useEffect(() => { try { const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as unknown; dispatch({ type: "hydrate", payload: isData(saved) ? saved : seedRentbookData }); } catch { dispatch({ type: "hydrate", payload: seedRentbookData }); } }, []); useEffect(() => { if (state.isLoaded) localStorage.setItem(STORAGE_KEY, JSON.stringify({ properties: state.properties, units: state.units, tenants: state.tenants, leases: state.leases, charges: state.charges, payments: state.payments, maintenance: state.maintenance, activity: state.activity })); }, [state]); return useMemo(() => ({ state, dispatch }), [state]); }
export function RentbookProvider({ children }: { children: React.ReactNode }) { const value = useRentbookState(); return <RentbookContext.Provider value={value}>{children}</RentbookContext.Provider>; }
export function useRentbook() { const context = useContext(RentbookContext); if (!context) throw new Error("useRentbook must be used inside RentbookProvider"); return context; }
