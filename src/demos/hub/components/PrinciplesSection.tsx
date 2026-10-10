"use client";

import { useState } from "react";

import { PrincipleWireframe } from "@/src/demos/hub/components/PrincipleWireframe";
import { principles, type WireframeRegion } from "@/src/demos/hub/data/principles";
import { DemoLink } from "@/src/shared/components/DemoLink";
import { publishedWorks } from "@/src/shared/works";

const INITIAL_REGION: WireframeRegion = "goal";

export function PrinciplesSection() {
  const [activeRegion, setActiveRegion] = useState<WireframeRegion>(INITIAL_REGION);
  const principle = principles.find((item) => item.id === activeRegion) ?? principles[0];
  const isPublished = publishedWorks.some((work) => work.id === principle.workId);
  return (
    <section id="principles" className="axm-principles" aria-labelledby="principles-title">
      <div className="axm-container">
        <p className="axm-eyebrow">Why it converts</p>
        <h2 id="principles-title" className="axm-section-title">
          Anatomy of a page that <em>earns its clicks.</em>
        </h2>
        <div className="axm-principles-grid">
          <PrincipleWireframe activeRegion={activeRegion} onSelect={setActiveRegion} />
          <aside className="axm-principle-panel" aria-live="polite">
            <p className="axm-process-number">{principle.number}</p>
            <h3>{principle.title}</h3>
            <p>{principle.description[0]}</p>
            <p>{principle.description[1]}</p>
            {isPublished && (
              <DemoLink className="axm-button" href={principle.href}>
                {principle.linkLabel}
              </DemoLink>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
