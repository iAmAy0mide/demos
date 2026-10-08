"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { CaseStudySection } from "@/src/demos/hub/components/CaseStudySection";
import { WorkMiniIndex } from "@/src/demos/hub/components/WorkMiniIndex";
import { publishedWorks, type Work } from "@/src/shared/works";

export function SelectedWork() {
  const [activeId, setActiveId] = useState<Work["id"]>(publishedWorks[0].id);
  const [isInView, setIsInView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const activate = useCallback((id: Work["id"]) => setActiveId(id), []);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting));
    observer.observe(section);
    return () => observer.disconnect();
  }, []);
  return (
    <section ref={sectionRef} id="work" className="axm-work" aria-labelledby="work-title">
      <div className="axm-container">
        <p className="axm-eyebrow">Selected work</p>
        <h2 id="work-title" className="axm-work-title">
          {publishedWorks.length} concepts. One idea: make the next click matter.
        </h2>
        <p className="axm-work-intro">
          Fictional brands, real mechanics. Open any of them and use it.
        </p>
      </div>
      {isInView && <WorkMiniIndex works={publishedWorks} activeId={activeId} />}
      <div className="axm-container axm-case-list">
        {publishedWorks.map((work, index) => (
          <CaseStudySection
            key={work.id}
            work={work}
            index={index + 1}
            isActive={activeId === work.id}
            onActivate={activate}
          />
        ))}
      </div>
    </section>
  );
}
