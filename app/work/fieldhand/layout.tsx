import "@/src/demos/fieldhand/styles/tokens.css";
import { DemoShell } from "@/src/shared/demo-shell/DemoShell";

type FieldhandLayoutProps = Readonly<{ children: React.ReactNode }>;

export default function FieldhandLayout({ children }: FieldhandLayoutProps) {
  return <div className="fieldhand-demo">{children}<DemoShell currentDemo="fieldhand" /></div>;
}
