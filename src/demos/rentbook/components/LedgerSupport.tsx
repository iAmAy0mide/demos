"use client";

import { lagosDateKey } from "@/src/shared/lib/lagos-time";

import { useRentbook } from "./RentbookProvider";
import { formatRentbookDate } from "../lib/finance";
import { buildLedger } from "../lib/ledger";

type LedgerSupportProps = {
  rows: ReturnType<typeof buildLedger>;
  tenantId: string;
  now: Date;
};

export function LedgerSupport({ rows, tenantId, now }: LedgerSupportProps) {
  const { state, dispatch } = useRentbook();
  const activity = state.activity.filter((entry) => entry.tenantId === tenantId);
  const saveNote = (form: HTMLFormElement) => {
    const note = new FormData(form).get("note")?.toString().trim();
    if (!note) {
      return;
    }
    dispatch({ type: "add_note", tenantId, note, date: lagosDateKey(now) });
    form.reset();
  };

  return (
    <div className="rbk-ledger-support">
      <section>
        <h2>Account timeline</h2>
        <ol className="rbk-timeline">
          {rows
            .slice(-5)
            .reverse()
            .map((row) => (
              <li key={row.id}>
                <time>{formatRentbookDate(row.date)}</time>
                <span>{row.description}</span>
              </li>
            ))}
        </ol>
      </section>
      <section>
        <h2>Activity & notes</h2>
        <div className="rbk-activity">
          {activity.map((entry) => (
            <p key={entry.id}>
              <time>{formatRentbookDate(entry.date)}</time>
              {entry.message}
            </p>
          ))}
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            saveNote(event.currentTarget);
          }}
        >
          <label>
            Add a note
            <textarea name="note" />
          </label>
          <button type="submit">Save note</button>
        </form>
      </section>
    </div>
  );
}
