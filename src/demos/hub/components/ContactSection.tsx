"use client";

import { useRef, useState } from "react";

import {
  BRIEF_TEXT_LIMIT,
  buildBriefMessage,
  getBriefErrors,
  isBriefValid,
  type BriefInput,
} from "@/src/demos/hub/lib/briefMessage";
import {
  AXMION_DISPLAY_NUMBER,
  buildTelephoneLink,
  buildWhatsAppLink,
} from "@/src/shared/config/contact";
import { publishedWorks } from "@/src/shared/works";

const initialBrief: BriefInput = {
  name: "",
  businessName: "",
  projectType: "",
  inspiration: [],
  visitorAction: "",
  startTiming: "",
  link: "",
};
const projectTypes = ["Landing page", "Business website", "Internal tool", "Not sure"];

export function ContactSection() {
  const [brief, setBrief] = useState<BriefInput>(initialBrief);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isSent, setIsSent] = useState(false);
  const [notice, setNotice] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const message = buildBriefMessage(brief);
  const errors = getBriefErrors(brief);
  const update = (key: keyof BriefInput, value: string | readonly string[]) =>
    setBrief((current) => ({ ...current, [key]: value }));
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched({
      name: true,
      businessName: true,
      projectType: true,
      visitorAction: true,
      link: true,
    });
    if (!isBriefValid(brief) || errors.link) {
      formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }
    window.open(buildWhatsAppLink(message), "_blank", "noopener,noreferrer");
    setIsSent(true);
  };
  const copyBrief = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setNotice("Brief copied. Paste it into any message.");
    } catch {
      setNotice("Copy the preview text manually; your browser did not allow clipboard access.");
    }
  };
  const showError = (field: keyof typeof errors) => touched[field] && errors[field];
  if (isSent) {
    return (
      <section id="contact" className="axm-contact">
        <div className="axm-container axm-contact-confirm" role="status">
          <p className="axm-eyebrow">CONTACT</p>
          <h2 className="axm-section-title">Your message is ready in WhatsApp.</h2>
          <p>If it didn&apos;t open, copy the brief or call {AXMION_DISPLAY_NUMBER}.</p>
          <button
            className="axm-button"
            type="button"
            onClick={() => {
              setBrief(initialBrief);
              setTouched({});
              setIsSent(false);
            }}
          >
            Start over
          </button>
        </div>
      </section>
    );
  }
  return (
    <section id="contact" className="axm-contact" aria-labelledby="contact-title">
      <div className="axm-container">
        <p className="axm-eyebrow">CONTACT</p>
        <h2 id="contact-title" className="axm-section-title">
          Tell us the one thing you want visitors to do.
        </h2>
        <p className="axm-section-intro">
          A short brief is enough to start the useful conversation.
        </p>
        <div className="axm-contact-grid">
          <form ref={formRef} className="axm-brief-form" noValidate onSubmit={submit}>
            <Field
              label="Your name"
              id="name"
              value={brief.name}
              error={showError("name")}
              onChange={(value) => update("name", value)}
              onBlur={() => setTouched((v) => ({ ...v, name: true }))}
            />
            <Field
              label="Business name"
              id="businessName"
              value={brief.businessName}
              error={showError("businessName")}
              onChange={(value) => update("businessName", value)}
              onBlur={() => setTouched((v) => ({ ...v, businessName: true }))}
            />
            <fieldset>
              <legend>What do you need?</legend>
              <div className="axm-segments">
                {projectTypes.map((type) => (
                  <button
                    className={brief.projectType === type ? "is-selected" : ""}
                    type="button"
                    key={type}
                    onClick={() => {
                      update("projectType", type);
                      setTouched((v) => ({ ...v, projectType: true }));
                    }}
                  >
                    {type}
                  </button>
                ))}
              </div>
              {showError("projectType") && <p className="axm-field-error">{errors.projectType}</p>}
            </fieldset>
            <fieldset>
              <legend>I want something like...</legend>
              <div className="axm-chips">
                {publishedWorks.map((work) => (
                  <button
                    type="button"
                    className={brief.inspiration.includes(work.name) ? "is-selected" : ""}
                    key={work.id}
                    onClick={() =>
                      update(
                        "inspiration",
                        brief.inspiration.includes(work.name)
                          ? brief.inspiration.filter((name) => name !== work.name)
                          : [...brief.inspiration, work.name],
                      )
                    }
                  >
                    {work.name}
                  </button>
                ))}
              </div>
            </fieldset>
            <label htmlFor="visitorAction">The one thing a visitor should do</label>
            <textarea
              id="visitorAction"
              value={brief.visitorAction}
              aria-invalid={Boolean(showError("visitorAction"))}
              aria-describedby="visitorAction-error visitorAction-count"
              maxLength={BRIEF_TEXT_LIMIT}
              onChange={(event) => update("visitorAction", event.target.value)}
              onBlur={() => setTouched((v) => ({ ...v, visitorAction: true }))}
            />
            <p id="visitorAction-count" className="axm-field-hint">
              {brief.visitorAction.length}/{BRIEF_TEXT_LIMIT}
            </p>
            {showError("visitorAction") && (
              <p id="visitorAction-error" className="axm-field-error">
                {errors.visitorAction}
              </p>
            )}
            <label htmlFor="startTiming">When do you want to start?</label>
            <select
              id="startTiming"
              value={brief.startTiming}
              onChange={(event) => update("startTiming", event.target.value)}
            >
              <option value="">Choose a timing</option>
              <option>This month</option>
              <option>Next month</option>
              <option>Just exploring</option>
            </select>
            <Field
              label="Website or Instagram link"
              id="link"
              value={brief.link}
              error={showError("link")}
              onChange={(value) => update("link", value)}
              onBlur={() => setTouched((v) => ({ ...v, link: true }))}
            />
            <div className="axm-brief-actions">
              <button
                className="axm-button"
                aria-disabled={!isBriefValid(brief) || Boolean(errors.link)}
                type="submit"
              >
                Send on WhatsApp
              </button>
              <button className="axm-copy-button" type="button" onClick={copyBrief}>
                Copy brief
              </button>
            </div>
            {!isBriefValid(brief) && (
              <p className="axm-field-hint">
                Still needed: business name, project type and visitor action.
              </p>
            )}
            <p className="axm-contact-links">
              <a href={buildTelephoneLink()}>Call {AXMION_DISPLAY_NUMBER}</a>
              <a href={buildWhatsAppLink(message)} target="_blank" rel="noopener noreferrer">
                WhatsApp
              </a>
            </p>
            <p className="axm-sr-status" aria-live="polite">
              {notice}
            </p>
          </form>
          <aside className="axm-brief-preview" aria-label="WhatsApp brief preview">
            <p>
              Axmion Web Innovations <span>now</span>
            </p>
            <div>{message}</div>
          </aside>
        </div>
      </div>
    </section>
  );
}

type FieldProps = {
  label: string;
  id: string;
  value: string;
  error: string | false;
  onChange: (value: string) => void;
  onBlur: () => void;
};
function Field({ label, id, value, error, onChange, onBlur }: FieldProps) {
  return (
    <div className="axm-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        value={value}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      />
      {error && (
        <p id={`${id}-error`} className="axm-field-error">
          {error}
        </p>
      )}
    </div>
  );
}
