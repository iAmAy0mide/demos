import { AxmionAttribution } from "@/src/shared/components/AxmionAttribution";
import {
  AXMION_DISPLAY_NUMBER,
  AXMION_STUDIO_NAME,
  buildContextMessage,
  buildTelephoneLink,
  buildWhatsAppLink,
} from "@/src/shared/config/contact";
export function HubFooter() {
  return (
    <footer className="axm-footer">
      <p>{AXMION_STUDIO_NAME} · Lagos, Nigeria</p>
      <div>
        <a href={buildTelephoneLink()}>{AXMION_DISPLAY_NUMBER}</a>
        <a
          href={buildWhatsAppLink(buildContextMessage())}
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
      </div>
      <AxmionAttribution tone="onDark" variant="line" />
    </footer>
  );
}
