export const LAGOS_TIME_ZONE = "Africa/Lagos";

export type LagosDateParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: string;
};
export type GreetingPeriod = "morning" | "afternoon" | "evening";

function partsFor(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: LAGOS_TIME_ZONE, ...options }).formatToParts(
    date,
  );
}

function part(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) {
  return parts.find((entry) => entry.type === type)?.value ?? "";
}

export function lagosDateParts(date: Date): LagosDateParts {
  const parts = partsFor(date, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    weekday: "long",
  });
  return {
    year: Number(part(parts, "year")),
    month: Number(part(parts, "month")),
    day: Number(part(parts, "day")),
    hour: Number(part(parts, "hour")),
    minute: Number(part(parts, "minute")),
    weekday: part(parts, "weekday"),
  };
}

export function lagosWeekday(date: Date) {
  return lagosDateParts(date).weekday;
}
export function lagosDayOfWeek(date: Date) {
  return lagosWeekday(date).slice(0, 3);
}
export function lagosHour(date: Date) {
  return lagosDateParts(date).hour;
}
export function greetingPeriod(date: Date): GreetingPeriod {
  const hour = lagosHour(date);
  if (hour < 12) {
    return "morning";
  }
  if (hour < 17) {
    return "afternoon";
  }
  return "evening";
}
export function formatLagosLongDate(date: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: LAGOS_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
export function formatLagosTime(date: Date) {
  return new Intl.DateTimeFormat("en-NG", {
    timeZone: LAGOS_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
export function lagosDateKey(date: Date) {
  const { year, month, day } = lagosDateParts(date);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
export function lagosDateTime(date: Date, hour: number, minute = 0) {
  return `${lagosDateKey(date)}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00+01:00`;
}
export function nextLagosBusinessDayLabels(date: Date) {
  const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const todayIndex = weekdays.indexOf(lagosWeekday(date));
  const startIndex = todayIndex === -1 ? 0 : Math.min(todayIndex + 1, weekdays.length - 1);
  return [...weekdays.slice(startIndex), ...weekdays].slice(0, 3);
}
