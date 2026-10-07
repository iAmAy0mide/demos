import type { FieldhandFilters, Job, JobStatus, Technician } from "@/src/demos/fieldhand/types";

const MINUTES_IN_HOUR = 60;

export function sortJobsBySchedule(jobs: Job[]) {
  return [...jobs].sort((firstJob, secondJob) => {
    if (!firstJob.scheduledStart) return 1;
    if (!secondJob.scheduledStart) return -1;
    return firstJob.scheduledStart.localeCompare(secondJob.scheduledStart);
  });
}

export function findSchedulingConflicts(jobs: Job[], technicianId: string) {
  const scheduledJobs = sortJobsBySchedule(
    jobs.filter((job) => job.technicianId === technicianId && job.scheduledStart),
  );

  return scheduledJobs.filter((job, index) => {
    const nextJob = scheduledJobs[index + 1];
    if (!nextJob || !job.scheduledStart || !nextJob.scheduledStart) return false;

    const jobEnd = new Date(job.scheduledStart).getTime() + job.durationMinutes * MINUTES_IN_HOUR * 1000;
    return jobEnd > new Date(nextJob.scheduledStart).getTime();
  });
}

export function countJobsForStatus(jobs: Job[], status: JobStatus) {
  return jobs.filter((job) => job.status === status).length;
}

export function filterJobs(jobs: Job[], filters: FieldhandFilters) {
  return jobs.filter((job) => {
    if (filters.technicianId !== "all" && job.technicianId !== filters.technicianId) return false;
    if (filters.priority !== "all" && job.priority !== filters.priority) return false;
    if (filters.status !== "all" && job.status !== filters.status) return false;
    if (filters.area !== "all" && job.area !== filters.area) return false;
    return true;
  });
}

export function getTechnicianById(technicians: Technician[], technicianId: string | null) {
  if (!technicianId) return null;
  return technicians.find((technician) => technician.id === technicianId) ?? null;
}
