"use client";

import { motion, useReducedMotion } from "motion/react";

import { PointFieldCanvas } from "@/src/demos/hub/components/PointFieldCanvas";
import { buildContextMessage, buildWhatsAppLink } from "@/src/shared/config/contact";
import { publishedWorks } from "@/src/shared/works";

const chipLabels = ["Landing pages", "Business websites", "Custom tools"];
const revealTransition = { duration: 0.58, ease: [0.2, 0.8, 0.2, 1] as const };

export function HubHero() {
  const reducedMotion = useReducedMotion();
  const reveal = reducedMotion ? { opacity: 1 } : { opacity: 1, clipPath: "inset(0 0 0 0)" };
  return (
    <section className="axm-hero" aria-labelledby="hub-title">
      <PointFieldCanvas />
      <div className="axm-container axm-hero-content">
        <motion.p
          className="axm-eyebrow"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={revealTransition}
        >
          Axmion Web Innovations · Lagos
        </motion.p>
        <h1 id="hub-title" className="axm-hero-title">
          <motion.span
            initial={{ opacity: 0, clipPath: "inset(100% 0 0 0)" }}
            animate={reveal}
            transition={revealTransition}
          >
            Websites that turn
          </motion.span>
          <motion.span
            initial={{ opacity: 0, clipPath: "inset(100% 0 0 0)" }}
            animate={reveal}
            transition={{ ...revealTransition, delay: 0.07 }}
          >
            <em>attention</em> into
          </motion.span>
          <motion.span
            initial={{ opacity: 0, clipPath: "inset(100% 0 0 0)" }}
            animate={reveal}
            transition={{ ...revealTransition, delay: 0.14 }}
          >
            <strong>action.</strong>
          </motion.span>
        </h1>
        <motion.p
          className="axm-hero-subhead"
          initial={{ opacity: 0, y: reducedMotion ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...revealTransition, delay: 0.28 }}
        >
          Landing pages, business websites and custom internal tools, built to get a visitor to do
          one thing.
        </motion.p>
        <motion.div
          className="axm-hero-actions"
          initial={{ opacity: 0, y: reducedMotion ? 0 : 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...revealTransition, delay: 0.36 }}
        >
          <a className="axm-button axm-hero-primary" href="#work">
            See the work
          </a>
          <a
            className="axm-button axm-button-quiet"
            href={buildWhatsAppLink(buildContextMessage())}
            target="_blank"
            rel="noopener noreferrer"
          >
            Start a project
          </a>
        </motion.div>
        <motion.p
          className="axm-proof"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ ...revealTransition, delay: 0.45 }}
        >
          {publishedWorks.length} working concepts. Click everything.
        </motion.p>
        <motion.ul
          className="axm-hero-chips"
          initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...revealTransition, delay: 0.5 }}
        >
          {chipLabels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}
