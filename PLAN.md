# PLAN.md

Living plan and progress tracker for **Axmion Showcase**. Codex reads this at the start of every session and updates it at the end of every session.

---

## Current stage

> **Phase 7: Axmion hub**
> Status: `In progress (7A complete)`

**Status values:** `Not started` → `In progress` → `Ready for review` → `Approved`
Codex may set `In progress` and `Ready for review`. Only the project owner sets `Approved`.

---

## Phase tracker

| #   | Phase                                                         | Status      |
| --- | ------------------------------------------------------------- | ----------- |
| 0   | Scaffold, route groups, shared demo shell                     | Approved    |
| 1   | Fieldhand (custom internal tool)                              | Approved    |
| 2   | Sunreach Power (landing page)                                 | Approved    |
| 3   | Meridian Freight (business site)                              | Approved    |
| 4   | Harmattan Coffee Co. (business site)                          | Approved    |
| 5   | Rentbook (second custom tool)                                 | Approved    |
| 6   | Stockroom (optional third tool; owner decision after Phase 5) | Not started |
| 7   | Axmion hub (built last, covers every demo that exists)        | In progress |
| 8   | Polish: performance, a11y, responsive, motion                 | Not started |

---

## Project summary

Axmion Web Innovations: _"We design websites that turn attention into action. Landing pages • Business websites • Custom internal tools."_

A hub site holding five demo websites, each presented as a case study. Target audience: Nigerian and African SMEs plus international clients. Everything is fictional concept work. See `AGENTS.md` for all coding, design, and workflow rules.

**Cardinal rule:** the demos must not look like siblings. Each has its own palette, type, layout logic, and motion personality.

---

## Routes

| Route             | Purpose                                                                   |
| ----------------- | ------------------------------------------------------------------------- |
| `/`               | Axmion hub: positioning, case-study cards with live previews, contact CTA |
| `/work/meridian`  | Meridian Freight                                                          |
| `/work/harmattan` | Harmattan Coffee Co.                                                      |
| `/work/fieldhand` | Fieldhand                                                                 |
| `/work/sunreach`  | Sunreach Power                                                            |
| `/work/rentbook`  | Rentbook                                                                  |

Sub-routes (for example `/work/meridian/services`) are defined inside each phase.

### Shared demo shell (the only shared UI)

A minimal floating pill on every `/work/*` route: `← Back to showcase · Next work →`. It is small, unobtrusive, collapsible, keyboard accessible, and neutral enough to sit on top of any demo design. It must not take on any demo's styling beyond staying legible on light and dark backgrounds. It also exposes a short "Concept work by Axmion" label.

---

## Phase 0: Scaffold and demo shell

**Goal:** a running app with the structure from `AGENTS.md`, ready for demos.

- [x] Initialize Next.js (App Router, TypeScript strict, Tailwind, ESLint) if not already present
- [x] Add Motion; install GSAP only when a phase needs it
- [x] Create folder structure from `AGENTS.md` section 5
- [x] Root layout (`html`/`body` only) plus per-route-group layouts for hub and each demo
- [x] Placeholder `page.tsx` for each route that renders the demo name (to be replaced in later phases)
- [x] Per-demo `tokens.css` stub with prefixed variables
- [x] Shared demo shell (pill) with route order: Fieldhand → Rentbook → Sunreach → Meridian → Harmattan, wrapping
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

## Phase 5: Rentbook (custom internal tool)

**Client story:** Okafor & Sons Properties manages five Lagos buildings from WhatsApp threads, paper receipts and a strained spreadsheet. Rentbook makes collection, arrears, tenant history and property health legible in one calm financial console.

### Design language

- **Feel:** light-first, precise, trustworthy and print-minded; a modern banking dashboard with ledger details.
- **Palette:** cool paper white, green-black ink, deep emerald for paid and primary actions, stamp red for overdue, amber for due soon, slate for vacant.
- **Type:** Hanken Grotesk for UI and headings, Spline Sans Mono for money, dates, IDs and tabular data.
- **Layout:** top navigation and property switcher, wide document-like pages, airy tables, ruled lines, receipt perforations and subtle stamp graphics. Rentbook must not resemble Fieldhand's dark sidebar product UI.
- **Motion:** gentle 150–250ms number, chart and payment-stamp feedback; no springs. Prefix: `--rbk-*`.

