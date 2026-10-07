import "@/src/demos/meridian/styles/tokens.css";
import { DemoShell } from "@/src/shared/demo-shell/DemoShell";

type MeridianLayoutProps = Readonly<{ children: React.ReactNode }>;

export default function MeridianLayout({ children }: MeridianLayoutProps) {
  return <div className="meridian-demo">{children}<DemoShell currentDemo="meridian" /></div>;
}
