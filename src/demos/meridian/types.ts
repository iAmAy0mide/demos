export type ServiceSlug = "sea-freight" | "air-freight" | "road-freight" | "customs-clearance" | "warehousing";
export type ShipmentStatus = "In transit" | "In customs" | "Delivered" | "Delayed";
export type FreightMode = "Sea freight" | "Air freight" | "Road freight" | "Customs clearance" | "Warehousing";

export type Service = { slug: ServiceSlug; code: string; name: FreightMode; summary: string; transit: string; coverage: string; capacity: string; documents: string[]; included: string[]; excluded: string[]; lanes: { route: string; transit: string; frequency: string }[]; faqs: { question: string; answer: string }[] };
export type ShipmentEvent = { status: string; location: string; time: string; complete: boolean };
export type Shipment = { id: string; status: ShipmentStatus; mode: "Sea" | "Air" | "Road"; cargo: string; weight: string; equipment: string; origin: string; destination: string; eta: string; progress: number; events: ShipmentEvent[]; documents: string[] };
export type QuoteValues = { mode: string; cargoType: string; commodity: string; unNumber: string; origin: string; destination: string; incoterm: string; delivery: string; weight: string; equipment: string; readyDate: string; urgency: string; company: string; name: string; role: string; email: string; phone: string; notes: string };
