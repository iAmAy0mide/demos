import type { Quote, QuoteLineItem } from "@/src/demos/fieldhand/types";

export type QuoteTotals = {
  subtotal: number;
  discount: number;
  vat: number;
  total: number;
};

export function getLineItemTotal(lineItem: QuoteLineItem) {
  return lineItem.quantity * lineItem.unitPrice;
}

export function calculateQuoteTotals(quote: Quote): QuoteTotals {
  const subtotal = quote.lineItems.reduce((total, lineItem) => total + getLineItemTotal(lineItem), 0);
  const discount = Math.round((subtotal * quote.discountPercent) / 100);
  const taxableAmount = subtotal - discount;
  const vat = Math.round((taxableAmount * quote.vatPercent) / 100);

  return { subtotal, discount, vat, total: taxableAmount + vat };
}

export function formatNaira(amount: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}
