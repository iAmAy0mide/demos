import { BATTERY_COST_PER_KWH, INSTALLATION_RATE, MAINTENANCE_RATE, MAX_MONTHLY_SPEND, MIN_MONTHLY_SPEND, PANEL_WATTAGE, SYSTEM_COST_PER_KVA } from "@/src/demos/sunreach/lib/constants";
import type { CalculatorInput, SolarEstimate } from "@/src/demos/sunreach/types";
const LOAD = { home: 2.5, shop: 3.5, office: 5, factory: 8 } as const;
const POWER = { home: "fridge, TV, lights, fans and laptop", shop: "POS, lights, fans, fridge and CCTV", office: "workstations, lights, internet and AC", factory: "essential production loads and office equipment" } as const;
/** This conservative model sizes for outage-led essential loads, then bounds savings so small bills are never promised an implausible return. */
export function calculateSolarEstimate(input: CalculatorInput): SolarEstimate {
  const spend = Math.max(MIN_MONTHLY_SPEND, Math.min(MAX_MONTHLY_SPEND, input.monthlySpend)); const outage = input.outageHours / 20; const backup = input.backupType === "diesel" ? .78 : input.backupType === "petrol" ? .72 : input.backupType === "inverter" ? .46 : .28;
  const inverterKva = Math.max(1.5, Math.min(12, Math.ceil((LOAD[input.propertyType] + outage * 3) / .5) * .5)); const batteryKwh = Math.max(2.5, Math.min(30, Math.ceil((inverterKva * Math.max(2, input.outageHours) * .55) / 2.5) * 2.5)); const panelCount = Math.max(4, Math.ceil((inverterKva * 1000 * 1.35) / PANEL_WATTAGE));
  const coverage = Math.min(.86, .28 + outage * .38 + backup * .24); const monthlySaving = Math.max(0, Math.round(spend * coverage * (1 - MAINTENANCE_RATE))); const totalCost = (inverterKva * SYSTEM_COST_PER_KVA + batteryKwh * BATTERY_COST_PER_KWH) * (1 + INSTALLATION_RATE); const paybackMonths = monthlySaving > 20_000 ? Math.ceil(totalCost / monthlySaving) : null;
  return { systemName: `${inverterKva}kVA / ${batteryKwh}kWh system`, inverterKva, batteryKwh, panelCount, monthlySaving, fiveYearSaving: Math.max(0, Math.round(monthlySaving * 60 - totalCost * .12)), paybackMonths, powers: POWER[input.propertyType], honestMessage: input.outageHours === 0 || paybackMonths === null || paybackMonths > 120 ? "With these inputs, a smaller backup plan may make more sense. A inspection will give you the honest answer." : null };
}
export function formatNaira(value: number) { return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value); }