### Routes and feature slices

- `/work/rentbook`: overview dashboard with collection, arrears, occupancy, attention items, SVG income chart and payment feed.
- `/work/rentbook/rent-roll`: searchable, sortable rent roll with saved views, bulk reminders and keyboard navigation.
- `/work/rentbook/tenants` and `/tenants/[id]`: tenant list and detailed ledger, activity, lease and printable statement.
- `/work/rentbook/properties` and `/properties/[id]`: building list and an accessible SVG unit-grid building view.
- `/work/rentbook/payments`: payment history and print-ready, shareable receipts.
- `/work/rentbook/reports`: collection, income, arrears-aging reports and client-side CSV export.
- `/work/rentbook/maintenance`: light status list with update drawer.
- Build in slices: foundations and validated reducer → shell/dashboard → rent roll → payment/receipt → reminders → tenant/property → reports/maintenance → command palette, shortcuts, states and responsive/a11y pass.

### Data and mechanics

- Typed properties, units, tenants, leases, charges, payments, receipts, maintenance requests and activity entries; all financial status is derived in pure helpers.
- One reducer-backed provider persists validated state after mount. Payment allocation is oldest-first and blocks unapproved overpayment; dates use Africa/Lagos client time to avoid hydration mismatches.
- Payments, reminders and overlays have focus management, Escape/outside dismissal, token focus rings, and accessible top-right toasts.
- Demo `README.md` required.

## Phase 6: Stockroom (optional)

Optional third custom tool, pending owner approval after Rentbook: a light-first pharmacy or provision-store POS with keyboard-fast checkout, split payments, live stock, a credit ledger and end-of-day report. Do not build during Phase 5.

## Phase 7: Axmion hub

**Built last** so it reflects all demos built at that point.

### Design language

- **Feel:** confident and engineered. Ink-black with one hot signal accent. Oversized editorial type, mono labels, and precise micro-interactions. It must be clearly its own thing, distinct from every demo.
- **Type:** proposed Schibsted Grotesk + Martian Mono (or an equally distinctive pairing not used in any demo).
- **Motion:** sharp and cinematic. A strong load sequence, magnetic hover on case studies, and smooth page transitions into demos.
- **Prefix:** `--axm-*`

### Sections

- [ ] **Hero** built around _attention → action_, with a memorable interactive or animated element
- [ ] **Services:** Landing pages, Business websites, Custom internal tools, each linked to the demo that proves it
- [ ] **Selected work:** case-study cards with **live preview** of every demo, the problem, what we built, and the conversion or UX mechanic that makes it work
- [ ] **Process:** how Axmion works (discover, design, build, launch) in a distinctive layout
- [ ] **Why it converts:** a short section on principles (clarity, speed, one goal, trust)
- [ ] **Contact / Start a project:** a form with simulated submission, plus email and WhatsApp CTAs (use placeholders clearly marked for real details)
- [ ] Footer with "concept work" disclaimer for the demos
- [ ] SEO metadata, Open Graph image (generated), favicon
- [ ] Demo `README.md` and a final root `README.md`

---

## Phase 8: Polish

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

## Quality gate (runs at the end of EVERY session)

- [ ] `npm run format` run; tree is formatted
- [ ] `npm run check` passes (format, lint, typecheck, token, time, metadata, and seed checks)
- [ ] `npm run build` passes
- [ ] New files respect size limits, or the exception is justified in a comment
- [ ] No dead code, console logs, TODOs, or commented-out code
- [ ] Screenshots taken and viewed for every UI change

---

## Decisions log

Record every notable decision here: new dependencies, font substitutions, deviations from the brief, and the reason.

