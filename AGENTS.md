<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


# AGENTS.md

Project rules for Codex. Read this file completely at the start of every session, then read `PLAN.md`.

---

## 1. What this project is

**Axmion Showcase** is a demo website for **Axmion Web Innovations**, a web studio whose pitch is:

> We design websites that turn attention into action. Landing pages • Business websites • Custom internal tools.

The project is a **hub site** that contains **four fully working demo websites**, each presented as a case study:

| Route | Demo | Type |
|---|---|---|
| `/` | Axmion hub | The showcase itself |
| `/work/meridian` | Meridian Freight | Business website (logistics, B2B) |
| `/work/harmattan` | Harmattan Coffee Co. | Business website (specialty coffee) |
| `/work/fieldhand` | Fieldhand | Custom internal tool (dispatch console) |
| `/work/sunreach` | Sunreach Power | High-converting landing page (solar) |

The purpose of everything here is to **close clients**. Every screen must look like a finished, paid-for product. If something looks like a template, a tutorial, or a placeholder, it is not done.

All brand names are fictional concept work.

---

## 2. Mandatory reading before any UI work

Before writing or changing **any** UI, read `.codex/skills/frontend-design/SKILL.md` in full and follow it. This is not optional. It governs aesthetic direction, typography, and avoiding generic output.

Then read the design brief for the demo you are working on in `PLAN.md`.

---

## 3. The one rule that matters most

**The four demos must not look like siblings.**

Each demo has its own design language: its own palette, type pairing, layout logic, motion personality, and component style. A visitor clicking from one demo to the next should feel they are looking at four different studios' work.

- Never copy components, spacing scales, border radii, shadows, or motion curves between demos.
- Never reuse a font family across demos (the hub counts as a demo).
- Do not let any demo drift toward a generic look: no default Tailwind palette, no stock card grids, no purple gradients, no Inter or system-font fallback as the main face.

---

## 4. Tech stack

- **Next.js** (latest stable, App Router) with **TypeScript** in strict mode
- **Tailwind CSS** for styling, driven by CSS variable tokens per demo
- **Motion** (Framer Motion) for UI animation
- **GSAP + ScrollTrigger** only where scroll choreography genuinely needs it (justify in a comment)
- **next/font** or 'local' for all fonts (self-hosted, no layout shift)
- **lucide-react** for icons where an icon set is appropriate (a demo may use custom SVG icons instead)
- **No backend.** Mock data, `localStorage` for persistence where the demo needs it, and simulated async actions.
- Use `npm` as the project package manager.

Do not add a dependency without a clear need. Before adding one, check that the platform, Tailwind, or Motion cannot already do the job. Record any new dependency and the reason in `PLAN.md` under **Decisions log**.

---

## 5. Project structure

Route files stay thin. Real code lives in `src/demos/<name>/`.

```
src/
  app/
    layout.tsx                  # Root layout: html/body only, no fonts or tokens
    (hub)/
      layout.tsx                # Hub fonts + tokens
      page.tsx
    work/
      meridian/
        layout.tsx              # Fonts + tokens for this demo only
        page.tsx
        [other routes]/page.tsx
      harmattan/ ...
      fieldhand/ ...
      sunreach/ ...
  demos/
    meridian/
      components/               # UI for this demo only
      data/                     # Mock data, typed
      lib/                      # Helpers and hooks for this demo only
      styles/                   # Tokens (tokens.css) for this demo only
    harmattan/ ...
    fieldhand/ ...
    sunreach/ ...
    hub/ ...
  shared/
    demo-shell/                 # The floating Axmion pill (the only shared UI)
    lib/                        # Truly generic utilities (cn, formatters, hooks)
  types/                        # Cross-cutting types only
```

### Isolation rules

- A demo may import from `src/shared/` and from its **own** folder. It must **never** import from another demo's folder.
- `src/shared/` holds only generic, unstyled logic and the demo shell. Do not put visual components there to "save time". If two demos need a similar-looking component, each builds its own.
- Fonts and design tokens load in the demo's own `layout.tsx` and are scoped to that layout's wrapper element. Nothing leaks to other routes.
- Name CSS variables with the demo prefix: `--mrd-*` (Meridian), `--hrm-*` (Harmattan), `--fld-*` (Fieldhand), `--sun-*` (Sunreach), `--axm-*` (hub).

---

## 6. Clean code standards

