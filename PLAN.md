# PLAN.md

Living plan and progress tracker for **Axmion Showcase**. Codex reads this at the start of every session and updates it at the end of every session.

---

## Current stage

> **Phase 4: Harmattan Coffee Co. (business site)**
> Status: `In progress`

**Status values:** `Not started` → `In progress` → `Ready for review` → `Approved`
Codex may set `In progress` and `Ready for review`. Only the project owner sets `Approved`.

---

## Phase tracker

| # | Phase | Status |
|---|---|---|
| 0 | Scaffold, route groups, shared demo shell | Approved |
| 1 | Fieldhand (custom internal tool) | Approved |
| 2 | Sunreach Power (landing page) | Approved |
| 3 | Meridian Freight (business site) | Approved |
| 4 | Harmattan Coffee Co. (business site) | In progress |
| 5 | Axmion hub (built last) | Not started |
| 6 | Polish: performance, a11y, responsive, motion | Not started |

---

## Project summary

Axmion Web Innovations: *"We design websites that turn attention into action. Landing pages • Business websites • Custom internal tools."*

A hub site holding four demo websites, each presented as a case study. Target audience: Nigerian and African SMEs plus international clients. Everything is fictional concept work. See `AGENTS.md` for all coding, design, and workflow rules.

**Cardinal rule:** the four demos must not look like siblings. Each has its own palette, type, layout logic, and motion personality.

---

## Routes

| Route | Purpose |
|---|---|
| `/` | Axmion hub: positioning, case-study cards with live previews, contact CTA |
| `/work/meridian` | Meridian Freight |
| `/work/harmattan` | Harmattan Coffee Co. |
| `/work/fieldhand` | Fieldhand |
| `/work/sunreach` | Sunreach Power |

Sub-routes (for example `/work/meridian/services`) are defined inside each phase.

### Shared demo shell (the only shared UI)

A minimal floating pill on every `/work/*` route: `← Back to showcase · Next work →`. It is small, unobtrusive, collapsible, keyboard accessible, and neutral enough to sit on top of any of the four designs. It must not take on any demo's styling beyond staying legible on light and dark backgrounds. It also exposes a short "Concept work by Axmion" label.

---

## Phase 0: Scaffold and demo shell

**Goal:** a running app with the structure from `AGENTS.md`, ready for demos.

- [x] Initialize Next.js (App Router, TypeScript strict, Tailwind, ESLint) if not already present
- [x] Add Motion; install GSAP only when a phase needs it
- [x] Create folder structure from `AGENTS.md` section 5
- [x] Root layout (`html`/`body` only) plus per-route-group layouts for hub and each demo
- [x] Placeholder `page.tsx` for each route that renders the demo name (to be replaced in later phases)
- [x] Per-demo `tokens.css` stub with prefixed variables
- [x] Shared demo shell (pill) with route order: Fieldhand → Sunreach → Meridian → Harmattan, wrapping
- [x] Configure `@/` path alias, `npm run typecheck` script, strict lint rules (no unused vars, no `any`)
- [x] `.gitignore`, base `README.md` (how to run, structure, scripts)
- [x] Verify: dev server runs, all five routes load, build passes

---

## Phase 1: Fieldhand (custom internal tool)

**Client story:** a field-service company (generators, AC units, and solar installs across Lagos) runs dispatch from spreadsheets and WhatsApp threads. Fieldhand replaces that.

### Design language
- **Feel:** Linear-grade product UI. Dense but calm, precise, fast.
- **Palette:** cool neutrals with one signal color (electric indigo-blue or lime; choose one and commit). Dark and light themes via tokens, dark default.
- **Type:** a crisp UI sans with a matching mono for IDs, times, and amounts (proposed: Geist + Geist Mono).
- **Layout:** app shell with a collapsible sidebar, top bar with search and ⌘K hint, and a resizable detail drawer. Hairline borders, subtle elevation, tight 4px spacing grid.
- **Motion:** quick and physical. 120 to 200ms, spring on drag/drop, no decorative animation.
- **Prefix:** `--fld-*`

