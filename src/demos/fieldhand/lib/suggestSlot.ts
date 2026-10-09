import type { Job } from "@/src/demos/fieldhand/types";

export const WORKING_DAY_START_HOUR = 8;
export const WORKING_DAY_END_HOUR = 18;
const MINUTE = 60_000;

type SuggestedSlot =
  { start: string; end: string; reason: null } | { start: null; end: null; reason: string };

type SuggestSlotOptions = {
  technicianJobs: Job[];
  durationMinutes: number;
  day: Date;
  existingStart?: string | null;
};

// Walk sorted appointments to find the first working-hours gap large enough for the new job.
export function suggestSlot({
  technicianJobs,
  durationMinutes,
  day,
  existingStart,
}: SuggestSlotOptions): SuggestedSlot {
  const dayStart = new Date(day);
  dayStart.setHours(WORKING_DAY_START_HOUR, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(WORKING_DAY_END_HOUR, 0, 0, 0);
  const duration = durationMinutes * MINUTE;
  const appointments = technicianJobs
    .filter((job) => job.scheduledStart)
    .map((job) => ({
      start: new Date(job.scheduledStart as string),
      end: new Date(
        new Date(job.scheduledStart as string).getTime() + job.durationMinutes * MINUTE,
      ),
    }))
    .sort((first, second) => first.start.getTime() - second.start.getTime());
  if (existingStart) {
    const start = new Date(existingStart);
    const end = new Date(start.getTime() + duration);
    const hasConflict = appointments.some((item) => start < item.end && end > item.start);
    if (!hasConflict && start >= dayStart && end <= dayEnd) {
      return slot(start, end);
    }
  }
  let cursor = dayStart;
  for (const appointment of appointments) {
    if (cursor.getTime() + duration <= appointment.start.getTime()) {
      return slot(cursor, new Date(cursor.getTime() + duration));
    }
    if (appointment.end > cursor) {
      cursor = appointment.end;
    }
  }
  if (cursor.getTime() + duration <= dayEnd.getTime()) {
    return slot(cursor, new Date(cursor.getTime() + duration));
  }
  return { start: null, end: null, reason: "No conflict-free slot remains today." };
}

function slot(start: Date, end: Date): SuggestedSlot {
  return { start: start.toISOString(), end: end.toISOString(), reason: null };
}
