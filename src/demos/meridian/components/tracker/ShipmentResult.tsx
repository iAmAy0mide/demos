import type { Shipment } from "@/src/demos/meridian/types";

type ShipmentResultProps = { shipment: Shipment };

export function ShipmentResult({ shipment }: ShipmentResultProps) {
  return (
    <article className="mrd-shipment">
      <header>
        <div>
          <p className="mrd-mono">
            {shipment.status} / {shipment.mode.toUpperCase()}
          </p>
          <h2>{shipment.id}</h2>
          <p>
            {shipment.cargo} · {shipment.weight} · {shipment.equipment}
          </p>
        </div>
        <strong
          className={`mrd-status mrd-status-${shipment.status.toLowerCase().replaceAll(" ", "-")}`}
        >
          {shipment.status}
        </strong>
      </header>
      <div className="mrd-route-summary">
        <span>{shipment.origin}</span>
        <div>
          <i style={{ width: `${shipment.progress}%` }} />
          <small>{shipment.progress}% movement complete</small>
        </div>
        <span>{shipment.destination}</span>
      </div>
      <div className="mrd-shipment-grid">
        <section>
          <h3>Movement timeline</h3>
          <ol className="mrd-timeline">
            {shipment.events.map((event) => (
              <li
                key={`${event.status}-${event.time}`}
                className={event.complete ? "complete" : ""}
              >
                <span />
                <div>
                  <strong>{event.status}</strong>
                  <p>
                    {event.location}
                    <br />
                    {event.time}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <aside>
          <p className="mrd-mono">EXPECTED MILESTONE</p>
          <h3>{shipment.eta}</h3>
          <p className="mrd-mono">DOCUMENT REGISTER</p>
          {shipment.documents.map((document) => (
            <div className="mrd-document" key={document}>
              <span>{document}</span>
              <button disabled>Demo download</button>
            </div>
          ))}
        </aside>
      </div>
    </article>
  );
}
