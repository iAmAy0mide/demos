export const AXMION_DISPLAY_NUMBER = "0805 168 1996";
export const AXMION_INTERNATIONAL_DIGITS = "2348051681996";
export const AXMION_STUDIO_NAME = "Axmion Web Innovations";

export function buildWhatsAppLink(message?: string) {
  const query = encodeURIComponent(message ?? "");
  return `https://wa.me/${AXMION_INTERNATIONAL_DIGITS}?text=${query}`;
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
