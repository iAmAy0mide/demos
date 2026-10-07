import { shipments } from "@/src/demos/meridian/data/shipments";
export const normalizeTrackingNumber = (value: string) => value.trim().toUpperCase().replace(/\s+/g, "");
export const isTrackingNumber = (value: string) => /^MRD-\d{5}$/.test(value);
export const findShipment = (value: string) => shipments.find((shipment) => shipment.id === normalizeTrackingNumber(value));
