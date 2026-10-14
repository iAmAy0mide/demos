export const reminderTones = ["gentle", "firm", "final notice"] as const;
export type ReminderTone = (typeof reminderTones)[number];

export function buildReminderMessage(
  tone: ReminderTone,
  values: {
    name: string;
    unit: string;
    property: string;
    amount: string;
    dueDate: string;
    daysOverdue: number;
  },
) {
  const introductions: Record<ReminderTone, string> = {
    gentle: "A gentle reminder",
    firm: "This is a firm reminder",
    "final notice": "Final notice",
  };
  const intro = introductions[tone];
  return `${intro}, ${values.name}: ${values.amount} for ${values.unit}, ${values.property} was due ${values.dueDate} (${values.daysOverdue} days overdue). Please arrange payment.`;
}