Write code that a new developer can read and understand without asking questions. Readability beats cleverness every time.

### Principles

1. **Small and single-purpose.** One component, hook, or function does one thing. If a component passes roughly 150 lines, or a function roughly 40, split it.
2. **Clear names.** Names describe what a thing is or does: `ShipmentTracker`, `calculateMonthlySavings`, `useDispatchBoard`. No `data2`, `temp`, `handleStuff`, or single-letter names outside tiny loops.
3. **Self-documenting first, comments second.** Prefer clear code over comments. Add a comment only to explain **why** (a non-obvious decision, a workaround, a trade-off), never to restate **what** the code does.
4. **No dead code.** No commented-out blocks, unused imports, unused variables, stray `console.log`, or leftover TODOs. Delete it; git remembers.
5. **No magic values.** Extract repeated or meaningful numbers and strings into named constants (for example `PANEL_WATTAGE`, `TARIFF_PER_KWH`).
6. **Early returns over deep nesting.** Keep nesting to two or three levels at most.
7. **DRY, but not at any cost.** Extract duplication when the same logic appears three times. Do not build abstractions for hypothetical future needs.

### TypeScript

- `strict` on. **No `any`.** Use `unknown` and narrow, or define the type.
- Define domain types in a `types.ts` next to the code that owns them (for example `src/demos/fieldhand/types.ts`).
- Prefer `type` for shapes and unions; use string-literal unions instead of enums.
- Type component props explicitly. Export prop types only when another file needs them.
- Validate anything read from `localStorage` before trusting it (it can be stale or corrupted).

### React

- Function components only. Named exports for components; default exports only where Next.js requires them (`page.tsx`, `layout.tsx`).
- **Server Components by default.** Add `"use client"` only to the smallest component that needs state, effects, or browser APIs.
- Keep logic out of JSX. Move non-trivial logic into custom hooks (`useXyz`) or pure helper functions in `lib/`.
- Keep pure logic (calculations, filtering, sorting, reducers) in plain functions that take input and return output, so it is easy to read and test.
- Use a reducer (`useReducer`) when state has multiple related transitions (for example the dispatch board).
- Every list needs a stable `key`. Never use array index as a key for reorderable lists.
- No prop drilling past two levels: use composition or a small context scoped to the demo.

### Files and naming

- Components: `PascalCase.tsx`. Hooks: `useCamelCase.ts`. Helpers and data: `camelCase.ts`. Folders: `kebab-case`.
- One main component per file. Co-locate a small private subcomponent only if it is used nowhere else.
- Imports ordered: external packages, then `@/` absolute imports, then relative imports. Use the `@/` alias for anything outside the current folder.
- Mock data lives in `data/` as typed constants, never inline in components.

### Styling

- Use Tailwind utilities with the demo's token variables (for example `bg-[var(--mrd-surface)]`, or Tailwind theme extensions mapped to those variables).
- When a class list gets long or repeated, extract a component, not an `@apply` blob.
- No inline `style` except for genuinely dynamic values (computed positions, CSS variable injection).
- No hard-coded hex colors in components. Colors come from tokens.

### Comments and documentation

- Each demo has a short `README.md` in its folder: what it is, what mechanics it demonstrates, how its mock data works. Keep it under one screen.
- Complex algorithms (route-path animation math, savings calculation, board drag logic) get a short comment block explaining the approach.

---

## 7. Design and UX quality bar

These are non-negotiable for every demo.

**Visual**
- A clear, committed aesthetic direction per the brief in `PLAN.md`. Bold, not timid.
- Real typographic hierarchy, deliberate spacing rhythm, and a considered grid. Use asymmetry and overlap where it serves the design.
- Atmosphere and depth: gradients, textures, grain, patterns, layered shapes, all generated with SVG, CSS, or canvas.
- **No stock photography and no external image URLs.** Use SVG illustration, CSS/canvas art, and generated patterns. Where a real photo would go for a real client, render a deliberate, well-designed placeholder panel with a small label (for example `IMAGE SLOT · 4:5 · product shot`).
- No emoji as UI icons. No lorem ipsum anywhere. All copy is written, specific, and persuasive, using realistic names, prices, and data (Nigerian context: ₦, Lagos, Abuja, Port Harcourt, local names and phone formats).

