import { ExternalLink } from "lucide-react";
import Link from "next/link";

import type { ComponentProps } from "react";

type DemoLinkProps = ComponentProps<typeof Link>;

export function DemoLink({ children, ...props }: DemoLinkProps) {
  return (
    <Link {...props} target="_blank" rel="noopener noreferrer">
      {children}
      <ExternalLink aria-hidden="true" size="0.8em" strokeWidth={2} />
      <span className="axm-sr-only"> (opens in a new tab)</span>
    </Link>
  );
}