### Features
- [x] **Dispatch board:** kanban-style columns (Unassigned, Scheduled, En route, On site, Done) with drag-and-drop and keyboard-accessible alternative to dragging
- [x] **Technician timeline:** day view, one row per technician, jobs as blocks on a time axis, with conflict highlighting
- [x] **Job drawer:** full job details, status changes, notes, activity log, customer contact, attachments slot
- [x] **Quote builder:** line items, VAT, discount, live totals in ₦, and simulated send success state
- [x] **Command palette (⌘K / Ctrl+K):** jump to jobs and switch theme
- [ ] **Keyboard shortcuts** with a `?` help overlay
- [ ] **Simulated real-time updates:** technicians change status, new jobs arrive, with a toast and a subtle row highlight
- [ ] **Filters and saved views:** by technician, priority, status, area
- [ ] **Dashboard strip:** jobs today, on-time rate, unassigned count, revenue today
- [x] **Persistence** in `localStorage` (validated on read) and a **Reset demo** button restoring seed data
- [x] **Dark and light theme** toggle with system preference as the default
- [ ] A one-time dismissible guided hint ("Try dragging a job, or press ⌘K") so a prospect discovers the features within seconds
- [ ] Empty, loading, and error states; responsive down to tablet, graceful on phone
- [x] Demo `README.md`

---

## Phase 2: Sunreach Power (landing page)

**Client story:** a solar and inverter installer in Lagos wants qualified leads. One page, one goal: get a site inspection booked.

### Design language
- **Feel:** high contrast, energetic, optimistic, and trustworthy. Big benefit-led headlines.
- **Palette:** deep navy with sun yellow as the action color; warm white for surfaces. CTA buttons are always the same yellow, and nothing else competes with them.
- **Type:** a heavy, characterful display face for headlines with a friendly, highly legible body face (proposed: Bricolage Grotesque + DM Sans).
- **Layout:** single column of strong sections, with large type, generous space, and sun-ray and grid motifs drawn in SVG.
- **Motion:** confident and punchy. Count-up numbers, a satisfying calculator response, and gentle reveal on scroll.
- **Prefix:** `--sun-*`