**Motion**
- Motion has a job: guide attention, confirm an action, or tell a story. No gratuitous animation.
- One well-orchestrated page-load sequence beats scattered effects.
- Each demo has its own motion personality (see `PLAN.md`).
- Respect `prefers-reduced-motion`: provide a calm fallback for every animation.
- Animate `transform` and `opacity`. Avoid animating layout properties.

**UX**
- Every interactive element has hover, focus-visible, active, and disabled states.
- Forms have inline validation, clear error messages, and a real success state.
- Include empty, loading, and error states wherever data appears.
- Primary action is always obvious. One page, one main goal.
- Touch targets are at least 44×44px on mobile.

**Accessibility (WCAG AA)**
- Text contrast of at least 4.5:1 (3:1 for large text and UI components). Verify the palette, not just the hero.
- Semantic HTML: correct landmarks, heading order, and `button` vs `a` usage.
- Full keyboard navigation with visible focus rings; focus is managed in dialogs, drawers, and command palettes (trap and restore).
- Meaningful `alt` text or `aria-hidden` on decorative SVG; labels on all inputs; `aria-live` for dynamic status updates.

**Responsive**
- Designed for 360px to 1920px. Mobile is a real design, not a squeezed desktop. The Fieldhand tool must remain usable on tablet and degrade gracefully on phone.
- No horizontal scrolling at any width (except deliberate, labeled scroll areas).

**Performance**
- Target Lighthouse 90+ across Performance, Accessibility, Best Practices, and SEO.
- Use `next/font` with `display: swap` and subset fonts; load only the weights and axes used.
- Lazy-load heavy client components (maps, canvas, charts) below the fold. No layout shift.
- Avoid shipping GSAP or large libraries to routes that do not use them.

---

## 8. Workflow rules

1. **One phase per session.** `PLAN.md` lists the phases. Work only on the **current phase**. Do not start the next phase, and do not touch finished demos except to fix bugs in them.
2. **Plan, then build.** At the start of a phase, state the plan in a few lines (files to create, components, data models) before writing code.
3. **Build in vertical slices.** Get the core flow working end to end, then refine. Never leave the app in a broken state at the end of a session.
4. **Verify before you finish.** Before declaring a phase done, run:
   - `npm run lint` and `npm run typecheck` (or the repo equivalents) with zero errors and zero warnings
   - `npm run build` successfully
   - A manual pass in the browser at 360px, 768px, and 1440px widths
   - A keyboard-only pass through the main flow
5. **Update `PLAN.md` at the end of every session.** Tick completed items, set the **Current stage**, add to the **Decisions log**, and write **Handoff notes** (what is done, what is known to be rough, what the next session should know).
6. **Do not mark a phase complete yourself.** Mark it **Ready for review**. Only the project owner marks a phase **Approved**.
7. **Ask before big departures.** If the brief seems wrong or a requirement conflicts with another, flag it in the Handoff notes and pick the safer option. Do not silently change the scope.
8. **Commit in logical chunks** with clear messages in the form `feat(fieldhand): add drag-and-drop dispatch board`. Use `feat`, `fix`, `refactor`, `style`, `chore`, `docs`.

---

## 9. Things to avoid

- Generic AI-looking output: centered hero + three feature cards + gradient button, repeated across demos.
- Overused fonts (Inter, Roboto, Arial, Space Grotesk) and cliché palettes (purple-on-white gradients).
- Reusing one layout skeleton across demos.
- Fake functionality that does nothing when clicked. If it looks interactive, it works (even if mocked).
- External network requests at runtime (images, fonts from CDNs, analytics, APIs).
- Large unexplained dependencies, global CSS that leaks across demos, and `any`.
- Leaving placeholder text, broken links, or dead buttons.
- Hydration mismatches: anything that depends on `window`, `localStorage`, `Date.now()`, or `Math.random()` must be handled on the client after mount.

---

## 10. Definition of done (for any phase)

- [ ] Matches the design brief in `PLAN.md` and feels distinct from the other demos
- [ ] All interactive features work, including edge, empty, and error states
- [ ] Responsive at 360 / 768 / 1440 with no horizontal scroll
- [ ] Keyboard-navigable with visible focus; AA contrast verified
- [ ] `prefers-reduced-motion` handled
- [ ] Lint, typecheck, and build pass cleanly
- [ ] No dead code, stray logs, TODOs, or lorem ipsum
- [ ] Demo `README.md` written
- [ ] `PLAN.md` updated with status and handoff notes
