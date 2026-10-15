"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { useRentbook } from "./RentbookProvider";
import { naira } from "../lib/finance";

import type { MaintenanceRequest } from "../types";

const STATUSES = ["reported", "assigned", "in_progress", "done"] as const;
type Status = (typeof STATUSES)[number];

export function Maintenance() {
  const { state, dispatch } = useRentbook();
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState<Status | "all">("all");
  const [selected, setSelected] = useState<MaintenanceRequest | null>(null);
  const [isNew, setIsNew] = useState(() => searchParams.get("new") === "1");
  const requests = useMemo(
    () =>
      state.maintenance
        .filter((request) => (filter === "all" ? true : request.status === filter))
        .filter(
          (request) =>
            state.selectedPropertyId === "all" ||
            state.units.find((unit) => unit.id === request.unitId)?.propertyId ===
              state.selectedPropertyId,
        ),
    [filter, state],
  );
  return (
    <main className="rbk-page rbk-maintenance" data-testid="maintenance-page">
      <header className="rbk-page-header">
        <div>
          <p>Building care register</p>
          <h1>Maintenance</h1>
          <span>Track requests one accountable handoff at a time.</span>
        </div>
        <button className="rbk-primary" type="button" onClick={() => setIsNew(true)}>
          New request
        </button>
      </header>
      <nav className="rbk-maintenance-tabs" aria-label="Maintenance status">
        {["all", ...STATUSES].map((status) => (
          <button
            key={status}
            type="button"
            aria-pressed={filter === status}
            onClick={() => setFilter(status as Status | "all")}
          >
            {status.replace("_", " ")}{" "}
            <span>
              {status === "all"
                ? state.maintenance.length
                : state.maintenance.filter((request) => request.status === status).length}
            </span>
          </button>
        ))}
      </nav>
      <section className="rbk-maintenance-list">
        {requests.map((request) => (
          <button
            key={request.id}
            type="button"
            className="rbk-maintenance-row"
            onClick={() => setSelected(request)}
          >
            <strong>{request.title}</strong>
            <span>{unitName(request, state)}</span>
            <span className={`rbk-status rbk-status-${request.priority}`}>{request.priority}</span>
            <span>{request.status.replace("_", " ")}</span>
            <span>{naira(request.estimate)}</span>
          </button>
        ))}
      </section>
      {selected ? (
        <MaintenanceSheet
          request={selected}
          onClose={() => setSelected(null)}
          onSave={(request) => {
            dispatch({ type: "update_maintenance", request });
            setSelected(null);
          }}
        />
      ) : null}
      {isNew ? (
        <NewRequest
          onClose={() => setIsNew(false)}
          onSave={(request) => {
            dispatch({ type: "add_maintenance", request });
            setIsNew(false);
          }}
        />
      ) : null}
    </main>
  );
}
function unitName(request: MaintenanceRequest, state: ReturnType<typeof useRentbook>["state"]) {
  const unit = state.units.find((entry) => entry.id === request.unitId);
  const property = state.properties.find((entry) => entry.id === unit?.propertyId);
  return `${unit?.label ?? "Unknown unit"} · ${property?.name ?? ""}`;
}
function MaintenanceSheet({
  request,
  onClose,
  onSave,
}: {
  request: MaintenanceRequest;
  onClose: () => void;
  onSave: (request: MaintenanceRequest) => void;
}) {
  const [draft, setDraft] = useState(request);
  const index = STATUSES.indexOf(draft.status);
  const move = (delta: number) => {
    const next = STATUSES[index + delta];
    if (next) {
      setDraft({ ...draft, status: next });
    }
  };
  return (
    <div className="rbk-dialog">
      <section
        className="rbk-maintenance-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="maintenance-title"
      >
        <button type="button" onClick={onClose}>
          Close
        </button>
        <p>Request detail</p>
        <h2 id="maintenance-title">{draft.title}</h2>
        <label>
          Vendor{" "}
          <input
            value={draft.assignee ?? ""}
            onChange={(event) => setDraft({ ...draft, assignee: event.target.value })}
          />
        </label>
        <label>
          Cost estimate{" "}
          <input
            inputMode="numeric"
            value={draft.estimate}
            onChange={(event) => setDraft({ ...draft, estimate: Number(event.target.value) || 0 })}
          />
        </label>
        <label>
          Notes{" "}
          <textarea
            value={draft.notes ?? ""}
            onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
          />
        </label>
        <div>
          <button type="button" disabled={index === 0} onClick={() => move(-1)}>
            Previous status
          </button>
          <button type="button" disabled={index === STATUSES.length - 1} onClick={() => move(1)}>
            Next status
          </button>
        </div>
        <button className="rbk-primary" type="button" onClick={() => onSave(draft)}>
          Save update
        </button>
      </section>
    </div>
  );
}
function NewRequest({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (request: MaintenanceRequest) => void;
}) {
  const { state } = useRentbook();
  const [unitId, setUnitId] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  function save() {
    if (!unitId) {
      setError("Choose the unit that needs attention.");
      return;
    }
    if (!title.trim()) {
      setError("Describe the request.");
      return;
    }
    onSave({
      id: `maintenance-${crypto.randomUUID()}`,
      unitId,
      title: title.trim(),
      priority: "normal",
      status: "reported",
      estimate: 0,
      createdAt: new Date().toISOString().slice(0, 10),
    });
  }
  return (
    <div className="rbk-dialog">
      <section className="rbk-maintenance-sheet" role="dialog" aria-modal="true">
        <button type="button" onClick={onClose}>
          Close
        </button>
        <h2>New request</h2>
        <label>
          Unit{" "}
          <select value={unitId} onChange={(event) => setUnitId(event.target.value)}>
            <option value="">Select a unit</option>
            {state.units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Request <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
        {error ? (
          <p className="rbk-form-error" role="alert">
            {error}
          </p>
        ) : null}
        <button className="rbk-primary" type="button" onClick={save}>
          Create request
        </button>
      </section>
    </div>
  );
}
