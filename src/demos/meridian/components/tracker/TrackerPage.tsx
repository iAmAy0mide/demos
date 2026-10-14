"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import {
  findShipment,
  isTrackingNumber,
  normalizeTrackingNumber,
} from "@/src/demos/meridian/lib/tracker";

import { TrackerState } from "./TrackerState";
const examples = ["MRD-18472", "MRD-22019", "MRD-17305", "MRD-19488"];
export function TrackerPage() {
  const router = useRouter();
  const params = useSearchParams();
  const requested = params.get("id") ?? "";
  const [value, setValue] = useState(requested);
  const [loading, setLoading] = useState(false);
  const normalized = normalizeTrackingNumber(requested);
  const formatError = Boolean(requested) && !isTrackingNumber(normalized);
  const shipment = findShipment(normalized);
  useEffect(() => {
    if (!requested || formatError || shipment) {
      return;
    }
    const timeout = window.setTimeout(() => setLoading(false), 0);
    return () => window.clearTimeout(timeout);
  }, [requested, formatError, shipment]);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    window.setTimeout(
      () =>
        router.push(
          `/work/meridian/track?id=${encodeURIComponent(normalizeTrackingNumber(value))}`,
        ),
      450,
    );
  };
  return (
    <section className="mrd-page">
      <div className="mrd-page-intro">
        <p className="mrd-mono">SHIPMENT TRACKER / LIVE DEMO</p>
        <h1>Find the cargo record.</h1>
        <p>
          Search a Meridian reference. Each result is a shareable movement record, not a generic
          status label.
        </p>
      </div>
      <form className="mrd-track-form" onSubmit={submit}>
        <label htmlFor="tracking-number">Shipment number</label>
        <div>
          <input
            id="tracking-number"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="MRD-18472"
            aria-describedby="tracking-help"
          />
          <button type="submit">Track shipment</button>
        </div>
        <p id="tracking-help">
          Demo records:{" "}
          {examples.map((example) => (
            <button type="button" key={example} onClick={() => setValue(example)}>
              {example}
            </button>
          ))}
        </p>
      </form>
      <TrackerState
        requested={requested}
        isLoading={loading}
        hasFormatError={formatError}
        shipment={shipment}
      />
    </section>
  );
}
