"use client";

import { useMemo, useState } from "react";

import { CoffeeBag } from "./CoffeeBag";
import { coffees } from "../data/coffees";
import { calculateSubscriptionPrice, naira } from "../lib/pricing";

export function SubscribePage() {
  const [choice, setChoice] = useState("Roaster’s Choice");
  const [selected, setSelected] = useState([coffees[0]]);
  const [size, setSize] = useState<"250g" | "1kg">("250g");
  const [bags, setBags] = useState(1);
  const [city, setCity] = useState<"Lagos" | "Abuja" | "Nationwide">("Lagos");
  const [done, setDone] = useState(false);
  const price = useMemo(
    () => calculateSubscriptionPrice({ selected, size, bags, city }),
    [selected, size, bags, city],
  );
  if (done) {
    return <SubscriptionConfirmation />;
  }
  return (
    <main id="main" className="hrm-page">
      <p className="hrm-kicker">Build your box</p>
      <h1>Make the coffee show up.</h1>
      <div className="hrm-builder">
        <SubscriptionForm
          choice={choice}
          selected={selected}
          size={size}
          bags={bags}
          city={city}
          onChoiceChange={setChoice}
          onSelectedChange={setSelected}
          onSizeChange={setSize}
          onBagsChange={setBags}
          onCityChange={setCity}
          onSubmit={() => setDone(true)}
        />
        <SubscriptionSummary selected={selected} price={price} />
      </div>
    </main>
  );
}

function SubscriptionConfirmation() {
  return (
    <main id="main" className="hrm-page hrm-success">
      <p className="hrm-kicker">Order HC-24187</p>
      <h1>Your first box is on its way.</h1>
      <p>
        We’ll roast, pack and send your coffee with a delivery update. Adjust, pause or skip
        whenever you need.
      </p>
      <ol>
        <li>We roast your selection this week.</li>
        <li>Your delivery note lands before it leaves us.</li>
        <li>You make a very good cup.</li>
      </ol>
    </main>
  );
}

type SubscriptionFormProps = {
  choice: string;
  selected: typeof coffees;
  size: "250g" | "1kg";
  bags: number;
  city: "Lagos" | "Abuja" | "Nationwide";
  onChoiceChange: (value: string) => void;
  onSelectedChange: (value: typeof coffees) => void;
  onSizeChange: (value: "250g" | "1kg") => void;
  onBagsChange: (value: number) => void;
  onCityChange: (value: "Lagos" | "Abuja" | "Nationwide") => void;
  onSubmit: () => void;
};
function SubscriptionForm({
  choice,
  selected,
  size,
  bags,
  city,
  onChoiceChange,
  onSelectedChange,
  onSizeChange,
  onBagsChange,
  onCityChange,
  onSubmit,
}: SubscriptionFormProps) {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <fieldset>
        <legend>1. Who chooses?</legend>
        {["Roaster’s Choice", "I choose"].map((value) => (
          <label className="hrm-choice" key={value}>
            <input type="radio" checked={choice === value} onChange={() => onChoiceChange(value)} />
            {value}
          </label>
        ))}
      </fieldset>
      {choice === "I choose" && <CoffeeSelection selected={selected} onChange={onSelectedChange} />}
      <fieldset>
        <legend>2. Your pace</legend>
        <label>
          Bag size
          <select
            value={size}
            onChange={(event) => onSizeChange(event.target.value as typeof size)}
          >
            <option>250g</option>
            <option>1kg</option>
          </select>
        </label>
        <label>
          Bags per delivery
          <select value={bags} onChange={(event) => onBagsChange(Number(event.target.value))}>
            {[1, 2, 3, 4].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Delivery city
          <select
            value={city}
            onChange={(event) => onCityChange(event.target.value as typeof city)}
          >
            <option>Lagos</option>
            <option>Abuja</option>
            <option>Nationwide</option>
          </select>
        </label>
      </fieldset>
      <fieldset>
        <legend>3. Where should we send it?</legend>
        <label>
          Your name
          <input required placeholder="Your full name" />
        </label>
        <label>
          Phone number
          <input required pattern="^(?:\+234|0)[789][01]\d{8}$" placeholder="0803 000 0000" />
        </label>
        <label>
          Delivery address
          <textarea required placeholder="Your address and a useful landmark" />
        </label>
      </fieldset>
      <button className="hrm-button" disabled={!selected.length}>
        Pay with card, transfer or USSD (demo)
      </button>
    </form>
  );
}

function CoffeeSelection({
  selected,
  onChange,
}: {
  selected: typeof coffees;
  onChange: (value: typeof coffees) => void;
}) {
  return (
    <fieldset>
      <legend>Pick up to three</legend>
      {coffees.map((coffee) => (
        <label className="hrm-choice" key={coffee.slug}>
          <input
            type="checkbox"
            checked={selected.some((item) => item.slug === coffee.slug)}
            onChange={() => onChange(toggleCoffee(selected, coffee.slug))}
          />
          {coffee.name}
        </label>
      ))}
    </fieldset>
  );
}
function toggleCoffee(selected: typeof coffees, slug: string) {
  if (selected.some((coffee) => coffee.slug === slug)) {
    return selected.filter((coffee) => coffee.slug !== slug);
  }
  const coffee = coffees.find((item) => item.slug === slug);
  return coffee && selected.length < 3 ? [...selected, coffee] : selected;
}
function SubscriptionSummary({
  selected,
  price,
}: {
  selected: typeof coffees;
  price: ReturnType<typeof calculateSubscriptionPrice>;
}) {
  return (
    <aside className="hrm-live-box">
      <p>Your box</p>
      <div>
        {selected.map((coffee) => (
          <CoffeeBag coffee={coffee} small key={coffee.slug} />
        ))}
      </div>
      <b>{naira(price.total)} per delivery</b>
      <small>
        {naira(price.savings)} saved ·{" "}
        {price.delivery ? `${naira(price.delivery)} delivery` : "Free delivery"} · VAT-free
      </small>
      <p>Pause or skip anytime.</p>
    </aside>
  );
}
