import Image from "next/image";
import Link from "next/link";

import { AxmionAttribution } from "@/src/shared/components/AxmionAttribution";
import {
  AXMION_DISPLAY_NUMBER,
  buildContextMessage,
  buildTelephoneLink,
  buildWhatsAppLink,
} from "@/src/shared/config/contact";
import { publishedWorks } from "@/src/shared/works";
export function HubFooter() {
  return (
    <footer className="axm-footer">
      <div className="axm-footer-brand">
        <Link href="/" aria-label="Axmion home">
          <Image src="/images/logo-mark-64.png" alt="" width={26} height={26} />
          <span>Axmion</span>
        </Link>
        <p>Websites that turn attention into action.</p>
      </div>
      <nav aria-label="Footer navigation">
        <a href="#work">Work</a>
        <a href="#services">Services</a>
        <a href="#process">Process</a>
        <a href="#contact">Contact</a>
      </nav>
      <nav aria-label="Published work">
        {publishedWorks.map((work) => (
          <Link key={work.id} href={work.route}>
            {work.name}
          </Link>
        ))}
      </nav>
      <div className="axm-footer-contact">
        <a href={buildTelephoneLink()}>{AXMION_DISPLAY_NUMBER}</a>
        <a
          href={buildWhatsAppLink(buildContextMessage())}
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
        <span>Lagos, Nigeria</span>
        <a href="#content">Back to top</a>
      </div>
      <AxmionAttribution tone="onDark" variant="line" />
    </footer>
  );
}
