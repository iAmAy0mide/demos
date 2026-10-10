"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { processSteps } from "@/src/demos/hub/data/process";

export function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start center", "end center"],
  });
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);
  useEffect(() => {
    const steps = sectionRef.current?.querySelectorAll<HTMLElement>("[data-process-step]");
    if (!steps) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
        if (visible[0]) {
          setActiveStep(Number(visible[0].target.getAttribute("data-process-step")));
        }
      },
      { rootMargin: "-42% 0px -42% 0px" },
    );
    steps.forEach((step) => observer.observe(step));
    return () => observer.disconnect();
  }, []);
  return (
    <section ref={sectionRef} id="process" className="axm-process" aria-labelledby="process-title">
      <div className="axm-container axm-process-grid">
        <div className="axm-process-intro">
          <p className="axm-eyebrow">Process</p>
          <h2 id="process-title" className="axm-section-title">
            How a project <em>runs.</em>
          </h2>
          <p className="axm-section-intro">
            A close working process, with the right decision made before the next one is needed.
          </p>
        </div>
        <ol className="axm-process-steps">
          <motion.span
            className="axm-process-line"
            aria-hidden="true"
            style={{ scaleY: reducedMotion ? 1 : scaleY }}
          />
          {processSteps.map((step, index) => (
            <li
              key={step.number}
              data-process-step={index}
              className={activeStep === index ? "is-active" : ""}
            >
              <span className="axm-process-node" aria-hidden="true" />
              <p className="axm-process-number">{step.number}</p>
              <h3>{step.title}</h3>
              <dl>
                <div>
                  <dt>What we do</dt>
                  <dd>{step.whatWeDo}</dd>
                </div>
                <div>
                  <dt>What we need from you</dt>
                  <dd>{step.whatWeNeed}</dd>
                </div>
                <div>
                  <dt>What you get</dt>
                  <dd>{step.whatYouGet}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
