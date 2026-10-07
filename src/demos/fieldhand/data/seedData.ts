import type { Customer, FieldhandData, Job, Quote, Technician } from "@/src/demos/fieldhand/types";

const VAT_PERCENT = 7.5;
const DEFAULT_DURATION = 90;

const customers: Customer[] = [
  { id: "cus-001", name: "Adaeze Okonkwo", company: "Mosaic House", phone: "+234 803 441 9982", email: "adaeze@mosaichouse.ng" },
  { id: "cus-002", name: "Bayo Adeyemi", company: "Aster Logistics", phone: "+234 802 778 1409", email: "bayo@asterlogistics.ng" },
  { id: "cus-003", name: "Ifeoma Nwosu", phone: "+234 805 229 6114", email: "ifeoma.nwosu@email.ng" },
  { id: "cus-004", name: "Tunde Balogun", company: "Ballast Foods", phone: "+234 809 501 3304", email: "tunde@ballastfoods.ng" },
  { id: "cus-005", name: "Yewande Akinola", phone: "+234 806 118 4201", email: "yewande.akinola@email.ng" },
  { id: "cus-006", name: "Kelechi Umeh", company: "Pace Studios", phone: "+234 814 700 6603", email: "kelechi@pacestudios.ng" },
  { id: "cus-007", name: "Femi Ajibade", company: "Nerva Clinic", phone: "+234 803 910 0278", email: "femi@nervaclinic.ng" },
  { id: "cus-008", name: "Zainab Musa", phone: "+234 810 264 9036", email: "zainab.musa@email.ng" },
  { id: "cus-009", name: "Chidi Eze", company: "Eze & Co.", phone: "+234 802 419 5052", email: "chidi@ezeandco.ng" },
  { id: "cus-010", name: "Ronke Lawal", phone: "+234 807 552 9137", email: "ronke.lawal@email.ng" },
  { id: "cus-011", name: "David Ekanem", company: "Island Works", phone: "+234 815 818 7210", email: "david@islandworks.ng" },
  { id: "cus-012", name: "Mariam Bello", phone: "+234 816 229 6440", email: "mariam.bello@email.ng" },
];

const technicians: Technician[] = [
  { id: "tech-ade", name: "Ade Fashola", initials: "AF", skills: ["generator", "electrical"], phone: "+234 803 600 4218", status: "on_job" },
  { id: "tech-ngozi", name: "Ngozi Eze", initials: "NE", skills: ["solar", "electrical"], phone: "+234 806 208 0315", status: "available" },
  { id: "tech-tobi", name: "Tobi Ojo", initials: "TO", skills: ["ac", "generator"], phone: "+234 809 112 7640", status: "on_job" },
  { id: "tech-sade", name: "Sade Bamidele", initials: "SB", skills: ["solar", "ac"], phone: "+234 802 953 4088", status: "available" },
  { id: "tech-ibrahim", name: "Ibrahim Garba", initials: "IG", skills: ["generator", "electrical"], phone: "+234 813 700 5971", status: "on_job" },
  { id: "tech-chioma", name: "Chioma Anya", initials: "CA", skills: ["ac", "solar"], phone: "+234 805 144 2226", status: "off_duty" },
];

function atTime(today: Date, hour: number, minute = 0) {
  const timestamp = new Date(today);
  timestamp.setHours(hour, minute, 0, 0);
  return timestamp.toISOString();
}

function activity(id: string, timestamp: string, message: string): Job["activity"] {
  return [{ id: `act-${id}`, timestamp, actor: "Dispatch", message }];
}

function createJob(today: Date, values: Omit<Job, "activity"> & { activityMessage?: string }): Job {
  const activityTimestamp = values.scheduledStart ?? atTime(today, 8);
  const { activityMessage, ...job } = values;
  return {
    ...job,
    activity: activity(job.id, activityTimestamp, activityMessage ?? "Job logged by dispatch."),
  };
}

