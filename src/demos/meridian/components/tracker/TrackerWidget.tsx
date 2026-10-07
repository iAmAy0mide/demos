"use client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { normalizeTrackingNumber } from "@/src/demos/meridian/lib/tracker";
const examples = ["MRD-18472", "MRD-22019", "MRD-17305"];
export function TrackerWidget() { const router = useRouter(); const [value, setValue] = useState(""); const submit = (event: FormEvent) => { event.preventDefault(); router.push(`/work/meridian/track?id=${encodeURIComponent(normalizeTrackingNumber(value))}`); }; return <div className="mrd-tracker-widget"><form onSubmit={submit}><label htmlFor="mrd-home-track">Shipment number</label><div><input id="mrd-home-track" value={value} onChange={(event) => setValue(event.target.value)} placeholder="MRD-18472"/><button type="submit">Locate shipment</button></div></form><p>Try a live demo record: {examples.map((example) => <button key={example} onClick={() => setValue(example)}>{example}</button>)}</p></div>; }
