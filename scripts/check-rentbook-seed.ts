import { createSeedRentbookData } from "../src/demos/rentbook/data/seedData.ts";
import { balanceForCharge, getChargeStatus } from "../src/demos/rentbook/lib/finance.ts";

const TODAY = new Date("2026-10-07T12:00:00+01:00");
const data = createSeedRentbookData(TODAY);
const statuses = data.charges.map((charge) => getChargeStatus(charge, data.payments, TODAY));
const occupiedUnits = data.units.filter((unit) => unit.status === "occupied");
const vacantUnits = data.units.filter((unit) => unit.status === "vacant");
const leaseIds = new Set(data.leases.map((lease) => lease.id));
const chargeIds = new Set(data.charges.map((charge) => charge.id));

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`Rentbook seed check failed: ${message}`);
  }
}

assert(data.properties.length === 5, "expected five properties");
assert(data.units.length >= 36 && data.tenants.length >= 28, "portfolio is too small");
assert(data.charges.length === data.leases.length * 12, "expected twelve charge months per lease");
assert(statuses.filter((status) => status === "overdue").length >= 5, "expected overdue accounts");
assert(
  statuses.filter((status) => status === "due_soon").length >= 3,
  "expected due-soon accounts",
);
assert(statuses.filter((status) => status === "partial").length >= 2, "expected partial accounts");
assert(vacantUnits.length === 3, "expected three vacant units");
assert(
  data.leases.some(
    (lease) => new Date(lease.endDate).getTime() - TODAY.getTime() < 31 * 86_400_000,
  ),
  "expected an expiring lease",
);
assert(data.maintenance.length === 4, "expected four maintenance requests");
assert(
  occupiedUnits.every((unit) => unit.tenantId && unit.leaseId && leaseIds.has(unit.leaseId)),
  "occupied unit integrity",
);
assert(
  vacantUnits.every((unit) => !unit.tenantId && !unit.leaseId),
  "vacant unit integrity",
);
assert(
  data.payments.every((payment) =>
    payment.allocations.every((allocation) => chargeIds.has(allocation.chargeId)),
  ),
  "payment allocations reference charges",
);
assert(
  data.charges.every((charge) => balanceForCharge(charge, data.payments) >= 0),
  "payment over-allocation",
);
const portfolioUnitCount = data.properties.reduce(
  (total, property) => total + property.unitIds.length,
  0,
);
assert(
  portfolioUnitCount === data.units.length,
  "property unit counts do not sum to the portfolio",
);
assert(
  data.properties.every((property) => data.units.some((unit) => unit.propertyId === property.id)),
  "property filter would produce an empty portfolio",
);
console.log(
  `Rentbook seed checks passed: ${data.properties.length} properties, ${data.units.length} units, ${data.tenants.length} tenants.`,
);
