export type JobStatus =
  | "unassigned"
  | "scheduled"
  | "en_route"
  | "on_site"
  | "done";

export type Priority = "low" | "normal" | "high" | "urgent";
export type ThemeMode = "system" | "dark" | "light";
export type ResolvedTheme = Exclude<ThemeMode, "system">;
export type ServiceCategory = "generator" | "ac" | "solar" | "electrical";
export type QuoteStatus = "draft" | "sent" | "accepted";

export type Customer = {
  id: string;
  name: string;
  company?: string;
  phone: string;
  email: string;
};

export type Technician = {
  id: string;
  name: string;
  initials: string;
  skills: ServiceCategory[];
  phone: string;
  status: "available" | "on_job" | "off_duty";
};

export type ActivityEntry = {
  id: string;
  timestamp: string;
  actor: string;
  message: string;
};

export type Job = {
  id: string;
  title: string;
  customerId: string;
  address: string;
  area: "Lekki" | "Ikeja" | "Yaba" | "Surulere" | "Victoria Island" | "Ajah";
  category: ServiceCategory;
  priority: Priority;
  status: JobStatus;
  technicianId: string | null;
  scheduledStart: string | null;
  durationMinutes: number;
  notes: string;
  activity: ActivityEntry[];
  quoteId: string | null;
};

export type QuoteLineItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  type: "labor" | "parts";
};

export type Quote = {
  id: string;
  customerId: string;
  jobId: string | null;
  status: QuoteStatus;
  lineItems: QuoteLineItem[];
  discountPercent: number;
  vatPercent: number;
  createdAt: string;
};

export type FieldhandData = {
  customers: Customer[];
  technicians: Technician[];
  jobs: Job[];
  quotes: Quote[];
};

export type FieldhandFilters = {
  technicianId: string | "all";
  priority: Priority | "all";
  status: JobStatus | "all";
  area: Job["area"] | "all";
};
