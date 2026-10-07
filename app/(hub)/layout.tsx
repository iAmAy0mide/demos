import "@/src/demos/hub/styles/tokens.css";

type HubLayoutProps = Readonly<{ children: React.ReactNode }>;

export default function HubLayout({ children }: HubLayoutProps) {
  return <div className="axmion-hub">{children}</div>;
}