| Date       | Phase | Decision                                                                                                                                                 | Reason                                                                                                                                                                                |
| ---------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-07 | 0     | Added `motion`; deferred GSAP.                                                                                                                           | Motion is required by the stack; no Phase 0 interaction needs GSAP.                                                                                                                   |
| 2026-10-07 | 0     | Use Webpack for the production build script and TypeScript API validation.                                                                               | The sandbox blocks Turbopack's CSS-loader subprocess port binding; Webpack built all routes successfully.                                                                             |
| 2026-10-07 | 1     | Command and task overlays render through client portals.                                                                                                 | They remain above the app chrome and retain predictable focus handling.                                                                                                               |
| 2026-10-07 | 1     | Persisted invalid job assignments are discarded or repaired on load.                                                                                     | No saved state can advance unassigned work into travel, site, or completion statuses.                                                                                                 |
| 2026-10-07 | 2     | Use Bricolage Grotesque and DM Sans with the navy/yellow solar system.                                                                                   | The pairing and color system make Sunreach deliberately distinct from the dense Fieldhand product UI.                                                                                 |
| 2026-10-07 | 2     | Replaced the Fieldhand-only token checker with a prefix-aware all-demo check.                                                                            | New work cannot introduce undefined scoped tokens without failing the shared verification command.                                                                                    |
| 2026-10-07 | 3     | Used Archivo and IBM Plex Mono for Meridian’s scoped type system.                                                                                        | Archivo’s variable-width grotesk supports the freight-manifest display language; Plex Mono makes operational values legible and deliberately separates Meridian from the other demos. |
| 2026-10-07 | 3     | Implemented the route map as a single dependency-free SVG.                                                                                               | The static, CSS-animated vector stays performant and avoids shipping a map-processing pipeline to visitors.                                                                           |
| 2026-10-07 | 4     | Used Fraunces and Instrument Sans in Harmattan's route-scoped layout.                                                                                    | Their soft editorial contrast supports the café-and-magazine design without borrowing another demo's voice.                                                                           |
| 2026-10-07 | 4     | Kept Harmattan illustrations in CSS and inline SVG.                                                                                                      | This preserves the crafted visual language without network image requests or heavy assets.                                                                                            |
| 2026-10-07 | 5     | Added Rentbook as the second custom-tool demo and registered `--rbk-*` token validation.                                                                 | The landlord financial console broadens the showcase without reusing Fieldhand’s product language.                                                                                    |
| 2026-10-07 | 6     | Reserved Stockroom as an owner-approved optional phase.                                                                                                  | A third tool should be built only if Rentbook proves the additional portfolio breadth is needed.                                                                                      |
| 2026-10-07 | 5     | Used Hanken Grotesk and Spline Sans Mono for Rentbook.                                                                                                   | Both are available through `next/font` and give financial values a clear, tabular ledger voice distinct from Fieldhand.                                                               |
| 2026-10-07 | 5     | Moved the Axmion shell from a CSS Module to a root-loaded shared stylesheet.                                                                             | Turbopack emitted the module CSS but exported an empty class map at runtime, leaving the shell’s DOM without class names.                                                             |
| 2026-10-08 | 5     | Added Playwright as a development-only screenshot harness.                                                                                               | It provides a repeatable responsive visual sweep without shipping browser tooling to the demo.                                                                                        |
| 2026-10-08 | 5     | Added Prettier and `prettier-plugin-tailwindcss` as repository-wide development tooling.                                                                 | One formatter and deterministic Tailwind class ordering make every source file easier to review.                                                                                      |
| 2026-10-08 | 7A    | Added a shared WhatsApp contact source, attribution component and published-work registry.                                                               | Every demo attribution and work-navigation context now derives from one typed, tested implementation.                                                                                 |
| 2026-10-08 | 7A    | Used Schibsted Grotesk, Instrument Serif and Martian Mono for the hub.                                                                                   | The three scoped faces give the hub an editorial studio voice distinct from all concept demos.                                                                                        |
| 2026-10-08 | 7A    | Self-hosted the hub's Martian Mono, Schibsted Grotesk and Instrument Serif with `next/font/local`; added the three Fontsource packages as asset sources. | Turbopack 16.4.0 cannot resolve its `next/font/google` virtual module for these hub fonts, and the original Google-font loading also fell back when its build-time request failed.    |
| 2026-10-08 | 7A    | Added the production-route smoke test to `check:full`.                                                                                                   | It protects all 29 static routes and one valid page for each dynamic route family from non-200 responses and known framework error overlays.                                          |
| 2026-10-08 | 7A    | Embed mode resolves client-side after mount.                                                                                                             | It avoids a server/client hydration mismatch while suppressing the shell and demo persistence in iframe previews.                                                                     |
| 2026-10-08 | 7A    | Run the local development server with Webpack.                                                                                                           | Turbopack 16.4.0 intermittently cannot resolve its internal `next/font/google` virtual module; production already uses Webpack.                                                       |

