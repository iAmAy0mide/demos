# Axmion Showcase

Concept work by Axmion Web Innovations: a showcase hub and four distinct demo websites for Nigerian and international businesses.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run lint
npm run typecheck
npm run build
npm run start
```

## Structure

- `app/` holds thin App Router route files and scoped layouts.
- `src/demos/` holds each demo's components, mock data, helpers, tokens, and notes.
- `src/shared/demo-shell/` is the only shared visual UI: the neutral floating concept-navigation pill.
- `src/shared/lib/` is reserved for generic unstyled utilities.
- `src/types/` is reserved for cross-cutting types.

See `PLAN.md` for the active phase and delivery checklist.
