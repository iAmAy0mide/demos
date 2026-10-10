import { AXMION_STUDIO_NAME } from "../../../shared/config/contact.ts";

export const BRIEF_MESSAGE_LIMIT = 1500;
export const BRIEF_TEXT_LIMIT = 280;

export type BriefInput = {
  name: string;
  businessName: string;
  projectType: string;
  inspiration: readonly string[];
  visitorAction: string;
  startTiming: string;
  link: string;
};

function clean(value: string, limit = BRIEF_TEXT_LIMIT) {
  return value.trim().replace(/\s+/g, " ").slice(0, limit);
}

// Keeps user text bounded before URL encoding so WhatsApp links remain reliably shareable.
export function buildBriefMessage(input: BriefInput) {
  const lines = [
    `Hi ${AXMION_STUDIO_NAME}, I'd like to discuss a project.`,
    `Name: ${clean(input.name, 80) || "Not provided"}`,
    `Business: ${clean(input.businessName, 100) || "Not provided"}`,
    `I need: ${clean(input.projectType, 60) || "Not decided yet"}`,
    input.inspiration.length ? `Like: ${input.inspiration.join(", ")}` : "",
    `Visitor action: ${clean(input.visitorAction) || "Still defining this"}`,
    input.startTiming ? `Start: ${clean(input.startTiming, 60)}` : "",
    input.link ? `Link: ${clean(input.link, 300)}` : "",
  ].filter(Boolean);
  return lines.join("\n").slice(0, BRIEF_MESSAGE_LIMIT);
}

export function isBriefValid(input: BriefInput) {
  return Boolean(
    clean(input.name) &&
    clean(input.businessName) &&
    clean(input.projectType) &&
    clean(input.visitorAction).length >= 20,
  );
}

export function getBriefErrors(input: BriefInput) {
  return {
    name: clean(input.name) ? "" : "Tell us your name.",
    businessName: clean(input.businessName) ? "" : "Tell us the business name.",
    projectType: clean(input.projectType) ? "" : "Choose what you need.",
    visitorAction:
      clean(input.visitorAction).length < 20
        ? "Use at least 20 characters so we understand the action."
        : "",
    link: input.link && !/^https?:\/\/[^\s]+$/i.test(input.link) ? "Use a full https:// link." : "",
  };
}