---

## Handoff notes

Codex writes here at the end of each session. Keep the most recent session at the top.

### Session: 2026-10-08, Phase 7A Turbopack hub-font repair

- Done: Reproduced the owner’s Turbopack overlay after clearing `.next`: the hub failed through Martian Mono’s generated `font-stretch: 100%` source and Schibsted Grotesk also failed through the same `@vercel/turbopack-next/internal/font/google/font` virtual module. The five requested demo routes were unaffected. Option 2a (explicit Martian Mono 400/500 weights with Latin and swap) still failed. Option 2b worked: copied only the needed Latin WOFF2 weights from `@fontsource/martian-mono` into `src/demos/hub/fonts/` and loaded them using `next/font/local`. Self-hosted Schibsted Grotesk (400/500/600) and Instrument Serif (400 italic) in the same scoped hub layout after their Google-font fetches logged fallbacks. No demo imports the hub font module.
- Done: Added `scripts/smoke-routes.ts`, which starts `next start` by default or accepts `SMOKE_BASE_URL`, requests all 29 static routes and one valid example of each dynamic route, and fails on non-200 responses or Build Error/Module not found/Application error content. Registered it in `check:full`. `scripts/screenshots.ts` now accepts `SCREENSHOT_ROUTES` for a focused capture.
- Verification: `pnpm` is unavailable (`pnpm: command not found`), so npm ran against the repository’s npm lockfile. `npm run format` completed. `npm run check` passed with 0 errors and 29 existing size/complexity warnings. The live Turbopack check after the repair returned: `/`, `/work/fieldhand`, `/work/sunreach`, `/work/meridian`, `/work/harmattan`, and `/work/rentbook` all `200 clear`. The smoke test against the existing local server passed all 29 routes. `npm run build`, `npx next build --webpack --debug`, and `npm run check:full` all still fail after “Creating an optimized production build” with only “Build failed because of webpack errors”; this is the pre-existing opaque Webpack failure and prevents starting a fresh production server. The screenshot harness could not inspect images because Chromium was absent; its attempted 186.8 MiB download failed after CDN timeouts and connection resets.
- Commit: pending.
- Next session: diagnose the existing Webpack production-build failure separately before any Phase 7B work. Re-run `SCREENSHOT_ROUTES=/ npm run screenshots` at 1296×640 and 360×740 once Playwright Chromium is available, inspect the images, and then re-run `npm run check:full` against a production build.

### Session: 2026-10-08, Phase 7A hub foundation

- Done: Added the typed contact configuration and message/link builders with an executable check; a shared accessible WhatsApp attribution; a published-work registry powering the demo pill; embed detection that suppresses the pill and blocks Fieldhand, Rentbook and Harmattan local persistence, Fieldhand simulation/toasts, Rentbook toast and Sunreach annotations. Replaced every existing visible demo-credit string with the attribution component. Established the hub’s scoped fonts, black/magenta visual system, metadata, sticky desktop/mobile header, focus-managed mobile overlay, footer and deliberate holding panel. No hero, services, selected work, process or contact form was built.
- Attribution search before: `DemoShell.tsx:40,48,57`; `app/(hub)/page.tsx:3,8`; `app/layout.tsx:6,7`; `HarmattanSite.tsx:245`; `MeridianFooter.tsx:43`; `SunreachLanding.tsx:517`; plus internal plan, README, metadata and source-name hits. After: visible demo credits are `AxmionAttribution` in DemoShell, Harmattan, Meridian and Sunreach; the only raw visible name is the permitted hub logo. Metadata, config, documentation and internal naming remain unchanged.
- Verification: `npm run format` completed. `npm run check` exited 0: format, TypeScript, token (including attribution tokens), Lagos time, metadata (29 route pages), contact-link and attribution checks passed; ESLint reported 29 existing size/complexity warnings and 0 errors. `npm run build` and `npx next build --webpack --debug` both failed after “Creating an optimized production build” with only the generic “Build failed because of webpack errors” message. `npm run screenshots` could not bind the local dev server: `listen EPERM` at `0.0.0.0:3100`; consequently no screenshots were generated or viewed, and iframe framing could not be manually exercised in this sandbox. `next.config.ts` has no `X-Frame-Options` or `frame-ancestors` configuration.
- Commit: `25d79ef feat(hub): add shared showcase foundation`.
- Next session: Phase 7B only—build the hero, services and live work previews from `src/shared/works.ts`; keep the holding panel only until its replacement is ready. First reproduce the webpack diagnostic in a writable local environment and run screenshot/keyboard checks at 1296×640 and 360×740, including both pill states and iframe embeds.

