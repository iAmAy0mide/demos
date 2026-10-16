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
          <Link className="axm-footer-logo" href="/" aria-label="Axmion home">
            <Image src="/images/logo-mark-64.png" alt="" width={28} height={28} />
            <span>Axmion</span>
          </Link>
          <p>Websites that turn attention into action.</p>
          <a
            className="axm-footer-cta"
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
        <nav className="axm-footer-column axm-footer-work" aria-label="Published work">
          <p>Selected work</p>
          {publishedWorks.map((work) => (
            <DemoLink key={work.id} href={work.route}>
              {work.name}
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
      <div className="axm-footer-watermark" aria-hidden="true">
        <svg viewBox="0 0 1000 220" role="presentation">
          <defs>
            <linearGradient id="axm-footer-wordmark-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--axm-signal)" stopOpacity="0.14" />
              <stop offset="1" stopColor="var(--axm-signal)" stopOpacity="0" />
            </linearGradient>
            <clipPath id="axm-footer-wordmark-clip">
              <rect width="1000" height="132" />
            </clipPath>
          </defs>
          <text
            x="10"
            y="188"
            textLength="980"
            lengthAdjust="spacingAndGlyphs"
            clipPath="url(#axm-footer-wordmark-clip)"
          >
            Axmion
          </text>
        </svg>
      </div>
    </footer>
  );
}
