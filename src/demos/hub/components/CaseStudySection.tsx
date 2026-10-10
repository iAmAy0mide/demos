import { PreviewFrame } from "@/src/demos/hub/components/PreviewFrame";
import { caseStudies } from "@/src/demos/hub/data/case-studies";
import { DemoLink } from "@/src/shared/components/DemoLink";
import { buildContextMessage, buildWhatsAppLink } from "@/src/shared/config/contact";
import type { Work } from "@/src/shared/works";

type CaseStudySectionProps = {
  work: Work;
  index: number;
  isActive: boolean;
  onActivate: (id: Work["id"]) => void;
};

export function CaseStudySection({ work, index, isActive, onActivate }: CaseStudySectionProps) {
  const study = caseStudies[work.id];
  return (
    <article
      className={`axm-case-study ${index % 2 === 0 ? "is-reversed" : ""}`}
      id={`work-${work.id}`}
    >
      <div className="axm-case-copy">
        <div className="axm-case-topline">
          <span>{String(index).padStart(2, "0")}</span>
          <p>{work.kind}</p>
        </div>
        <p className="axm-case-client">{study.clientType}</p>
        <h2>{work.name}</h2>
        <p className="axm-case-pitch">{work.description}</p>
        <dl className="axm-case-details">
          <div>
            <dt>The problem</dt>
            <dd>{study.problem}</dd>
          </div>
          <div>
            <dt>What we built</dt>
            <dd>{study.whatWeBuilt}</dd>
          </div>
        </dl>
        <div className="axm-notice">
          <h3>What to notice</h3>
          <ol>
            {study.whatToNotice.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </div>
        <p className="axm-case-reason">{study.whyItConverts}</p>
        <div className="axm-case-actions">
          <DemoLink className="axm-button" href={work.route}>
            Open live demo
          </DemoLink>
          <a
            href={buildWhatsAppLink(buildContextMessage(work.name))}
            target="_blank"
            rel="noopener noreferrer"
          >
            Get one like this
          </a>
          {work.id === "sunreach" && (
            <DemoLink href="/work/sunreach?annotations=1">See why it converts</DemoLink>
          )}
        </div>
      </div>
      <PreviewFrame work={work} isActive={isActive} onActivate={onActivate} />
    </article>
  );
}
