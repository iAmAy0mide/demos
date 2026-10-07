export type PropertyType = "home" | "shop" | "office" | "factory";
export type BackupType = "petrol" | "diesel" | "inverter" | "none";
export type CalculatorInput = { monthlySpend: number; propertyType: PropertyType; outageHours: number; backupType: BackupType };
export type SolarEstimate = { systemName: string; inverterKva: number; batteryKwh: number; panelCount: number; monthlySaving: number; fiveYearSaving: number; paybackMonths: number | null; powers: string; honestMessage: string | null };