### Session: 2026-10-08, Phase 7A Turbopack font repair

- Done: Changed `npm run dev` to run `next dev --webpack`. This avoids Turbopack 16.4.0’s internal `next/font/google` module resolver error while retaining the hub’s self-hosted Martian Mono configuration.
- Verification: `npm run format` and `npm run check` passed with 0 errors and the pre-existing 29 size/complexity warnings. `npm run dev -- --help` confirms Webpack is an accepted dev-server mode. The sandbox cannot bind a local port, so a live route request remains for the project owner’s local browser.

### Session: 2026-10-08, Phase 5B Rentbook completion

- Done: Completed the 5B route repair, scoped metadata, versioned Rentbook persistence, deterministic 40-unit portfolio seed, persisted property scoping, and rent-roll ledger controls. The roll has saved-view counts, search, property/frequency filtering, sorting, payment action menus, status treatments, responsive stacked mobile rows and Lagos-formatted dates.
- Verification: `npm run format:check`, TypeScript, token, Lagos-time, metadata and Rentbook seed checks passed. ESLint has 0 errors and 28 existing non-blocking size/complexity warnings. The project owner ran `npm run build` successfully in a local terminal.
- Visual verification: Screenshot automation could not start in this sandbox because `next dev` cannot bind localhost (`listen EPERM` on port 3100). No unobserved visual claims were made here; run `npm run screenshots` locally and inspect `.screenshots/` at desktop, tablet and mobile widths before marking this work ready for review.
- Next session should: Review the local screenshot sweep and keyboard flow, then either address review feedback or mark Phase 5 part 1 ready for owner review. Do not start receipt, reminder, tenant-detail, property-detail, reports or maintenance implementations without owner direction.

### Session: 2026-10-08, Phase 5B routes and metadata

- Done: Committed the dedicated Rentbook workspace routes as `deddcd0` and the scoped per-demo metadata as `f044418`. Every demo now declares its own title template, description, Open Graph copy and inline SVG brand icon; Rentbook’s deferred workspace routes have individual metadata.
- Verification: `npm run format`, `npm run typecheck`, `npm run check:metadata` and `npm run build` passed. ESLint has 0 errors and retains 27 existing non-blocking size/complexity warnings elsewhere in the repository.
- In progress: Steps 3–5 remain: versioned Rentbook persistence and seed integrity script; persisted property filtering; and the full rent-roll interaction/visual pass. Screenshot capture remains blocked by the sandbox’s denied localhost bind.
- Next session should: Continue Step 3 only. Do not mark Phase 5B ready for review until all requested checks, seed checks and a browser screenshot inspection have completed.

### Session: 2026-10-08, Phase 5B route repair

- Done: Repaired the Rentbook route fall-through by adding explicit `page.tsx` files for tenants, properties, payments, reports and maintenance. Each now has an on-brand deferred-workspace screen rather than rendering the overview. Expanded the Rentbook top navigation and its nested-route active-state matching, and registered every Rentbook screen in the Playwright screenshot route list.
- Verification: Prettier completed; ESLint completed with 0 errors and the pre-existing 27 size/complexity warnings; `tsc --noEmit` exited 0; and `npm run build` completed successfully with all seven Rentbook routes in the route manifest. Screenshot capture could not run because this sandbox denies the dev server local port bind (`listen EPERM` on `0.0.0.0:3100`), so no visual claim was made.
- Blocker: The workspace grants read-only access to `.git`; `git commit -m "feat(rentbook): add dedicated workspace routes"` fails because Git cannot create `.git/index.lock`. The route changes are uncommitted and must be committed in a normal writable checkout before continuing.
- Next session should: Commit the route repair, then continue 5B strictly with metadata, persistence/seed validation, property-scoped data, and the rent-roll specification. Do not begin 5C routes or features.

