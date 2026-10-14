"use client";
import Link from "next/link";
import { useState } from "react";

import { lagosDayOfWeek, lagosHour } from "@/src/shared/lib/lagos-time";
import { useLagosNow } from "@/src/shared/lib/useLagosNow";

import { CoffeeBag } from "./CoffeeBag";
import { CoffeeCard } from "./CoffeeCard";
import { coffees } from "../data/coffees";
import { articles } from "../data/journal";
export function HomePage() {
  const now = useLagosNow();
  const open = now
    ? !["Sat", "Sun"].includes(lagosDayOfWeek(now)) && lagosHour(now) >= 7 && lagosHour(now) < 20
    : false;
  return (
    <main id="main">
      <section className="hrm-hero">
        <div>
          <p className="hrm-kicker">Roasted in Lagos · sent with care</p>
          <h1>Coffee for the part of your day that is still yours.</h1>
          <p>
            Small-lot coffees, roasted every week. For first light, late-night work, and the traffic
            that happens in between.
          </p>
          <div className="hrm-actions">
            <Link className="hrm-button" href="/work/harmattan/subscribe">
              Start a subscription
            </Link>
            <Link className="hrm-link" href="/work/harmattan/coffees">
              Shop coffees
            </Link>
          </div>
        </div>
        <div className="hrm-hero-art" aria-hidden="true">
          <div className="hrm-sun" />
          <div className="hrm-cup">
            H<br />
            <small>slow down</small>
          </div>
          <i />
          <i />
          <i />
        </div>
      </section>
      <section className="hrm-section">
        <p className="hrm-kicker">This month’s roasts</p>
        <h2>Six cups worth leaving the duvet for.</h2>
        <div className="hrm-coffee-grid">
          {coffees.slice(0, 3).map((coffee) => (
            <CoffeeCard coffee={coffee} key={coffee.slug} />
          ))}
        </div>
      </section>
      <section className="hrm-box-tease">
        <div>
          <p className="hrm-kicker">The box</p>
          <h2>Better coffee is a very good habit.</h2>
          <p>Pick your taste, pace and delivery day. Pause whenever life gets loud.</p>
          <Link className="hrm-button" href="/work/harmattan/subscribe">
            Build your box
          </Link>
        </div>
        <div className="hrm-box-art">
          {coffees.slice(0, 2).map((coffee) => (
            <CoffeeBag key={coffee.slug} coffee={coffee} small />
          ))}
        </div>
      </section>
      <section className="hrm-section hrm-dark">
        <p className="hrm-kicker">From farm to cup</p>
        <h2>Good coffee is a chain of careful hands.</h2>
        <p>
          We begin on the Mambilla Plateau, linger at the roaster, then find our way to your
          kitchen.
        </p>
        <Link className="hrm-link" href="/work/harmattan/story">
          Read the long version
        </Link>
      </section>
      <section className="hrm-section">
        <p className="hrm-kicker">At the café</p>
        <h2>Six places to sit down properly.</h2>
        <div className="hrm-locations">
          {["Victoria Island", "Lekki Phase 1", "Ikeja GRA", "Yaba", "Wuse 2", "Maitama"].map(
            (place, index) => (
              <p key={place}>
                <b>{place}</b>
                <span>
                  {index < 4 ? "Lagos" : "Abuja"} ·{" "}
                  {open ? "Open now · 7am–8pm" : "Closed · 7am–8pm"}
                </span>
              </p>
            ),
          )}
        </div>
      </section>
      <section className="hrm-section">
        <p className="hrm-kicker">From the journal</p>
        <div className="hrm-journal-grid">
          {articles.map((article) => (
            <article key={article.slug}>
              <p>{article.minutes} min read</p>
              <h3>{article.title}</h3>
              <p>{article.dek}</p>
              <Link href={`/work/harmattan/journal/${article.slug}`}>Read it</Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
export function CoffeeList() {
  const [roast, setRoast] = useState("All"),
    [note, setNote] = useState("All");
  const filtered = coffees.filter(
    (coffee) =>
      (roast === "All" || coffee.roast === roast) &&
      (note === "All" || coffee.notes.includes(note)),
  );
  return (
    <main id="main" className="hrm-page">
      <p className="hrm-kicker">The coffee shelf</p>
      <h1>Find your next everyday cup.</h1>
      <div className="hrm-filters">
        <label>
          Roast
          <select value={roast} onChange={(event) => setRoast(event.target.value)}>
            <option>All</option>
            <option>Light</option>
            <option>Medium</option>
            <option>Dark</option>
          </select>
        </label>
        <label>
          Tasting note
          <select value={note} onChange={(event) => setNote(event.target.value)}>
            <option>All</option>
            {[
              "citrus",
              "berry",
              "chocolate",
              "caramel",
              "floral",
              "nutty",
              "spice",
              "tropical",
            ].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>
      {filtered.length ? (
        <div className="hrm-coffee-grid">
          {filtered.map((coffee) => (
            <CoffeeCard coffee={coffee} key={coffee.slug} />
          ))}
        </div>
      ) : (
        <p className="hrm-empty">Nothing there yet. Try a broader taste.</p>
      )}
    </main>
  );
}
