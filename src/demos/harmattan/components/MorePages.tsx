"use client";
import Link from "next/link";
import { useState } from "react";

import { CoffeeBag } from "./CoffeeBag";
import { coffees } from "../data/coffees";
import { articles } from "../data/journal";

import type { Coffee, JournalArticle } from "../types";

export function CoffeeDetail({ coffee }: { coffee: Coffee }) {
  const [size, setSize] = useState<"250g" | "1kg">("250g");
  return (
    <main id="main" className="hrm-page hrm-detail">
      <CoffeeBag coffee={coffee} />
      <section>
        <p className="hrm-kicker">
          {coffee.origin} · {coffee.region} · {coffee.roast}
        </p>
        <h1>{coffee.name}</h1>
        <p>{coffee.description}</p>
        <p className="hrm-notes">{coffee.notes.join(" · ")}</p>
        <label>
          Bag size
          <select value={size} onChange={(event) => setSize(event.target.value as typeof size)}>
            <option>250g</option>
            <option>1kg</option>
          </select>
        </label>
        <div className="hrm-actions">
          <Link className="hrm-button" href={`/work/harmattan/subscribe?coffee=${coffee.slug}`}>
            Add to my box
          </Link>
          <Link className="hrm-link" href="/work/harmattan/roast-lab">
            See roast profile
          </Link>
        </div>
        <h2>Made for</h2>
        <p>{coffee.brew}</p>
      </section>
    </main>
  );
}