### Session: 2026-10-08, Phase 5 code quality

- Done: Added Prettier, Tailwind class ordering, EditorConfig, an enforced pre-commit hook, `npm run check`/`check:full`, metadata validation and a large-file report. Formatted the repository; fixed 210 lint errors without suppressions, including import ordering, braces, duplicate imports and nested ternaries. Split the Rentbook shell into focused header, mobile-navigation and dialog components without changing behavior.
- In progress / rough: The warning-only size report still identifies legacy candidates. Prioritize SunreachLanding, Fieldhand DispatchBoard/CommandPalette, Meridian QuotePage, then the Rentbook payment, overview and roll components in a future quality-only session.
- Known issues: `pnpm` is not installed in this environment, so verification uses npm commands against the repository's npm lockfile. The project owner confirmed the production build completes successfully in a normal local terminal; this sandbox cannot retain the Webpack process long enough to capture its final output.
- Next session should: Do not start Rentbook 5C. Continue only the prioritized code-quality extractions above, then run the full visual check for any affected UI.
- Quality gate: Prettier clean; ESLint has 0 errors and 27 non-blocking size/complexity warnings; TypeScript and token/time/metadata checks passed in the completed individual runs; project owner confirmed `npm run build` succeeds locally.

### Session: 2026-10-08, Phase 5B continuation

- Done: Resumed from the interrupted uncommitted Rentbook work. Kept the active 5B slice to Overview and Rent roll, removing later-phase placeholder routes that only rendered the overview. Added command access (⌘/Ctrl+K), reset-data confirmation, property-aware shell state, and a mobile bottom navigation; reformatted the persistence provider without changing its saved-data shape. The overview now filters all summary values by property and has a ledger-style collection graphic plus payment feed.
- Done: Completed the core 5B rent-roll interaction: property-aware search, status views, sorting, keyboard-focusable ledger rows, empty state and simulated overdue reminder confirmation. Payment recording now validates tenant/amount/overpayment inputs, persists the oldest-first allocation, dismisses by Escape or outside click, and confirms success with a toast.
- In progress / rough: Overview filtering, chart/feed, rent-roll saved views and bulk reminders, plus the payment dialog’s validation/focus/success pass are still incomplete. Those remain the next 5B slices.
- Known issues: `check:tokens` passes and TypeScript had passed before the final shell change. Screenshot automation is configured but Chromium is not installed; the sandbox also blocks the unprivileged local dev-server bind. The screenshot sweep therefore could not complete.
- Next session should: Run lint/typecheck/build, then complete only the documented 5B overview, rent-roll and payment flows before beginning receipts or later routes.

### Session: 2026-10-07, Phase 5 shell-style diagnostic repair

- Root cause, verified in the live dev build: Tailwind v4’s scanner and Rentbook stylesheet import both worked. `rbk-top` and `rbk-brand` were present in the rendered DOM but had no source or emitted CSS selector, while the existing `rbk-primary` selector matched. The Axmion module stylesheet was emitted, but Turbopack’s client bundle exported its CSS Module as `{}`; `styles.shell`, `styles.handle`, and `styles.panel` therefore rendered no class names. There were no CSS parse or `@import` errors, and Rentbook/Axmion tokens resolved within their owning wrappers.
- Done: added the Rentbook sticky document-bar styling, responsive navigation, branded property control, rent-roll search trigger, and single top-bar payment action; removed the duplicate overview action. Replaced the broken Axmion CSS Module with root-loaded `DemoShell.css`, scoped `--axm-shell-*` tokens, and retained click, hover/focus, Escape, and outside-click collapse behavior.
- Guard: `check:tokens` now also checks `rbk-*` and `axm-shell-*` component class references against their stylesheet definitions. It exposed and repaired the pre-existing missing `rbk-dialog` selector.
- Browser evidence: Firefox at 1296×640 showed Rentbook with its ruled sticky header, emerald R mark, active Overview underline, styled property switcher/search/payment controls, and a centered collapsed Axmion handle. Harmattan showed its independent editorial hero with the same styled collapsed handle. The emitted CSS bundles contain matching selectors for all of those DOM classes. Expanded state is supplied by the live `axm-shell-panel-open` class and hover/focus selector; it includes Back to showcase, Rentbook, Next work, and the concept label.
- Verification: `corepack pnpm run check:tokens`, `lint`, `typecheck`, and `build` pass; pnpm emits a sandbox-only read-only store-lock warning before it runs each script. Commit: `65f3276 fix(rentbook): restore shell styles`.
- Scope stop: no 5B work started. Existing uncommitted Rentbook route/provider work remains deliberately untouched.

