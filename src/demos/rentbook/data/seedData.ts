import type { Charge, Lease, Payment, Property, RentbookData, Tenant, Unit } from "../types";

function lagosDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((entry) => entry.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

const buildings = [
  ["Admiralty Court", "Lekki Phase 1"],
  ["Palmgrove Terrace", "Yaba"],
  ["Adeniran Heights", "Ikeja"],
  ["Surulere Gardens", "Surulere"],
  ["Ajah Pearl Estate", "Ajah"],
] as const;
const names = [
  "Adaeze Okoro",
  "Tunde Bamidele",
  "Hauwa Ibrahim",
  "Chinedu Eze",
  "Morenike Adebayo",
  "Femi Akinola",
  "Ngozi Nwosu",
  "Seyi Adeyemi",
  "Bola Lawal",
  "Ifeoma Obi",
  "Kelechi Umeh",
  "Zainab Musa",
  "Tayo Ajayi",
  "Amaka Nnamdi",
  "David Eze",
  "Aisha Bello",
  "Emeka Okafor",
  "Bisola Ojo",
  "Sola Adekunle",
  "Rukayat Ahmed",
  "Musa Garba",
  "Nneka Ibe",
  "Kemi Fashola",
  "Uche Nwankwo",
  "Funmi Alabi",
  "Dami Ojo",
  "Ibrahim Sule",
  "Mariam Yusuf",
  "Chuka Nwosu",
  "Yetunde Cole",
  "Obinna Eze",
  "Sade Thomas",
  "Temitope Akinyemi",
  "Ebele Nwachukwu",
  "Bashir Danladi",
  "Rasheedat Bello",
  "Nnamdi Kalu",
];
function shifted(today: Date, months: number, days = 0) {
  const date = new Date(today);
  date.setUTCMonth(date.getUTCMonth() + months);
  date.setUTCDate(date.getUTCDate() + days);
  return lagosDateKey(date);
}
export function createSeedRentbookData(today: Date): RentbookData {
  const properties: Property[] = buildings.map(([name, area], i) => ({
    id: `property-${i + 1}`,
    name,
    area,
    address: `${18 + i * 7} ${area} Road, Lagos`,
    unitIds: Array.from({ length: 8 }, (_, u) => `unit-${i + 1}-${u + 1}`),
  }));
  const tenants: Tenant[] = names.map((name, i) => ({
    id: `tenant-${i + 1}`,
    name,
    phone: `+234 80${(i % 8) + 1} 555 ${String(1000 + i).slice(1)}`,
    email: `${name.toLowerCase().replace(/ /g, ".")}@example.test`,
    initials: name
      .split(" ")
      .map((x) => x[0])
      .join(""),
  }));
  const units: Unit[] = [];
  const leases: Lease[] = [];
  let cursor = 0;
  const vacant = new Set([7, 22, 39]);
  properties.forEach((property, p) =>
    property.unitIds.forEach((id, u) => {
      const serial = p * 8 + u + 1;
      const tenant = vacant.has(serial) ? null : tenants[cursor++];
      const leaseId = tenant ? `lease-${tenant.id}` : null;
      units.push({
        id,
        propertyId: property.id,
        label: u < 6 ? `Flat ${u + 1}${String.fromCharCode(65 + p)}` : `Shop ${u - 5}`,
        status: tenant ? "occupied" : "vacant",
        tenantId: tenant?.id ?? null,
        leaseId,
      });
      if (tenant && leaseId) {
        leases.push({
          id: leaseId,
          tenantId: tenant.id,
          unitId: id,
          frequency: frequencyForSerial(serial),
          rentAmount:
            u >= 6 ? 350000 + (serial % 2) * 50000 : [250000, 825000, 2100000, 4200000][serial % 4],
          startDate: shifted(today, -11),
          endDate: serial === 2 ? shifted(today, 0, 22) : shifted(today, 10),
          cautionDeposit: 150000,
          serviceCharge: 35000,
        });
      }
    }),
  );
  const charges: Charge[] = [];
  const payments: Payment[] = [];
  leases.forEach((lease, index) => {
    for (let month = -11; month <= 0; month += 1) {
      const dueSoon = month === 0 && [1, 4, 8, 18].includes(index);
      const charge = {
        id: `charge-${index}-${month}`,
        leaseId: lease.id,
        type: "rent" as const,
        amount: lease.rentAmount,
        dueDate: shifted(today, month, dueDateOffset(month, dueSoon)),
        description: `Rent ${shifted(today, month).slice(0, 7)}`,
      };
      charges.push(charge);
      const unpaid = month === 0 && [3, 6, 9, 12, 15, 18].includes(index);
      if (!unpaid && !dueSoon) {
        const amount =
          month === 0 && [20, 24].includes(index)
            ? Math.round(charge.amount * 0.55)
            : charge.amount;
        payments.push({
          id: `payment-${index}-${month}`,
          tenantId: lease.tenantId,
          amount,
          date: shifted(today, month, 2),
          method: "bank_transfer",
          reference: `RBT-${index}-${month + 12}`,
          allocations: [{ chargeId: charge.id, amount }],
          notes: amount === charge.amount ? "Rent received" : "Part payment",
        });
      }
    }
  });
  return {
    properties,
    units,
    tenants,
    leases,
    charges,
    payments,
    maintenance: [
      {
        id: "maintenance-1",
        unitId: "unit-1-7",
        title: "Water pressure inspection",
        priority: "high",
        status: "assigned",
        estimate: 85000,
      },
      {
        id: "maintenance-2",
        unitId: "unit-2-3",
        title: "Repair balcony drain",
        priority: "normal",
        status: "reported",
        estimate: 45000,
      },
      {
        id: "maintenance-3",
        unitId: "unit-3-6",
        title: "Replace gate keypad",
        priority: "normal",
        status: "in_progress",
        estimate: 120000,
      },
      {
        id: "maintenance-4",
        unitId: "unit-5-1",
        title: "Inspect AC drain",
        priority: "low",
        status: "reported",
        estimate: 35000,
      },
    ],
    activity: [],
  };
}

function frequencyForSerial(serial: number) {
  return (["monthly", "quarterly", "half_yearly", "annual"] as const)[serial % 4];
}

function dueDateOffset(month: number, isDueSoon: boolean) {
  if (month !== 0) {
    return 0;
  }
  return isDueSoon ? 5 : -6;
}
