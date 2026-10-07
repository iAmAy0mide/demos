import "@/src/demos/harmattan/styles/tokens.css";
import { DemoShell } from "@/src/shared/demo-shell/DemoShell";

type HarmattanLayoutProps = Readonly<{ children: React.ReactNode }>;

export default function HarmattanLayout({ children }: HarmattanLayoutProps) {
  return <div className="harmattan-demo">{children}<DemoShell currentDemo="harmattan" /></div>;
}