### Session: 2026-10-07, Phase 5 stabilization (5A)

| Slice                             | Status  | Verified state                                                                                                           |
| --------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------ |
| Foundations and persistence       | Partial | Typed seeds, reducer and persisted state exist; validation remains shallow.                                              |
| Shell and overview                | Partial | Top navigation, property selector and overview exist; property filtering and overview metrics/feed/chart are incomplete. |
| Rent roll                         | Partial | Route and table component exist; saved views, bulk reminders and keyboard flow are incomplete.                           |
| Record payment                    | Partial | Dialog allocates oldest-first and persists; focus management, validation feedback and success toast are incomplete.      |
| Receipts and reminders            | Missing | No completed receipt or reminder flow.                                                                                   |
| Tenants and properties            | Missing | Placeholder routes still render the overview.                                                                            |
| Reports and maintenance           | Missing | Placeholder routes still render the overview.                                                                            |
| Command palette and shortcuts     | Missing | Not implemented.                                                                                                         |
| Responsive and accessibility pass | Partial | Static checks pass; browser viewport and keyboard verification could not run in this execution environment.              |

- Done: Diagnosed and repaired Harmattan's CSS syntax error (`margin: 0 0: 1rem`); production compilation now clears the Webpack stage. Migrated live Fieldhand, Meridian, Harmattan, Sunreach and Rentbook date handling to the shared Lagos-time helpers. Expanded the fixed-time check to cover weekday, UTC/Lagos rollover, month end and leap day.
- Verification: `npm run check:tokens`, `npm run typecheck`, `npm run lint` and `npm run check:lagos-time` pass. The `npm run build` output confirmed successful Webpack compilation; this sandbox could not retain a local server/browser session for route and viewport testing.
- Known issues: Full production-build completion and browser-only Axmion-pill checks must be re-run in the project owner's browser. The pill source is collapsed by default and implements click, hover/focus, Escape and outside-click behavior, but this is source inspection rather than visual validation.
- Next session (5B), priority order: (1) complete the shell: command palette, reset confirmation, mobile bottom nav, and property switcher filtering every screen; complete the overview metrics, chart and payment feed. (2) complete rent roll saved views, filters, bulk reminder flow and keyboard navigation. (3) complete record-payment validation, allocation preview, focus management and success toast. Do not start receipts, reminders, tenant/property detail, reports or maintenance until those slices are complete.

### Session: 2026-10-07, Phase 5 audit before repair

| Requirement                                    | Status  | Evidence from the checked source                                                                                                                                                                                              |
| ---------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Routes                                         | Partial | Only `/work/rentbook` exists; the rent roll, tenants, properties, payments, reports, and maintenance routes are absent.                                                                                                       |
| Top bar, navigation, property switcher         | Missing | No Rentbook shell component exists; the overview renders its own header only.                                                                                                                                                 |
| Command palette and Reset demo                 | Missing | No command UI, keyboard shortcut handler, confirmation, or reset control is rendered.                                                                                                                                         |
| Seed portfolio size and story mix              | Missing | The checked seed has 5 properties but only 6 units, 4 tenants, 4 leases/charges, 3 payments, and 1 maintenance request; dates are fixed rather than Lagos-relative.                                                           |
| Financial types, helpers, reducer, persistence | Partial | The core shapes, basic status/balance/naira helpers, reducer, and localStorage hydration exist. Allocation is not oldest-first; validation only checks array shapes; no receipts or corruption-recovery notice exist.         |
| Overview                                       | Partial | It renders collection, outstanding, occupancy, and overdue entries, but has a fixed incorrect date/greeting, no property filtering, monthly/YTD split, collection rate, chart, recent feed, or working record-payment action. |
| Rent roll                                      | Missing | No component or route exists.                                                                                                                                                                                                 |
| Record payment                                 | Missing | A visually present button has no handler; no dialog, validation, allocation preview, toast, or persistence flow was exercised.                                                                                                |
| Receipts and reminders                         | Missing | No related route, component, or data mechanic exists.                                                                                                                                                                         |
| Tenants and properties                         | Missing | Domain data exists, but no list/detail routes, ledger, statement, or unit-grid view exists.                                                                                                                                   |
| Reports and maintenance                        | Missing | Only one maintenance record is seeded; there are no screens, reports, exports, or update drawer.                                                                                                                              |

