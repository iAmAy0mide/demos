import { allocatePayment, naira } from "../lib/finance";

import type { PaymentMethod, Tenant } from "../types";

type PaymentFormProps = {
  tenants: Tenant[];
  tenantQuery: string;
  amountInput: string;
  date: string;
  method: PaymentMethod;
  reference: string;
  notes: string;
  errors: Partial<Record<"tenant" | "amount" | "reference", string>>;
  charges: { id: string; description: string }[];
  preview: ReturnType<typeof allocatePayment> | null;
  keepCredit: boolean;
  onTenantQueryChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onAmountBlur: () => void;
  onDateChange: (value: string) => void;
  onMethodChange: (value: PaymentMethod) => void;
  onReferenceChange: (value: string) => void;
  onReferenceBlur: () => void;
  onNotesChange: (value: string) => void;
  onKeepCreditChange: (value: boolean) => void;
  onCancel: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};
const REFERENCE_METHODS: PaymentMethod[] = ["bank_transfer", "pos", "cheque"];
export function PaymentForm(props: PaymentFormProps) {
  const {
    tenants,
    tenantQuery,
    amountInput,
    date,
    method,
    reference,
    notes,
    errors,
    charges,
    preview,
    keepCredit,
    onTenantQueryChange,
    onAmountChange,
    onAmountBlur,
    onDateChange,
    onMethodChange,
    onReferenceChange,
    onReferenceBlur,
    onNotesChange,
    onKeepCreditChange,
    onCancel,
    onSubmit,
  } = props;
  return (
    <form onSubmit={onSubmit} noValidate>
      <label>
        Tenant{" "}
        <input
          name="tenant"
          role="combobox"
          aria-autocomplete="list"
          aria-controls="rentbook-tenants"
          aria-expanded="false"
          list="rentbook-tenants"
          value={tenantQuery}
          onChange={(event) => onTenantQueryChange(event.target.value)}
          aria-describedby={errors.tenant ? "tenant-error" : undefined}
          placeholder="Search tenant"
        />
        <datalist id="rentbook-tenants">
          {tenants.map((item) => (
            <option key={item.id} value={item.name} />
          ))}
        </datalist>
      </label>
      {errors.tenant ? (
        <p id="tenant-error" className="rbk-form-error">
          {errors.tenant}
        </p>
      ) : null}
      <div className="rbk-payment-field-grid">
        <label>
          Amount{" "}
          <input
            name="amount"
            inputMode="decimal"
            className="rbk-money-input"
            value={amountInput}
            onBlur={onAmountBlur}
            onChange={(event) => onAmountChange(event.target.value)}
            placeholder="1,500,000 or 1.5m"
            aria-describedby={errors.amount ? "amount-error" : undefined}
          />
        </label>
        <label>
          Date{" "}
          <input type="date" value={date} onChange={(event) => onDateChange(event.target.value)} />
        </label>
      </div>
      {errors.amount ? (
        <p id="amount-error" className="rbk-form-error">
          {errors.amount}
        </p>
      ) : null}
      <div className="rbk-payment-field-grid">
        <label>
          Method{" "}
          <select
            value={method}
            onChange={(event) => onMethodChange(event.target.value as PaymentMethod)}
          >
            <option value="cash">Cash</option>
            <option value="bank_transfer">Transfer</option>
            <option value="pos">POS</option>
            <option value="cheque">Cheque</option>
          </select>
        </label>
        <label>
          Reference{" "}
          {REFERENCE_METHODS.includes(method) ? (
            <input
              name="reference"
              value={reference}
              onBlur={onReferenceBlur}
              onChange={(event) => onReferenceChange(event.target.value)}
              aria-describedby={errors.reference ? "reference-error" : undefined}
            />
          ) : (
            <input value="Not required for cash" disabled />
          )}
        </label>
      </div>
      {errors.reference ? (
        <p id="reference-error" className="rbk-form-error">
          {errors.reference}
        </p>
      ) : null}
      <label>
        Notes{" "}
        <textarea value={notes} onChange={(event) => onNotesChange(event.target.value)} rows={2} />
      </label>
      <PaymentPreview
        charges={charges}
        preview={preview}
        keepCredit={keepCredit}
        onKeepCredit={onKeepCreditChange}
      />
      <footer>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="rbk-primary" type="submit">
          Save payment
        </button>
      </footer>
    </form>
  );
}
function PaymentPreview({
  charges,
  preview,
  keepCredit,
  onKeepCredit,
}: {
  charges: { id: string; description: string }[];
  preview: ReturnType<typeof allocatePayment> | null;
  keepCredit: boolean;
  onKeepCredit: (value: boolean) => void;
}) {
  if (!preview) {
    return (
      <aside className="rbk-allocation-preview">
        <b>Allocation preview</b>
        <p>Enter an amount to see how it applies oldest first.</p>
      </aside>
    );
  }
  return (
    <aside className="rbk-allocation-preview">
      <b>Allocation preview</b>
      {preview.allocations.length ? (
        <ul>
          {preview.allocations.map((allocation) => (
            <li key={allocation.chargeId}>
              <span>{charges.find((item) => item.id === allocation.chargeId)?.description}</span>
              <strong>{naira(allocation.amount)}</strong>
            </li>
          ))}
        </ul>
      ) : (
        <p>No outstanding charges for this tenant.</p>
      )}
      <p>
        Remaining balance <strong>{naira(preview.remainingBalance)}</strong>
      </p>
      {preview.creditAmount > 0 ? (
        <label className="rbk-credit-toggle">
          <input
            type="checkbox"
            checked={keepCredit}
            onChange={(event) => onKeepCredit(event.target.checked)}
          />{" "}
          Keep the extra {naira(preview.creditAmount)} as credit
        </label>
      ) : null}
    </aside>
  );
}
