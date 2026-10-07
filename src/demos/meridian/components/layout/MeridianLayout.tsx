import { MeridianFooter } from "@/src/demos/meridian/components/layout/MeridianFooter";
import { MeridianHeader } from "@/src/demos/meridian/components/layout/MeridianHeader";
type Props = Readonly<{ children: React.ReactNode }>;
export function MeridianLayout({ children }: Props) { return <><a className="mrd-skip" href="#main-content">Skip to content</a><MeridianHeader/><main id="main-content">{children}</main><MeridianFooter/></>; }