export function createSeedData(today: Date): FieldhandData {
  const jobs: Job[] = [
    createJob(today, { id: "VL-1042", title: "Generator fuel system fault", customerId: "cus-007", address: "18 Admiralty Way", area: "Lekki", category: "generator", priority: "urgent", status: "unassigned", technicianId: null, scheduledStart: null, durationMinutes: 120, notes: "Clinic generator is cutting out during transfer. Triage before 11:00.", quoteId: null, activityMessage: "Urgent job escalated from customer support." }),
    createJob(today, { id: "VL-1041", title: "AC preventive maintenance", customerId: "cus-001", address: "4A Wole Olateju Crescent", area: "Lekki", category: "ac", priority: "normal", status: "scheduled", technicianId: "tech-tobi", scheduledStart: atTime(today, 10), durationMinutes: DEFAULT_DURATION, notes: "Six split units. Security has been notified.", quoteId: "QT-2084" }),
    createJob(today, { id: "VL-1040", title: "Solar inverter handover", customerId: "cus-002", address: "12A Billings Way", area: "Ikeja", category: "solar", priority: "high", status: "scheduled", technicianId: "tech-ngozi", scheduledStart: atTime(today, 11), durationMinutes: 120, notes: "Walk the operations lead through the monitoring app.", quoteId: null }),
    createJob(today, { id: "VL-1039", title: "Changeover panel inspection", customerId: "cus-004", address: "32 Akerele Street", area: "Surulere", category: "electrical", priority: "high", status: "en_route", technicianId: "tech-ade", scheduledStart: atTime(today, 9), durationMinutes: 90, notes: "Bring three-phase tester. Site contact is on the gate.", quoteId: null }),
    createJob(today, { id: "VL-1038", title: "Cold room compressor check", customerId: "cus-009", address: "7 Commercial Avenue", area: "Yaba", category: "ac", priority: "urgent", status: "on_site", technicianId: "tech-tobi", scheduledStart: atTime(today, 8, 30), durationMinutes: 150, notes: "Stock is temperature-sensitive. Diagnose before noon.", quoteId: "QT-2082" }),
    createJob(today, { id: "VL-1037", title: "Battery bank health test", customerId: "cus-006", address: "21 Akin Adesola Street", area: "Victoria Island", category: "solar", priority: "normal", status: "on_site", technicianId: "tech-sade", scheduledStart: atTime(today, 9, 30), durationMinutes: 90, notes: "Quarterly maintenance contract visit.", quoteId: null }),
    createJob(today, { id: "VL-1036", title: "Generator servicing", customerId: "cus-011", address: "6B Fola Osibo", area: "Lekki", category: "generator", priority: "normal", status: "done", technicianId: "tech-ibrahim", scheduledStart: atTime(today, 7, 30), durationMinutes: 90, notes: "Service complete. Invoice approved on site.", quoteId: "QT-2079" }),
    createJob(today, { id: "VL-1035", title: "AC drainage repair", customerId: "cus-005", address: "9 Opebi Road", area: "Ikeja", category: "ac", priority: "low", status: "done", technicianId: "tech-chioma", scheduledStart: atTime(today, 8), durationMinutes: 60, notes: "Customer requested a noon completion call.", quoteId: null }),
    createJob(today, { id: "VL-1034", title: "Load assessment", customerId: "cus-003", address: "15 Freedom Way", area: "Lekki", category: "solar", priority: "high", status: "scheduled", technicianId: "tech-ngozi", scheduledStart: atTime(today, 12), durationMinutes: 120, notes: "Potential 10kVA hybrid installation.", quoteId: "QT-2081" }),
    createJob(today, { id: "VL-1033", title: "ATS wiring correction", customerId: "cus-010", address: "3 Ogunlana Drive", area: "Surulere", category: "electrical", priority: "high", status: "scheduled", technicianId: "tech-ade", scheduledStart: atTime(today, 10), durationMinutes: 120, notes: "Deliberate clash with VL-1039 for scheduling demo.", quoteId: null }),
    createJob(today, { id: "VL-1032", title: "Inverter fan replacement", customerId: "cus-008", address: "14 Kudirat Abiola Way", area: "Ikeja", category: "solar", priority: "normal", status: "unassigned", technicianId: null, scheduledStart: null, durationMinutes: 60, notes: "Customer has a compatible spare fan on site.", quoteId: null }),
    createJob(today, { id: "VL-1031", title: "Generator load bank test", customerId: "cus-012", address: "22 Badore Road", area: "Ajah", category: "generator", priority: "normal", status: "scheduled", technicianId: "tech-ibrahim", scheduledStart: atTime(today, 13), durationMinutes: 90, notes: "Verify capacity ahead of event weekend.", quoteId: null }),
    createJob(today, { id: "VL-1030", title: "Distribution board audit", customerId: "cus-004", address: "32 Akerele Street", area: "Surulere", category: "electrical", priority: "low", status: "unassigned", technicianId: null, scheduledStart: null, durationMinutes: 90, notes: "Prepare findings for facility manager.", quoteId: null }),
    createJob(today, { id: "VL-1029", title: "Split unit installation", customerId: "cus-012", address: "22 Badore Road", area: "Ajah", category: "ac", priority: "normal", status: "scheduled", technicianId: "tech-chioma", scheduledStart: atTime(today, 14), durationMinutes: 120, notes: "New staff suite. Ladder access confirmed.", quoteId: null }),
    createJob(today, { id: "VL-1028", title: "Solar panel wash", customerId: "cus-006", address: "21 Akin Adesola Street", area: "Victoria Island", category: "solar", priority: "low", status: "scheduled", technicianId: "tech-sade", scheduledStart: atTime(today, 13), durationMinutes: 60, notes: "Coordinate roof access with building manager.", quoteId: null }),
    createJob(today, { id: "VL-1027", title: "Generator alternator check", customerId: "cus-002", address: "12A Billings Way", area: "Ikeja", category: "generator", priority: "high", status: "en_route", technicianId: "tech-ibrahim", scheduledStart: atTime(today, 10, 30), durationMinutes: 90, notes: "Aster's backup unit has intermittent output.", quoteId: null }),
    createJob(today, { id: "VL-1026", title: "UPS battery replacement", customerId: "cus-007", address: "18 Admiralty Way", area: "Lekki", category: "electrical", priority: "normal", status: "on_site", technicianId: "tech-ade", scheduledStart: atTime(today, 12), durationMinutes: 120, notes: "Replace two failed units in reception rack.", quoteId: null }),
    createJob(today, { id: "VL-1025", title: "Inverter commissioning", customerId: "cus-008", address: "14 Kudirat Abiola Way", area: "Ikeja", category: "solar", priority: "normal", status: "done", technicianId: "tech-ngozi", scheduledStart: atTime(today, 7), durationMinutes: 90, notes: "Completed handover and monitoring setup.", quoteId: null }),
    createJob(today, { id: "VL-1024", title: "AC leak detection", customerId: "cus-010", address: "3 Ogunlana Drive", area: "Surulere", category: "ac", priority: "normal", status: "done", technicianId: "tech-tobi", scheduledStart: atTime(today, 7, 30), durationMinutes: 60, notes: "Small leak isolated at flare joint.", quoteId: null }),
    createJob(today, { id: "VL-1023", title: "Generator relocation survey", customerId: "cus-001", address: "4A Wole Olateju Crescent", area: "Lekki", category: "generator", priority: "normal", status: "unassigned", technicianId: null, scheduledStart: null, durationMinutes: 90, notes: "Review ventilation and cable route before move.", quoteId: null }),
    createJob(today, { id: "VL-1022", title: "Earthing resistance test", customerId: "cus-005", address: "9 Opebi Road", area: "Ikeja", category: "electrical", priority: "high", status: "scheduled", technicianId: "tech-ade", scheduledStart: atTime(today, 14), durationMinutes: 60, notes: "Test after main work hours if possible.", quoteId: null }),
    createJob(today, { id: "VL-1021", title: "AC capacitor replacement", customerId: "cus-003", address: "15 Freedom Way", area: "Lekki", category: "ac", priority: "normal", status: "en_route", technicianId: "tech-chioma", scheduledStart: atTime(today, 10), durationMinutes: 60, notes: "Bring 35µF and 45µF options.", quoteId: null }),
    createJob(today, { id: "VL-1020", title: "PV string voltage check", customerId: "cus-011", address: "6B Fola Osibo", area: "Lekki", category: "solar", priority: "low", status: "done", technicianId: "tech-sade", scheduledStart: atTime(today, 8), durationMinutes: 60, notes: "Output returned within expected range.", quoteId: null }),
    createJob(today, { id: "VL-1019", title: "Surge protection review", customerId: "cus-009", address: "7 Commercial Avenue", area: "Yaba", category: "electrical", priority: "high", status: "scheduled", technicianId: "tech-ibrahim", scheduledStart: atTime(today, 15), durationMinutes: 60, notes: "Review equipment protection after two recent trips.", quoteId: null }),
  ];

  const quotes: Quote[] = [
    { id: "QT-2084", customerId: "cus-001", jobId: "VL-1041", status: "sent", discountPercent: 0, vatPercent: VAT_PERCENT, createdAt: atTime(today, 8), lineItems: [{ id: "li-01", description: "AC service visit", quantity: 6, unitPrice: 18000, type: "labor" }] },
    { id: "QT-2082", customerId: "cus-009", jobId: "VL-1038", status: "accepted", discountPercent: 5, vatPercent: VAT_PERCENT, createdAt: atTime(today, 7), lineItems: [{ id: "li-02", description: "Compressor diagnostic", quantity: 1, unitPrice: 35000, type: "labor" }, { id: "li-03", description: "Refrigerant top-up", quantity: 2, unitPrice: 22000, type: "parts" }] },
    { id: "QT-2081", customerId: "cus-003", jobId: "VL-1034", status: "draft", discountPercent: 0, vatPercent: VAT_PERCENT, createdAt: atTime(today, 8, 30), lineItems: [{ id: "li-04", description: "Site load assessment", quantity: 1, unitPrice: 50000, type: "labor" }] },
    { id: "QT-2079", customerId: "cus-011", jobId: "VL-1036", status: "accepted", discountPercent: 0, vatPercent: VAT_PERCENT, createdAt: atTime(today, 6), lineItems: [{ id: "li-05", description: "Generator service kit", quantity: 1, unitPrice: 78000, type: "parts" }, { id: "li-06", description: "Technician labour", quantity: 2, unitPrice: 20000, type: "labor" }] },
  ];

  return { customers, technicians, jobs, quotes };
}
