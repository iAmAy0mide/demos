const zone = "Africa/Lagos";
function data(date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(date)
    .reduce((result, part) => ({ ...result, [part.type]: part.value }), {});
}
const checks = [
  [new Date("2026-10-07T10:00:00Z"), "Wednesday", "07", "morning"],
  [new Date("2026-10-31T23:30:00Z"), "Sunday", "01", "morning"],
  [new Date("2026-10-31T22:30:00Z"), "Saturday", "31", "evening"],
  [new Date("2028-02-29T12:00:00Z"), "Tuesday", "29", "afternoon"],
  [new Date("2026-11-30T23:30:00Z"), "Tuesday", "01", "morning"],
];
for (const [date, weekday, day, period] of checks) {
  const value = data(date);
  const hour = Number(value.hour);
  let actualPeriod = "evening";
  if (hour < 12) {
    actualPeriod = "morning";
  } else if (hour < 17) {
    actualPeriod = "afternoon";
  }
  if (value.weekday !== weekday || value.day !== day || actualPeriod !== period) {
    throw new Error(`Lagos time check failed for ${date.toISOString()}`);
  }
}
console.log("Lagos time checks passed.");
