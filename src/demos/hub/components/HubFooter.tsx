import Image from "next/image";
import Link from "next/link";

import { AxmionAttribution } from "@/src/shared/components/AxmionAttribution";
import { DemoLink } from "@/src/shared/components/DemoLink";
import {
  AXMION_DISPLAY_NUMBER,
  buildContextMessage,
  buildTelephoneLink,
  buildWhatsAppLink,
} from "@/src/shared/config/contact";
import { publishedWorks } from "@/src/shared/works";

const navigation = ["Work", "Services", "Process", "Contact"] as const;

export function HubFooter() {
  return (
    <footer className="axm-footer">
      <div className="axm-footer-grid">
        <div className="axm-footer-brand">
          <Link href="/" aria-label="Axmion home">
            <Image src="/images/logo-mark-64.png" alt="" width={28} height={28} />
            <span>Axmion</span>
          </Link>
          <p>Websites that turn attention into action.</p>
          <a
            className="axm-button"
            href={buildWhatsAppLink(buildContextMessage())}
            target="_blank"
            rel="noopener noreferrer"
          >
            Start a project
          </a>
        </div>
        <nav className="axm-footer-column" aria-label="Footer navigation">
          <p>Navigate</p>
          {navigation.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`}>
              {item}
            </a>
          ))}
        </nav>
        <nav className="axm-footer-column" aria-label="Published work">
          <p>Selected work</p>
          {publishedWorks.map((work) => (
            <DemoLink key={work.id} href={work.route}>
              <span>{work.name}</span>
              <small>{work.kind}</small>
            </DemoLink>
          ))}
        </nav>
        <div className="axm-footer-column">
          <p>Talk to us</p>
          <a href={buildTelephoneLink()}>{AXMION_DISPLAY_NUMBER}</a>
          <a
            href={buildWhatsAppLink(buildContextMessage())}
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>
          <span>Lagos, Nigeria</span>
        </div>
      </div>
      <div className="axm-footer-bottom">
        <AxmionAttribution tone="onDark" variant="line" />
        <a href="#content">Back to top</a>
      </div>
      <div className="axm-footer-wordmark" aria-hidden="true">
        Axmion
      </div>
    </footer>
  );
}
