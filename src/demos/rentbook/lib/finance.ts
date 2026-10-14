import type { Charge, ChargeStatus, Payment } from "../types";

export const DUE_SOON_DAYS = 14;
export const OVERPAYMENT_CREDIT_LIMIT = 0;

export type PaymentAllocationPreview = {
  allocations: Array<{ chargeId: string; amount: number }>;
  remainingBalance: number;
  creditAmount: number;
};

export function paidTowardCharge(chargeId: string, payments: Payment[]) {
  return payments.reduce(
    (total, payment) =>
      total +
      payment.allocations
        .filter((allocation) => allocation.chargeId === chargeId)
        .reduce((amount, allocation) => amount + allocation.amount, 0),
    0,
  );
}
export function balanceForCharge(charge: Charge, payments: Payment[]) {
  return Math.max(0, charge.amount - paidTowardCharge(charge.id, payments));
}

/**
 * Money enters as naira for the UI, but allocation uses integer kobo so a
 * payment can never lose or gain a fraction through floating-point maths.
 */
export function allocatePayment(
  charges: Charge[],
  payments: Payment[],
  amount: number,
): PaymentAllocationPreview {
  const amountKobo = toKobo(amount);
  if (amountKobo <= 0) {
    throw new Error("Payment amount must be greater than zero.");
  }
  let remainingKobo = amountKobo;
  const allocations = charges
    .slice()
    .sort((first, second) => first.dueDate.localeCompare(second.dueDate))
    .flatMap((charge) => {
      const outstandingKobo = toKobo(balanceForCharge(charge, payments));
      const allocatedKobo = Math.min(remainingKobo, outstandingKobo);
      remainingKobo -= allocatedKobo;
      return allocatedKobo ? [{ chargeId: charge.id, amount: fromKobo(allocatedKobo) }] : [];
    });
  const outstandingKobo = charges.reduce(
    (total, charge) => total + toKobo(balanceForCharge(charge, payments)),
    0,
  );
  return {
    allocations,
    remainingBalance: fromKobo(Math.max(0, outstandingKobo - amountKobo)),
    creditAmount: fromKobo(remainingKobo),
  };
}

export function parseNairaInput(value: string) {
  const clean = value.trim().toLowerCase().replace(/,/g, "");
  const match = clean.match(/^(\d+(?:\.\d{1,2})?)(m)?$/);
  if (!match) {
    return null;
  }
  const parsed = Number(match[1]) * (match[2] ? 1_000_000 : 1);
  return Number.isFinite(parsed) ? parsed : null;
}

function toKobo(value: number) {
  return Math.round(value * 100);
}

function fromKobo(value: number) {
  return value / 100;
}
export function getChargeStatus(charge: Charge, payments: Payment[], today: Date): ChargeStatus {
  const balance = balanceForCharge(charge, payments);
  if (balance === 0) {
    return "paid";
  }
  if (balance < charge.amount) {
    return "partial";
  }
  const dueDate = new Date(`${charge.dueDate}T12:00:00`);
  const daysAway = Math.ceil((dueDate.getTime() - today.getTime()) / 86_400_000);
  if (daysAway < 0) {
    return "overdue";
  }
  if (daysAway <= DUE_SOON_DAYS) {
    return "due_soon";
  }
  return "upcoming";
}
export function amountInWords(kobo: number) {
  if (!Number.isInteger(kobo) || kobo <= 0) {
    throw new Error("Amount in kobo must be a positive integer.");
  }
  const nairaAmount = Math.floor(kobo / 100);
  const koboAmount = kobo % 100;
  const parts = nairaAmount ? [`${numberWords(nairaAmount)} naira`] : [];
  if (koboAmount) {
    parts.push(`${numberWords(koboAmount)} kobo`);
  }
  return `${capitalize(parts.join(", "))} only`;
}

function capitalize(value: string) {
  return `${value[0]?.toUpperCase()}${value.slice(1)}`;
}
function numberWords(value: number): string {
  if (value === 0) {
    return "zero";
  }
  const units = [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ];
  const tens = [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ];
  function underThousand(number: number): string {
    if (number < 20) {
      return units[number];
    }
    if (number < 100) {
      return `${tens[Math.floor(number / 10)]}${number % 10 ? `-${units[number % 10]}` : ""}`;
    }
    return `${units[Math.floor(number / 100)]} hundred${number % 100 ? ` ${underThousand(number % 100)}` : ""}`;
  }
  const groups = [
    [1_000_000_000, "billion"],
    [1_000_000, "million"],
    [1_000, "thousand"],
  ] as const;
  let remainder = value;
  const words = groups.flatMap(([limit, label]) => {
    const group = Math.floor(remainder / limit);
    remainder %= limit;
    return group ? [`${underThousand(group)} ${label}`] : [];
  });
  return [...words, underThousand(remainder)].filter(Boolean).join(", ");
}
export function naira(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function compactNaira(value: number) {
  const magnitude = Math.abs(value);
  if (magnitude >= 1_000_000) {
    return `₦${(value / 1_000_000).toFixed(magnitude >= 10_000_000 ? 0 : 1)}m`;
  }
  if (magnitude >= 1_000) {
    return `₦${Math.round(value / 1_000)}k`;
  }
  return naira(value);
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0, style: "percent" }).format(
    value,
  );
}

export function relativeDueDate(dateKey: string, today: Date) {
  const dueAt = new Date(`${dateKey}T12:00:00+01:00`).getTime();
  const todayAt = new Date(today).getTime();
  const days = Math.round((dueAt - todayAt) / 86_400_000);
  if (days === 0) {
    return "Due today";
  }
  if (days > 0) {
    return `Due in ${days} day${days === 1 ? "" : "s"}`;
  }
  return `${Math.abs(days)} day${days === -1 ? "" : "s"} overdue`;
}

export function formatRentbookDate(dateKey: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(`${dateKey}T12:00:00+01:00`));
}