export function RoastLab() {
  const [active, setActive] = useState(coffees[0]);
  const [roast, setRoast] = useState(3);
  return (
    <main id="main" className="hrm-page">
      <p className="hrm-kicker">Roast lab</p>
      <h1>A little science for your next cup.</h1>
      <div className="hrm-lab">
        <section>
          <label>
            Choose coffee
            <select
              value={active.slug}
              onChange={(event) =>
                setActive(
                  coffees.find((coffee) => coffee.slug === event.target.value) ?? coffees[0],
                )
              }
            >
              {coffees.map((coffee) => (
                <option key={coffee.slug} value={coffee.slug}>
                  {coffee.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Roast: light to dark
            <input
              type="range"
              min="1"
              max="5"
              value={roast}
              onChange={(event) => setRoast(Number(event.target.value))}
            />
          </label>
          <p aria-live="polite">{getRoastDescription(roast)}</p>
        </section>
        <section className="hrm-radar">
          <svg viewBox="0 0 300 300" role="img" aria-label={`Profile for ${active.name}`}>
            <circle cx="150" cy="150" r="112" />
            <circle cx="150" cy="150" r="75" />
            <circle cx="150" cy="150" r="38" />
            {Object.entries(active.profile).map(([key, value], index) => {
              const angle = -Math.PI / 2 + (index * Math.PI) / 3;
              return (
                <g key={key}>
                  <line
                    x1="150"
                    y1="150"
                    x2={150 + Math.cos(angle) * 112}
                    y2={150 + Math.sin(angle) * 112}
                  />
                  <circle
                    cx={150 + Math.cos(angle) * value * 21}
                    cy={150 + Math.sin(angle) * value * 21}
                    r="5"
                  />
                  <text x={150 + Math.cos(angle) * 133} y={150 + Math.sin(angle) * 133}>
                    {key}
                  </text>
                </g>
              );
            })}
          </svg>
          <ul>
            {Object.entries(active.profile).map(([key, value]) => (
              <li key={key}>
                {key}: {value}/5
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}

function getRoastDescription(roast: number) {
  if (roast < 3) {
    return "Bright acidity and a clean finish.";
  }
  if (roast > 3) {
    return "Round body, cocoa depth and more bitterness.";
  }
  return "A sweet, balanced middle ground.";
}

const cafes = [
  ["Victoria Island", "Lagos", "12B Idejo Street", "wifi · power · outdoor seating"],
  ["Lekki Phase 1", "Lagos", "24 Admiralty Way", "wifi · parking"],
  ["Ikeja GRA", "Lagos", "8 Joel Ogunnaike", "power · parking"],
  ["Yaba", "Lagos", "19A Herbert Macaulay", "wifi · pet friendly"],
  ["Wuse 2", "Abuja", "14 Adetokunbo Crescent", "wifi · power"],
  ["Maitama", "Abuja", "5 Aguiyi Ironsi Street", "outdoor seating · parking"],
];
export function CafesPage() {
  const [city, setCity] = useState("All");
  const filtered = cafes.filter((cafe) => city === "All" || cafe[1] === city);
  return (
    <main id="main" className="hrm-page">
      <p className="hrm-kicker">Cafés</p>
      <h1>Meet us where the coffee is warm.</h1>
      <label>
        City
        <select value={city} onChange={(event) => setCity(event.target.value)}>
          <option>All</option>
          <option>Lagos</option>
          <option>Abuja</option>
        </select>
      </label>
      <div className="hrm-cafes">
        <div className="hrm-map" aria-label="Stylized map of Lagos and Abuja">
          {filtered.map((cafe, index) => (
            <button
              key={cafe[0]}
              style={{ left: `${18 + index * 12}%`, top: `${25 + (index % 3) * 25}%` }}
              aria-label={`Select ${cafe[0]}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <div>
          {filtered.map((cafe) => (
            <article key={cafe[0]}>
              <h2>{cafe[0]}</h2>
              <p>
                {cafe[2]} · {cafe[1]}
              </p>
              <p>{cafe[3]}</p>
              <b>Open now · closes 8pm</b>
              <p>
                <a href="tel:+2348000000000">Call</a> ·{" "}
                <a href="https://maps.google.com">Get directions</a>
              </p>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

export function JournalIndex() {
  return (
    <main id="main" className="hrm-page">
      <p className="hrm-kicker">Journal</p>
      <h1>Ways to make a better cup.</h1>
      <div className="hrm-journal-grid">
        {articles.map((article) => (
          <article key={article.slug}>
            <p>{article.minutes} min read</p>
            <h2>{article.title}</h2>
            <p>{article.dek}</p>
            <Link href={`/work/harmattan/journal/${article.slug}`}>Read the guide</Link>
          </article>
        ))}
      </div>
    </main>
  );
}
export function ArticlePage({ article }: { article: JournalArticle }) {
  return (
    <main id="main" className="hrm-article">
      <p className="hrm-kicker">Journal · {article.minutes} min read</p>
      <h1>{article.title}</h1>
      <p className="hrm-dek">{article.dek}</p>
      {article.blocks.map(renderArticleBlock)}
    </main>
  );
}

function renderArticleBlock(block: JournalArticle["blocks"][number], index: number) {
  if (block.type === "heading") {
    return <h2 key={index}>{block.content as string}</h2>;
  }
  if (block.type === "quote") {
    return <blockquote key={index}>{block.content as string}</blockquote>;
  }
  if (block.type === "list") {
    return (
      <ul key={index}>
        {(block.content as string[]).map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    );
  }
  return <p key={index}>{block.content as string}</p>;
}
export function WholesalePage() {
  const [sent, setSent] = useState(false);
  return (
    <main id="main" className="hrm-page">
      <p className="hrm-kicker">Wholesale</p>
      <h1>Keep your room full of good coffee.</h1>
      {sent ? (
        <p className="hrm-success">
          We have your note. A wholesale partner will reply within two working days.
        </p>
      ) : (
        <div className="hrm-wholesale">
          <section>
            <h2>For cafés, restaurants, hotels and offices.</h2>
            <p>
              Reliable weekly roasting, training and a coffee plan that makes sense for your
              service.
            </p>
            <ul>
              <li>From 10kg monthly</li>
              <li>Bar training and brew support</li>
              <li>Flexible delivery across Lagos and Abuja</li>
            </ul>
          </section>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSent(true);
            }}
          >
            <label>
              Business name
              <input required />
            </label>
            <label>
              Business type
              <select>
                <option>Café</option>
                <option>Restaurant</option>
                <option>Hotel</option>
                <option>Office</option>
              </select>
            </label>
            <label>
              Monthly volume
              <select>
                <option>10–30kg</option>
                <option>30–80kg</option>
                <option>80kg+</option>
              </select>
            </label>
            <label>
              Email
              <input type="email" required />
            </label>
            <button className="hrm-button">Send enquiry</button>
          </form>
        </div>
      )}
    </main>
  );
}
