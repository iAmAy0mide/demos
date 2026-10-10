"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useState } from "react";

import { services } from "@/src/demos/hub/data/services";
import { DemoLink } from "@/src/shared/components/DemoLink";
import { buildWhatsAppLink } from "@/src/shared/config/contact";
import { publishedWorks } from "@/src/shared/works";

const INITIAL_SERVICE_ID = services[0].id;

export function ServicesSection() {
  const [openServiceId, setOpenServiceId] = useState<string>(INITIAL_SERVICE_ID);
  const reducedMotion = useReducedMotion();
  return (
    <section id="services" className="axm-services" aria-labelledby="services-title">
      <div className="axm-container">
        <p className="axm-eyebrow">Services</p>
        <h2 id="services-title" className="axm-section-title">
          Three things we build. <em>Each one has a job.</em>
        </h2>
        <p className="axm-section-intro">
          Choose the shape that gives your next important action room to work.
        </p>
        <div className="axm-service-index">
          {services.map((service, index) => {
            const isOpen = service.id === openServiceId;
            const serviceWorks = publishedWorks.filter((work) => service.workIds.includes(work.id));
            return (
              <article key={service.id} className={`axm-service ${isOpen ? "is-open" : ""}`}>
                <button
                  className="axm-service-trigger"
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`${service.id}-panel`}
                  onClick={() => setOpenServiceId(isOpen ? "" : service.id)}
                >
                  <span className="axm-service-number">{String(index + 1).padStart(2, "0")}</span>
                  <span className="axm-service-name">{service.name}</span>
                  <span className="axm-service-kind">{service.kind}</span>
                  <span className="axm-service-promise">{service.promise}</span>
                  <span className="axm-service-icon" aria-hidden="true">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`${service.id}-panel`}
                      className="axm-service-panel"
                      initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
                      transition={{ duration: 0.48, ease: [0.2, 0.8, 0.2, 1] }}
                    >
                      <div className="axm-service-summary">
                        <p className="axm-panel-label">What it is</p>
                        <p>{service.description[0]}</p>
                        <p>{service.description[1]}</p>
                        <p className="axm-panel-label">Built for</p>
                        <p>{service.audience}</p>
                      </div>
                      <div>
                        <p className="axm-panel-label">What you get</p>
                        <ul className="axm-service-deliverables">
                          {service.deliverables.map((deliverable) => (
                            <li key={deliverable}>{deliverable}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="axm-service-work">
                        <p className="axm-panel-label">See it working</p>
                        <div className="axm-service-work-links">
                          {serviceWorks.map((work) => (
                            <DemoLink
                              key={work.id}
                              href={work.route}
                              className="axm-service-work-link"
                            >
                              <Image
                                src={`/previews/${work.id}-desktop.webp`}
                                alt=""
                                width={160}
                                height={90}
                              />
                              <span>{work.name}</span>
                            </DemoLink>
                          ))}
                        </div>
                        <a
                          className="axm-service-talk"
                          href={buildWhatsAppLink(
                            `Hi Axmion, I’d like to talk about a ${service.name.toLowerCase()} project.`,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Talk about this
                        </a>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
