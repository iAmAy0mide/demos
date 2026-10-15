export type BillingFrequency = "monthly" | "quarterly" | "half_yearly" | "annual";
export type UnitStatus = "occupied" | "vacant" | "notice_given" | "under_maintenance";
export type ChargeType = "rent" | "service_charge" | "utility" | "late_fee" | "other";
export type PaymentMethod = "cash" | "bank_transfer" | "pos" | "cheque";
export type ChargeStatus = "paid" | "partial" | "due_soon" | "overdue" | "upcoming";
export type Property = {
  id: string;
  name: string;
  area: string;
  address: string;
  unitIds: string[];
};
export type Unit = {
  id: string;
  propertyId: string;
  label: string;
  status: UnitStatus;
  tenantId: string | null;
  leaseId: string | null;
};
export type Tenant = { id: string; name: string; phone: string; email: string; initials: string };
export type Lease = {
  id: string;
  tenantId: string;
  unitId: string;
  frequency: BillingFrequency;
  rentAmount: number;
  startDate: string;
  endDate: string;
  cautionDeposit: number;
  agencyFee: number;
  legalFee: number;
  serviceCharge: number;
};
export type Charge = {
  id: string;
  leaseId: string;
  type: ChargeType;
  amount: number;
  dueDate: string;
  description: string;
};
export type PaymentAllocation = { chargeId: string; amount: number };
export type Payment = {
  id: string;
  tenantId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  reference: string;
  allocations: PaymentAllocation[];
  notes: string;
  creditAmount: number;
};
export type Receipt = {
  id: string;
  paymentId: string;
  issuedDate: string;
  number: string;
};
export type MaintenanceRequest = {
  id: string;
  unitId: string;
  title: string;
  priority: "low" | "normal" | "high";
  status: "reported" | "assigned" | "in_progress" | "done";
  estimate: number;
  assignee?: string;
  notes?: string;
  createdAt?: string;
  activity?: MaintenanceActivity[];
};
export type MaintenanceActivity = { id: string; date: string; message: string };
export type ActivityEntry = { id: string; tenantId: string; date: string; message: string };
export type Expense = {
  id: string;
  propertyId: string;
  date: string;
  amount: number;
  category: "maintenance" | "management" | "service_cost";
  description: string;
};
export type RentbookData = {
  properties: Property[];
  units: Unit[];
  tenants: Tenant[];
  leases: Lease[];
  charges: Charge[];
  payments: Payment[];
  receipts: Receipt[];
  expenses: Expense[];
  maintenance: MaintenanceRequest[];
  activity: ActivityEntry[];
};
