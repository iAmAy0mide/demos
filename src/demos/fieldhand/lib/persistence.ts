import type { FieldhandData, ThemeMode } from "@/src/demos/fieldhand/types";

export const FIELDHAND_STORAGE_KEY = "axmion-fieldhand-state";

export type PersistedFieldhandState = FieldhandData & { themeMode: ThemeMode };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

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

export function readPersistedFieldhandState() {
  const rawState = window.localStorage.getItem(FIELDHAND_STORAGE_KEY);
  if (!rawState) return null;

  try {
    const parsedState: unknown = JSON.parse(rawState);
    return isPersistedFieldhandState(parsedState) ? parsedState : null;
  } catch {
    return null;
  }
}

export function savePersistedFieldhandState(state: PersistedFieldhandState) {
  window.localStorage.setItem(FIELDHAND_STORAGE_KEY, JSON.stringify(state));
}
