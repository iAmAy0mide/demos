import "@/src/demos/sunreach/styles/tokens.css";
import { DemoShell } from "@/src/shared/demo-shell/DemoShell";

type SunreachLayoutProps = Readonly<{ children: React.ReactNode }>;

export default function SunreachLayout({ children }: SunreachLayoutProps) {
  return <div className="sunreach-demo">{children}<DemoShell currentDemo="sunreach" /></div>;
}
