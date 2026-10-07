import Link from "next/link";

import type { DemoRouteId } from "./demoRoutes";
import { getAdjacentDemo } from "./demoRoutes";
import styles from "./DemoShell.module.css";

type DemoShellProps = { currentDemo: DemoRouteId };

export function DemoShell({ currentDemo }: DemoShellProps) {
  const previousDemo = getAdjacentDemo(currentDemo, -1);
  const nextDemo = getAdjacentDemo(currentDemo, 1);

  return (
    <aside className={styles.shell} aria-label="Axmion concept navigation">
      <Link className={styles.link} href="/">
        <span aria-hidden="true">←</span><span>Back to showcase</span>
      </Link>
      <details className={styles.disclosure}>
        <summary aria-label="About this demo">Axmion</summary>
        <span className={styles.conceptLabel}>Concept work by Axmion</span>
      </details>
      <nav aria-label="Browse other concept work">
        <Link className={styles.link} href={previousDemo.path}>
          <span aria-hidden="true">←</span><span className={styles.compactLabel}>{previousDemo.name}</span>
        </Link>
        <Link className={styles.link} href={nextDemo.path}>
          <span className={styles.compactLabel}>Next work</span><span aria-hidden="true">→</span>
        </Link>
      </nav>
    </aside>
  );
}
