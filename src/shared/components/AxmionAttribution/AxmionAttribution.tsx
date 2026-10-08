import {
  AXMION_STUDIO_NAME,
  buildContextMessage,
  buildWhatsAppLink,
} from "@/src/shared/config/contact";

type AxmionAttributionProps = {
  demoName?: string;
  variant?: "inline" | "line" | "button";
  tone?: "onLight" | "onDark";
  label?: string;
};

export function AxmionAttribution({
  demoName,
  variant = "inline",
  tone = "onLight",
  label = `Concept work by ${AXMION_STUDIO_NAME}`,
}: AxmionAttributionProps) {
  return (
    <a
      className={`axm-attr axm-attr-${variant} axm-attr-${tone}`}
      href={buildWhatsAppLink(buildContextMessage(demoName))}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with ${AXMION_STUDIO_NAME} on WhatsApp (opens in a new tab)`}
    >
      <WhatsAppMark />
      <span>{label}</span>
    </a>
  );
}

function WhatsAppMark() {
  return (
    <svg aria-hidden="true" className="axm-attr-mark" viewBox="0 0 20 20" fill="none">
      <path
        d="M16.5 9.4a6.5 6.5 0 0 1-9.8 5.6L3 16l1.1-3.4A6.5 6.5 0 1 1 16.5 9.4Z"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 6.7c.2-.5.4-.5.7-.5h.4c.2 0 .3.1.4.4l.6 1.4c.1.2.1.4 0 .5l-.4.5c.5.9 1.2 1.6 2.1 2.1l.5-.4c.2-.1.4-.1.5 0l1.4.6c.3.1.4.2.4.4v.4c0 .3 0 .5-.5.7-.4.2-.9.3-1.3.2-2.8-.7-5-2.9-5.7-5.7-.1-.4 0-.9.2-1.3Z"
        fill="currentColor"
      />
    </svg>
  );
}
