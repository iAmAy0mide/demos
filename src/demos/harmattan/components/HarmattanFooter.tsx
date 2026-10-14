"use client";

import { useState } from "react";

import { AxmionAttribution } from "@/src/shared/components/AxmionAttribution";

export function HarmattanFooter() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  return (
    <footer className="hrm-footer">
      <section>
        <p className="hrm-kicker">A small good thing, once a month</p>
        <h2>Notes from the roastery, no shouting.</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setMessage(
              /^\S+@\S+\.\S+$/.test(email)
                ? "You are on the list. First note lands soon."
                : "Add an email we can reach.",
            );
          }}
        >
          <label htmlFor="newsletter">Email address</label>
          <div>
            <input
              id="newsletter"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
            <button>Join us</button>
          </div>
          <p aria-live="polite">{message}</p>
        </form>
      </section>
      <section>
        <b>Find us</b>
        <p>
          Victoria Island · Lekki · Ikeja · Yaba
          <br />
          Wuse 2 · Maitama
        </p>
        <p>Every day, 7am–8pm</p>
      </section>
      <AxmionAttribution demoName="Harmattan Coffee Co." />
    </footer>
  );
}