### Features
- [ ] **Instant savings calculator above the fold** (the conversion mechanic): inputs for monthly electricity or diesel spend, property type, and hours of outage per day. It outputs a recommended system size, estimated monthly savings, payback period, and a 5-year saving, all in ₦, with transparent assumptions. Pure calculation logic lives in a separate, well-commented `lib/` file
- [ ] The calculator result flows into the lead form (pre-filled), so interest is captured at its peak
- [ ] **Multi-step lead form:** progress indicator, inline validation, Nigerian phone format, location, preferred contact time, simulated submission and a real success state
- [ ] Headline and sub-headline that name the pain and the outcome; a single primary CTA repeated consistently
- [ ] **Proof:** installation count, testimonials with names and locations, partner or certification badges (SVG, fictional), and a before and after bills comparison
- [ ] **How it works:** a 3 or 4 step visual process
- [ ] **Packages:** 3 system sizes with clear outcomes (what you can power), and the recommended one highlighted
- [ ] **FAQ** built to crush objections (cost, maintenance, battery life, financing, NEPA/grid, warranty)
- [ ] Risk reversal block (guarantee), and urgency that is honest, not fake
- [ ] **Sticky mobile CTA bar**
- [ ] Minimal navigation (no distracting links away from the goal)
- [ ] An "annotations" toggle: shows small callouts explaining why each section exists (for Axmion's pitch to prospects). Off by default
- [ ] Demo `README.md`

---

## Phase 3: Meridian Freight (business website)

**Client story:** a Lagos-based freight forwarder (sea, air, and road) that needs to look like the serious, established partner for businesses moving serious cargo.

### Design language
- **Feel:** industrial, authoritative, and precise. Spec-sheet and shipping-manifest aesthetic.
- **Palette:** carbon black, bone white, safety orange as the single accent; a muted steel grey for secondary.
- **Type:** a bold expanded grotesk for headlines, a condensed face for labels, and a mono for data (proposed: Archivo with width axis + IBM Plex Mono).
- **Layout:** strong grid with visible structure (rules, tick marks, coordinates, serial numbers). Large numerals. Sharp corners, no soft shadows.
- **Motion:** mechanical and measured. Path drawing, tickers, and clean wipes. Nothing bouncy.
- **Prefix:** `--mrd-*`

### Pages and features
- [ ] **Home:** hero with an **animated SVG route map** (Lagos to the world: Rotterdam, Shanghai, Dubai, Houston, Johannesburg) with moving vessels or planes along drawn routes
- [ ] **Live shipment tracker widget:** enter a tracking number (demo numbers suggested in the UI), see a timeline and status with a simulated progress. Handles invalid numbers gracefully
- [ ] **Services:** Sea freight, Air freight, Road and last-mile, Customs clearance, Warehousing. Each page reads like a **spec sheet** (capacity, transit times, documents, coverage)
- [ ] **Quote request flow:** multi-step (cargo type, route, volume, timing, contact) with a summary and a simulated reference number
- [ ] **Trust section:** fleet and volume stats, certifications, client logos (fictional, SVG), and a short "how we handle a shipment" process
- [ ] **About** and **Contact** pages (office locations, hours, a simple map graphic)
- [ ] Industry-specific blocks (oil and gas, FMCG, agriculture, machinery)
- [ ] Persistent "Get a quote" CTA in the header
- [ ] Responsive navigation with a considered mobile menu
- [ ] Demo `README.md`

---

## Phase 4: Harmattan Coffee Co. (business website)

**Client story:** a specialty roaster with cafés in Lagos and Abuja. They want brand personality and a path to recurring revenue.

### Design language
- **Feel:** warm, editorial, tactile, and crafted. Think of a beautiful magazine feature crossed with a menu.
- **Palette:** cream, espresso brown, terracotta, with a muted olive or ochre as a secondary. Paper grain texture.
- **Type:** a characterful display serif with a clean, warm sans (proposed: Fraunces + Instrument Sans). Italic flourishes used sparingly.
- **Layout:** asymmetric editorial compositions, overlapping elements, big pull quotes, rounded organic shapes, hand-drawn-feel SVG illustrations (beans, cups, plants, regions).
- **Motion:** soft and unhurried. Slow reveals, scroll-driven storytelling, gentle parallax, and tactile hover states.
- **Prefix:** `--hrm-*`

### Pages and features
- [ ] **Home:** hero with brand voice and a strong "Start a subscription" path
- [ ] **"Build your box" subscription configurator:** choose beans or ground, roast level, grind or brew method, size, frequency; live price and a visual box preview; simulated checkout summary with a success state
- [ ] **Roast-profile explorer:** interactive view comparing origins and roasts (acidity, body, sweetness, notes) via a radar or slider-driven visual, with a tasting-note filter
- [ ] **Shop / Coffees:** product listing with SVG packaging illustrations and a detail view for each coffee
- [ ] **Café locator:** Lagos and Abuja locations, hours, an open-now indicator, and a stylized SVG map
- [ ] **Story section:** scroll-driven storytelling from farm to cup
- [ ] **Wholesale enquiry** section for offices and restaurants
- [ ] **Journal / Brew guides:** at least 2 well-written short articles with a rich layout
- [ ] Newsletter capture with a simulated success state
- [ ] Demo `README.md`

---

## Phase 5: Axmion hub

**Built last** so it reflects what was actually made.

### Design language
- **Feel:** confident and engineered. Ink-black with one hot signal accent. Oversized editorial type, mono labels, and precise micro-interactions. It must be clearly its own thing, distinct from all four demos.
- **Type:** proposed Schibsted Grotesk + Martian Mono (or an equally distinctive pairing not used in any demo).
- **Motion:** sharp and cinematic. A strong load sequence, magnetic hover on case studies, and smooth page transitions into demos.
- **Prefix:** `--axm-*`

### Sections
- [ ] **Hero** built around *attention → action*, with a memorable interactive or animated element
- [ ] **Services:** Landing pages, Business websites, Custom internal tools, each linked to the demo that proves it
- [ ] **Selected work:** four case-study cards with **live preview** of each demo, the problem, what we built, and the conversion or UX mechanic that makes it work
- [ ] **Process:** how Axmion works (discover, design, build, launch) in a distinctive layout
- [ ] **Why it converts:** a short section on principles (clarity, speed, one goal, trust)
- [ ] **Contact / Start a project:** a form with simulated submission, plus email and WhatsApp CTAs (use placeholders clearly marked for real details)
- [ ] Footer with "concept work" disclaimer for the demos
- [ ] SEO metadata, Open Graph image (generated), favicon
- [ ] Demo `README.md` and a final root `README.md`

---

## Phase 6: Polish

- [ ] Lighthouse 90+ on all five routes (mobile profile); fix regressions
- [ ] Accessibility audit: contrast, focus order, landmarks, reduced motion, screen-reader labels
- [ ] Responsive sweep at 360 / 390 / 768 / 1024 / 1440 / 1920
- [ ] Bundle review: confirm GSAP and heavy libraries only load where used
- [ ] Motion tuning and consistency within each demo
- [ ] Copy pass: remove any generic or filler copy
- [ ] Dead code, unused dependency, and TODO sweep
- [ ] Cross-browser check (Chrome, Safari, Firefox)
- [ ] Final `README.md`; deployment notes for Vercel

---

## Quality gates (checked every phase)

See **Definition of done** in `AGENTS.md`. In short: distinct design, working features, responsive, accessible, reduced-motion safe, lint, typecheck, and build clean, no dead code, README written, this file updated.

---

## Decisions log

Record every notable decision here: new dependencies, font substitutions, deviations from the brief, and the reason.

| Date | Phase | Decision | Reason |
|---|---|---|---|
| 2026-10-07 | 0 | Added `motion`; deferred GSAP. | Motion is required by the stack; no Phase 0 interaction needs GSAP. |
| 2026-10-07 | 0 | Use Webpack for the production build script and TypeScript API validation. | The sandbox blocks Turbopack's CSS-loader subprocess port binding; Webpack built all routes successfully. |
| 2026-10-07 | 1 | Command and task overlays render through client portals. | They remain above the app chrome and retain predictable focus handling. |
| 2026-10-07 | 1 | Persisted invalid job assignments are discarded or repaired on load. | No saved state can advance unassigned work into travel, site, or completion statuses. |
| 2026-10-07 | 2 | Use Bricolage Grotesque and DM Sans with the navy/yellow solar system. | The pairing and color system make Sunreach deliberately distinct from the dense Fieldhand product UI. |
| 2026-10-07 | 2 | Replaced the Fieldhand-only token checker with a prefix-aware all-demo check. | New work cannot introduce undefined scoped tokens without failing the shared verification command. |
| 2026-10-07 | 3 | Used Archivo and IBM Plex Mono for Meridian’s scoped type system. | Archivo’s variable-width grotesk supports the freight-manifest display language; Plex Mono makes operational values legible and deliberately separates Meridian from the other demos. |
| 2026-10-07 | 3 | Implemented the route map as a single dependency-free SVG. | The static, CSS-animated vector stays performant and avoids shipping a map-processing pipeline to visitors. |

---

## Handoff notes

Codex writes here at the end of each session. Keep the most recent session at the top.

### Session: 2026-10-07, Phase 4 planning
- Done: Recorded Phase 3 as approved and started Phase 4 planning. Confirmed Harmattan's required routes, shared-overlay constraints, short-laptop viewport target, and token-validation requirements.
- In progress / rough: No Harmattan UI has been built yet. The next implementation session should establish the scoped visual system before composing pages.
- Known issues: The user-provided Phase 4 brief attachment ends mid-configurator specification; the recorded requirements are sufficient to begin with the stated route and feature scope.
- Next session should: Implement Phase 4 in vertical slices: scoped fonts/tokens and shared shell first, then data/state foundations, Home and subscription configurator, followed by commerce/editorial routes and verification.

### Session: 2026-10-07, Phase 3
- Done: Moved Phase 3 to In progress; created Meridian’s scoped fonts/tokens and industrial manifest visual system; built the shared header/footer/mobile menu, home, interactive SVG route map, tracker, five typed service specification pages, quote flow, About, Contact and branded not-found state.
- In progress / rough: The map uses simplified vector landmasses rather than the optional dot-matrix generator. Tracker results are typed demo records; a real browser viewport/keyboard sweep remains pending.
- Known issues: `npm run typecheck`, `npm run lint`, and `npm run check:tokens` pass. `npm run build` fails before Meridian validation due to pre-existing Fieldhand module-resolution failures; no approved demo was modified.
- Next session should: Run Meridian’s manual responsive and keyboard checks when the unrelated Fieldhand build break is resolved, then complete Phase 3’s visual polish and request review. Do not start Phase 4.

**Template**
```

### Session: 2026-10-07, Phase 2
- Done: Began Sunreach with the isolated font/token system, functional typed savings estimator, calculator-led hero, package and five-year comparison context, FAQs, social proof, inspection booking flow, metadata, and all-demo token validation.
- In progress / rough: The form is a compact functional vertical slice and still needs the requested reducer/draft persistence, full inline validation, annotation mobile sheet, mobile CTA, and visual/browser sweep before Phase 2 can be marked ready for review.
- Known issues: `npm run check:tokens`, `npm run typecheck`, `npm run lint`, and `npm run build` pass. Production compilation needs network access for Next.js to fetch and self-host the required Google font files.
- Next session should: Complete only the remaining Phase 2 form/accessibility/mobile requirements, then re-run production build and viewport checks.
### Session: <date>, Phase <n>
- Done:
- In progress / rough:
- Known issues:
- Next session should:
```

### Session: 2026-10-07, Phase 1 refinement
- Done: Restored readable fixed-width board columns when the sidebar is opened, replaced the New job placeholder with a working intake form, made the conflict chip filter the board instead of navigating away, and exposed Fieldhand overlay tokens to portals so the command palette renders with its intended solid surface and contrast.
- In progress / rough: The reusable dismissal hook is integrated with the command palette; remaining board card menus and filters still need the fuller shared-layer and keyboard-menu pass requested by the owner.
- Known issues: Static checks pass. The browser sweep at the specified viewport sizes remains pending in a real browser.
- Next session should: Complete the outstanding dismissible-menu behavior, filter popover, card/menu keyboard navigation, and visual viewport review before requesting Phase 1 approval.

### Session: 2026-10-07, Phase 1 refinement
- Done: Repaired the Fieldhand short-viewport flex/scroll chain; collapsed the sidebar below 1360px; compacted board chrome; added opaque overlay tokens, themed scrollbars, and token validation; added an initial reusable dismissal hook; enforced technician assignment for scheduled and active states; bounded incoming-job simulation; restored the Fieldhand demo-shell handle.
- In progress / rough: The reusable dismissal hook is integrated with the command palette; remaining board card menus and filters still need the fuller shared-layer and keyboard-menu pass requested by the owner.
- Known issues: Static checks pass. The browser sweep at the specified viewport sizes remains pending in a real browser.
- Next session should: Complete the outstanding dismissible-menu behavior, filter popover, card/menu keyboard navigation, and visual viewport review before requesting Phase 1 approval.

### Session: 2026-10-07, Phase 1
- Done: Refined Fieldhand's command palette, reducer-backed assignment guard, local-storage validation, toast stack, identity, Lagos date, platform-aware hints, responsive board, filters, saved views, alert strip, richer cards, assignment workflow, incoming-job simulation, and shortcut overlay.
- In progress / rough: The board uses native drag-and-drop with a calm reduced-motion fallback; the deliberate column scroll remains on narrow screens.
- Known issues: No functional issues found by static checks or production build. Visual browser sweep remains for owner review in a real browser.
- Next session should: Review Phase 1 at the requested breakpoints and keyboard flow, then wait for owner approval before starting Phase 2.

### Session: 2026-10-07, Phase 0
- Done: App Router scaffold, all five placeholder routes, isolated token stubs, the wrapping accessible demo shell, typed route metadata, project documentation, and strict checks.
- In progress / rough: Placeholders intentionally contain no final demo UI or typography; each visual system starts only in its own phase.
- Known issues: None in the scaffold. `npm audit` reports existing dependency advisories; no automatic audit fix was applied.
- Next session should: Begin Phase 1 only, reading its Fieldhand brief and the frontend-design skill before UI work.