- Done: Completed a source audit before changing Rentbook UI or behavior. This audit did not claim browser verification; it records only what was inspected in the current codebase.
- In progress / rough: Phase 5 is explicitly `In progress (part 1 of 2)`. Part 1 must repair shared Lagos time and the demo shell, then complete Rentbook foundations, application shell, overview, rent roll, and record payment.
- Known issues: Rentbook's fixed Tuesday greeting is incorrect for the stated Wednesday, 7 October 2026 Lagos date. The shared demo shell has styling but does not meet the requested collapsible, controlled, self-contained behavior.
- Next session should: Implement only the requested Part A shared repairs and Part B Part 1 slices; do not start receipts, reminders, tenant/property detail, reports, maintenance, Phase 6, or Phase 7.

### Session: 2026-10-07, Phase 5 foundation

- Done: Added Rentbook’s scoped font/token system, typed property-management domain model, seed portfolio, pure charge/payment/amount-in-words helpers, reducer-backed payment integrity guard, validated persistence provider, and a first overview dashboard slice.
- In progress / rough: The overview is intentionally limited to collection, outstanding, occupancy and overdue attention. Navigation, rent roll, payment drawer, receipt, reports and the remaining features are not built yet.
- Known issues: `npm run check:tokens`, `npm run typecheck`, and `npm run lint` pass. Production build and viewport/keyboard validation remain pending.
- Next session should: Build Rentbook’s top-nav shell and the rent-roll vertical slice, including table filtering, sorting and keyboard row actions.

### Session: 2026-10-07, Phase 5 setup

- Done: Marked Harmattan approved; registered Rentbook in project documentation, the shared demo route cycle and the token-validation script; added its scoped token stub; renumbered later phases and reserved optional Stockroom.
- In progress / rough: No Rentbook application UI or state has been built yet.
- Known issues: None introduced by the setup changes.
- Next session should: Build only Rentbook, beginning with the typed data, pure financial helpers, reducer and validated persistence before composing the console shell.

### Session: 2026-10-07, Phase 4 implementation

- Done: Created Harmattan's scoped typography, token system and tactile editorial CSS; added the shared header, mobile menu, bag drawer, footer newsletter, Home, coffee catalogue/detail pages, subscription starter flow, roast lab, café locator, story, journal/article and wholesale routes. Added typed coffee/journal data, typed pricing rules, static params for dynamic routes, a branded 404, and demo README.
- In progress / rough: The completed vertical slice does not yet meet every detailed Phase 4 signature requirement: the bag state needs a provider so its count synchronizes across every interactive surface; the configurator needs its reducer, per-step validation and preselected-query handling; the story needs Motion scroll transforms and the café opening-hours clock needs a client-time calculation. The overlay uses Escape/outside dismissal but not yet an explicit focus trap.
- Known issues: `npm run check:tokens`, `npm run typecheck`, and `npm run lint` pass. `npm run build` ends with a generic Next/Webpack error without reporting a diagnostic in this environment; it needs investigation before review. Manual browser and keyboard viewport sweeps have not run.
- Next session should: Continue only Phase 4: complete the remaining signature mechanics and accessibility requirements, diagnose the build diagnostic, then verify all required viewports before marking it Ready for review.

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
- Quality gate: pasted output of `npm run check`:
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
