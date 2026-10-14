export const AXMION_DISPLAY_NUMBER = "0805 168 1996";
export const AXMION_INTERNATIONAL_DIGITS = "2348051681996";
export const AXMION_STUDIO_NAME = "Axmion Web Innovations";

export function toInternationalNigerianNumber(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("234") && digits.length === 13) {
    return digits;
  }
  if (digits.startsWith("0") && digits.length === 11) {
    return `234${digits.slice(1)}`;
  }
  if (digits.length === 10 && digits.startsWith("8")) {
    return `234${digits}`;
  }
  return null;
}

export function buildWhatsAppLinkTo(internationalDigits: string, message?: string) {
  const query = encodeURIComponent(message ?? "");
  return `https://wa.me/${internationalDigits}?text=${query}`;
}

export function buildWhatsAppLink(message?: string) {
  return buildWhatsAppLinkTo(AXMION_INTERNATIONAL_DIGITS, message);
}

export function buildTelephoneLink() {
  return `tel:+${AXMION_INTERNATIONAL_DIGITS}`;
}

export function buildContextMessage(demoName?: string) {
  if (demoName) {
    return `Hi Axmion, I just viewed the ${demoName} concept and I'd like something like it for my business.`;
  }

  return "Hi Axmion, I saw your showcase and I'd like to talk about a project.";
}
