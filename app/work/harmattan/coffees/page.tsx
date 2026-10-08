import { CoffeeList } from "@/src/demos/harmattan/components/Pages";

import type { Metadata } from "next";
export const metadata: Metadata = { title: "Coffees | Harmattan Coffee Co." };
export default function Page() {
  return <CoffeeList />;
}
