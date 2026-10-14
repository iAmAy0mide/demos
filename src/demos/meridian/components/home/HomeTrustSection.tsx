import Link from "next/link";

export function HomeTrustSection() {
  return (
    <>
      <section className="mrd-section mrd-dark mrd-trust">
        <div>
          <p className="mrd-mono">VERIFIED OPERATING PRACTICE</p>
          <h2>There is no substitute for a clear cargo record.</h2>
          <p>
            Every movement has a named desk, a documented milestone plan and escalation before a
            delay becomes a surprise.
          </p>
        </div>
        <div className="mrd-stamps">
          <span>
            NSC
            <br />
            FORWARDER
          </span>
          <span>
            ISO
            <br />
            LOGISTICS
          </span>
          <span>
            WCA
            <br />
            NETWORK
          </span>
        </div>
        <blockquote>
          “Meridian’s update arrived before our team had to ask. That is the difference when a
          production line is waiting.”<cite>Chinwe Okafor, Procurement Director</cite>
        </blockquote>
      </section>
      <section className="mrd-final">
        <p className="mrd-mono">QUOTE DESK / RESPONSE WITHIN 4 WORKING HOURS</p>
        <h2>Put the shipment on a controlled path.</h2>
        <Link className="mrd-button mrd-button-orange" href="/work/meridian/quote">
          Start a quote request
        </Link>
      </section>
    </>
  );
}
