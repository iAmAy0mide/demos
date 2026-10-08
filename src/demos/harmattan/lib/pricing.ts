import type { Coffee } from "../types";
export const SUBSCRIPTION_DISCOUNT = 0.1;
export const FREE_DELIVERY_THRESHOLD = 30000;
export const LAGOS_DELIVERY = 1200;
export const NATIONWIDE_DELIVERY = 2500;
export type BoxPriceInput = {
  selected: Coffee[];
  size: "250g" | "1kg";
  bags: number;
  city: "Lagos" | "Abuja" | "Nationwide";
};
/** Subscription savings apply to coffee only; delivery is waived on larger boxes. */
export function calculateSubscriptionPrice(input: BoxPriceInput) {
  const base =
    input.selected.reduce(
      (total, coffee) => total + coffee.price * (input.size === "1kg" ? 3.45 : 1),
      0,
    ) * input.bags;
  const savings = Math.round(base * SUBSCRIPTION_DISCOUNT);
  const coffeeTotal = base - savings;
  let delivery = LAGOS_DELIVERY;
  if (coffeeTotal >= FREE_DELIVERY_THRESHOLD) {
    delivery = 0;
  }
  if (coffeeTotal < FREE_DELIVERY_THRESHOLD && input.city === "Nationwide") {
    delivery = NATIONWIDE_DELIVERY;
  }
  return { base, savings, delivery, total: coffeeTotal + delivery };
}
export const naira = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
