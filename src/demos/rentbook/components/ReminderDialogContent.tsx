import { buildWhatsAppLinkTo, toInternationalNigerianNumber } from "@/src/shared/config/contact";

import { reminderTones, type ReminderTone } from "../lib/reminders";

type ReminderDetails = {
  name: string;
  phone: string;
  unit: string;
};

type ReminderDialogContentProps = {
  details: ReminderDetails;
  tenantCount: number;
  position: number;
  tone: ReminderTone;
  message: string;
  copyStatus: string;
  dialogRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  onToneChange: (tone: ReminderTone) => void;
  onMessageChange: (message: string) => void;
  onSend: () => void;
  onCopy: () => void;
  onSkip: () => void;
};

export function ReminderDialogContent({
  details,
  tenantCount,
  position,
  tone,
  message,
  copyStatus,
  dialogRef,
  onClose,
  onToneChange,
  onMessageChange,
  onSend,
  onCopy,
  onSkip,
}: ReminderDialogContentProps) {
  const phone = toInternationalNigerianNumber(details.phone);
  return (
    <div className="rbk-dialog rbk-reminder-layer">
      <section
        ref={dialogRef}
        className="rbk-reminder"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reminder-title"
        data-testid="reminder-dialog"
      >
        <header>
          <div>
            <p>{tenantCount > 1 ? `${position + 1} of ${tenantCount}` : "Tenant correspondence"}</p>
            <h2 id="reminder-title">Send rent reminder</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close reminder">
            ×
          </button>
        </header>
        <p className="rbk-reminder-tenant">
          <b>{details.name}</b> · {details.unit}
        </p>
        <label>
          Reminder tone
          <select
            aria-label="Reminder tone"
            value={tone}
            onChange={(event) => onToneChange(event.target.value as ReminderTone)}
          >
            {reminderTones.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          Message
          <textarea
            aria-label="Reminder message"
            value={message}
            onChange={(event) => onMessageChange(event.target.value)}
            rows={7}
          />
        </label>
        <aside className="rbk-chat-preview" aria-label="Message preview">
          <small>WhatsApp preview</small>
          <p>{message}</p>
        </aside>
        {phone ? (
          <a
            className="rbk-primary"
            href={buildWhatsAppLinkTo(phone, message)}
            target="_blank"
            rel="noreferrer"
            onClick={onSend}
          >
            Open in WhatsApp
          </a>
        ) : (
          <p className="rbk-form-error">
            This tenant has no usable Nigerian phone number. Copy the message or update the tenant
            record.
          </p>
        )}
        <footer>
          <button type="button" onClick={onCopy}>
            Copy text
          </button>
          {tenantCount > 1 ? (
            <button type="button" onClick={onSkip}>
              Skip
            </button>
          ) : null}
        </footer>
        <p className="rbk-sr-only" aria-live="polite">
          {copyStatus}
        </p>
      </section>
    </div>
  );
}
