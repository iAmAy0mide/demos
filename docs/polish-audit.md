# Phase 8A polish audit

Date: 2026-10-15

## Scope and method

This is the pre-fix baseline for the hub and every registered demo route. Product code was not changed. Lighthouse results below are the median of three runs whenever any category scored below 90. Browser audits used the production build. Raw Lighthouse reports and visual artifacts are in the gitignored `.audit/` directory.

The responsive matrix was 320×568, 360×740, 390×844, 412×915, 768×1024, 1024×900, 1296×640, 1440×900 and 1920×1080. The visual baseline covered 390×844, 768×1024 and 1440×900; all 135 comparisons were below the advisory 1% threshold, with a maximum difference of 0.022%.

## Lighthouse

Scores are Performance / Accessibility / Best Practices / SEO. LCP and TBT are milliseconds; JS is transferred script data in KiB. Expected 404 responses produce zero Lighthouse category scores because Lighthouse rejects the non-2xx document; those rows are retained as evidence but require DOM and visual checks instead of score remediation.

| Route                                                  | Profile | Perf | A11y |  BP | SEO |  LCP |   CLS |  TBT | JS KiB |
| ------------------------------------------------------ | ------- | ---: | ---: | --: | --: | ---: | ----: | ---: | -----: |
| `/`                                                    | mobile  |   62 |   97 |  96 | 100 | 4118 |     0 | 1265 |    231 |
| `/`                                                    | desktop |   40 |   94 |  96 | 100 | 4258 |     0 | 1780 |    231 |
| `/work/fieldhand?job=VL-1042`                          | mobile  |   84 |   90 | 100 |  66 | 2969 |     0 |  429 |    174 |
| `/work/fieldhand?job=VL-1042`                          | desktop |   58 |   91 | 100 |  66 | 3045 |     0 |  582 |    174 |
| `/work/fieldhand/quotes`                               | mobile  |   84 |   96 | 100 |  66 | 3097 |     0 |  394 |    174 |
| `/work/fieldhand/schedule?job=VL-1042`                 | mobile  |   82 |   91 | 100 |  66 | 2972 |     0 |  519 |    174 |
| `/work/sunreach`                                       | mobile  |   87 |  100 | 100 |  66 | 2998 |     0 |  303 |    155 |
| `/work/sunreach`                                       | desktop |   64 |  100 | 100 |  66 | 3095 |     0 |  356 |    155 |
| `/work/meridian`                                       | mobile  |   88 |   94 | 100 |  66 | 2776 |     0 |  336 |    157 |
| `/work/meridian`                                       | desktop |   64 |   94 | 100 |  66 | 2807 |     0 |  422 |    163 |
| `/work/meridian/about`                                 | mobile  |   93 |   91 | 100 |  66 | 2174 |     0 |  284 |    152 |
| `/work/meridian/contact`                               | mobile  |   89 |   92 | 100 |  66 | 2828 |     0 |  294 |    152 |
| `/work/meridian/quote`                                 | mobile  |   85 |   93 | 100 |  66 | 2945 | 0.124 |  279 |    155 |
| `/work/meridian/quote`                                 | desktop |   70 |   93 | 100 |  66 | 2981 | 0.065 |  288 |    163 |
| `/work/meridian/services`                              | mobile  |   93 |   92 | 100 |  66 | 2123 |     0 |  280 |    150 |
| `/work/meridian/services/sea-freight`                  | mobile  |   89 |   89 | 100 |  66 | 2641 |     0 |  326 |    155 |
| `/work/meridian/services/air-freight`                  | mobile  |   95 |   89 | 100 |  66 | 1524 |     0 |  238 |    155 |
| `/work/meridian/services/road-freight`                 | mobile  |   94 |   89 | 100 |  66 | 1897 |     0 |  273 |    155 |
| `/work/meridian/services/customs-clearance`            | mobile  |   92 |   89 | 100 |  66 | 2184 |     0 |  309 |    155 |
| `/work/meridian/services/warehousing`                  | mobile  |   93 |   89 | 100 |  66 | 2720 |     0 |  263 |    155 |
| `/work/meridian/track`                                 | mobile  |   90 |   92 | 100 |  66 | 2972 | 0.012 |  250 |    158 |
| `/work/meridian/track`                                 | desktop |   68 |   92 | 100 |  66 | 2985 | 0.014 |  329 |    163 |
| `/work/harmattan`                                      | mobile  |   91 |   96 | 100 |  66 | 2843 |     0 |  284 |    159 |
| `/work/harmattan`                                      | desktop |   68 |   96 | 100 |  66 | 2955 |     0 |  336 |    165 |
| `/work/harmattan/cafes`                                | mobile  |   92 |   96 | 100 |  66 | 2073 |     0 |  277 |    160 |
| `/work/harmattan/coffees`                              | mobile  |   89 |   95 | 100 |  66 | 2836 |     0 |  299 |    161 |
| `/work/harmattan/coffees/mambilla-morning`             | mobile  |   89 |   96 | 100 |  66 | 2751 | 0.001 |  307 |    164 |
| `/work/harmattan/coffees/lekki-after-rain`             | mobile  |   87 |   96 | 100 |  66 | 2850 | 0.011 |  343 |    164 |
| `/work/harmattan/coffees/abuja-blue-hour`              | mobile  |   89 |   96 | 100 |  66 | 2827 | 0.010 |  280 |    164 |
| `/work/harmattan/coffees/ojota-night-drive`            | mobile  |   89 |   96 | 100 |  66 | 2806 | 0.001 |  281 |    164 |
| `/work/harmattan/coffees/zaria-sun`                    | mobile  |   90 |   96 | 100 |  66 | 2758 |     0 |  280 |    164 |
| `/work/harmattan/coffees/harmattan-dust`               | mobile  |   87 |   96 | 100 |  66 | 2800 |     0 |  349 |    164 |
| `/work/harmattan/journal`                              | mobile  |   90 |   96 | 100 |  66 | 2752 |     0 |  284 |    161 |
| `/work/harmattan/journal/a-lagos-pour-over`            | mobile  |   90 |   96 | 100 |  66 | 2773 |     0 |  285 |    160 |
| `/work/harmattan/journal/why-taraba-tastes-like-honey` | mobile  |   94 |   96 | 100 |  66 | 2083 |     0 |  266 |    160 |
| `/work/harmattan/roast-lab`                            | mobile  |   94 |   96 | 100 |  66 | 2034 |     0 |  267 |    160 |
| `/work/harmattan/story`                                | mobile  |   91 |   96 | 100 |  66 | 2635 |     0 |  284 |    155 |
| `/work/harmattan/subscribe`                            | mobile  |   90 |   96 | 100 |  66 | 2778 |     0 |  266 |    158 |
| `/work/harmattan/subscribe`                            | desktop |   68 |   96 | 100 |  66 | 2864 |     0 |  335 |    165 |
| `/work/harmattan/wholesale`                            | mobile  |   90 |   96 | 100 |  66 | 2788 |     0 |  290 |    160 |
| `/work/rentbook`                                       | mobile  |   63 |  100 |  96 |  66 | 3418 |     0 | 2570 |    178 |
| `/work/rentbook`                                       | desktop |   46 |  100 | 100 |  66 | 3405 |     0 | 4184 |    180 |
| `/work/rentbook/maintenance`                           | mobile  |   63 |  100 | 100 |  66 | 3378 |     0 | 2522 |    180 |
| `/work/rentbook/payments`                              | mobile  |   63 |  100 | 100 |  66 | 3292 |     0 | 4532 |    178 |
| `/work/rentbook/properties`                            | mobile  |   63 |  100 | 100 |  66 | 3464 |     0 | 2359 |    178 |
| `/work/rentbook/properties/property-1`                 | mobile  |   65 |   99 |  96 |  66 | 3162 |     0 | 2276 |    181 |
| `/work/rentbook/rent-roll`                             | mobile  |   64 |  100 | 100 |  66 | 3294 |     0 | 2563 |    178 |
| `/work/rentbook/reports`                               | mobile  |   63 |  100 | 100 |  66 | 3425 |     0 | 2350 |    178 |
| `/work/rentbook/tenants`                               | mobile  |   63 |   96 | 100 |  66 | 3487 |     0 | 2266 |    178 |
| `/work/rentbook/tenants/tenant-1`                      | mobile  |   63 |  100 |  96 |  66 | 3360 |     0 | 2540 |    180 |
| `/work/meridian/not-an-route`                          | mobile  |    0 |    0 |   0 |   0 |    0 |     0 |    0 |      0 |
| `/work/harmattan/not-an-route`                         | mobile  |    0 |    0 |   0 |   0 |    0 |     0 |    0 |      0 |
| `/work/rentbook/tenants/not-a-tenant`                  | mobile  |   64 |  100 | 100 |  66 | 3097 |     0 | 3739 |    178 |
| `/audit-route-not-found`                               | mobile  |    0 |    0 |   0 |   0 |    0 |     0 |    0 |      0 |

## Accessibility

The axe matrix covered every route at 1296×640 and 390×844, tagged overlays, and both Fieldhand themes. Counts are affected nodes, not merely distinct rule names.

| Impact    | Affected nodes | Representative evidence                                                                                                |
| --------- | -------------: | ---------------------------------------------------------------------------------------------------------------------- |
| Critical  |              8 | `select-name` on Fieldhand status selects across dispatch/schedule, themes and viewports                               |
| Serious   |            782 | Predominantly `color-contrast`, including content reached through the hub's preview iframes                            |
| Moderate  |            151 | Duplicate banner/landmark ownership in Harmattan and Rentbook overlays; missing main/region landmarks on expected 404s |
| Minor     |             50 | `aria-allowed-role` on Harmattan drawers and Rentbook shortcut-hint semantics                                          |
| **Total** |        **991** | Full route, state and selector detail was printed by `npm run audit:a11y`                                              |

Some requested overlay states were not reachable by the generic audit action: Fieldhand assign/create, several Rentbook payment drawers, and the payment receipt. Those states need focused accessibility coverage in 8C rather than being treated as clean.

## Touch targets

The 390×844 touch pass found 799 visible interactive elements below 44×44 CSS px. Inline links inside paragraphs were exempt.

| Demo      | Offenders | Largest route-level concentrations                                      |
| --------- | --------: | ----------------------------------------------------------------------- |
| Hub       |        21 | `/` 21                                                                  |
| Fieldhand |        28 | dispatch 22; schedule 5; quotes 1                                       |
| Sunreach  |         2 | `/work/sunreach` 2, including the hidden skip link false positive       |
| Meridian  |       118 | home 22; services index 12; tracking 12; service detail pages 9–10 each |
| Harmattan |        64 | coffees index 14; home 12; coffee detail pages 3 each                   |
| Rentbook  |       566 | payments 442; rent roll 48; tenant detail 18; property detail 12        |
| **Total** |   **799** | —                                                                       |

## Reduced motion

| Measure                                                | Result                                                   |
| ------------------------------------------------------ | -------------------------------------------------------- |
| Running CSS/Web Animations over 100ms or infinite      | 0 on every route                                         |
| Active scroll-timeline animations                      | 0 on every route                                         |
| Canvas                                                 | Hub only: 1 canvas                                       |
| `requestAnimationFrame` callbacks during the 2s sample | 0–13 per route; no sustained loop signature was observed |

The reduced-motion baseline passes. The hub canvas emitted 13 callbacks during initialization but did not remain in a continuous animation loop.

## Bundle review

Sizes are the per-route production JS asset totals reported by the build manifest. “Unused Motion” means the route ships the Motion signature without a detected use in that route bundle.

| Route group                                        |                 JS bytes | Large library result      |
| -------------------------------------------------- | -----------------------: | ------------------------- |
| `/` and `/audit-route-not-found`                   |                   658825 | Motion used               |
| Fieldhand dispatch / quotes / schedule             | 742431 / 745673 / 748492 | Unused Motion             |
| Sunreach                                           |                   691255 | Unused Motion             |
| Meridian home / service details                    |                   673862 | Motion used               |
| Meridian about / contact                           |                   679461 | Motion used               |
| Meridian quote                                     |                   686057 | Motion used               |
| Meridian services                                  |                   674073 | Motion used               |
| Meridian tracking                                  |                   680669 | Motion used               |
| Harmattan home / coffees / story                   |                   687164 | Unused Motion             |
| Harmattan cafes / journal / roast lab / wholesale  |                   699050 | Unused Motion             |
| Harmattan coffee detail pages                      |                   698859 | Unused Motion             |
| Harmattan subscribe                                |                   694850 | Unused Motion             |
| Rentbook overview                                  |                   716055 | Unused Motion             |
| Rentbook maintenance                               |                   721954 | Unused Motion             |
| Rentbook payments                                  |                   721492 | Unused Motion             |
| Rentbook properties and property detail            |                   724969 | Unused Motion             |
| Rentbook rent roll                                 |                   725446 | Unused Motion             |
| Rentbook reports                                   |                   723271 | Unused Motion             |
| Rentbook tenants, tenant detail and invalid tenant |                   719047 | Unused Motion             |
| Meridian/Harmattan expected 404 pages              |                   451799 | No large library detected |

No GSAP or dnd-kit bundle signature was found.

## Layout shift

The 390×844 observer covered load plus a three-second scroll on every route.

| Route                        | Observed CLS | Shifting element |
| ---------------------------- | -----------: | ---------------- |
| `/work/meridian/quote`       |       0.1229 | `footer`         |
| `/work/meridian/track`       |       0.0277 | `footer`, `a`    |
| Every other registered route |       0.0000 | None             |

## Responsive overflow and shell clearance

Genuine horizontal overflow was found on the hub at 320px; Meridian home at 320–412px; Meridian quote at 320–390px; all Meridian service-detail tables at 320–412px; Harmattan roast lab at 412px; Rentbook overview/payments at 320px; and Rentbook tenants at 768px because its horizontal scroller lacks `data-scroll-x="intentional"`. Sunreach's visually hidden skip link was also reported at `left: -1px` at every width and is an audit false positive.

The floating Axmion shell overlapped interactive content on Sunreach at 320–768px; Rentbook maintenance, properties, property detail and tenants at phone widths; Rentbook payments, properties/property detail and tenants at several tablet/desktop sizes; Fieldhand dispatch at 768, 1024 and 1440; and Fieldhand schedule at 1296×640. Meridian and Harmattan had no shell-clearance conflicts.

## Ranked problems

| Rank | Priority | Route(s)                                                                     | Problem and evidence                                                                                                                                                                      | Suggested fix                                                                                                                                                           | Phase |
| ---: | -------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
|    1 | P0       | All Rentbook routes                                                          | Performance is 63–65 mobile and 46 desktop; TBT reaches 4532ms on payments and 4184ms on overview desktop.                                                                                | Profile hydration and seed/render cost, paginate or virtualize long ledgers, and defer non-critical panels.                                                             | 8B    |
|    2 | P0       | `/`                                                                          | Performance is 62 mobile and 40 desktop; LCP is 4.1–4.3s and TBT 1.3–1.8s.                                                                                                                | Profile the hero/preview pipeline, reduce initial JS and defer below-fold previews.                                                                                     | 8B    |
|    3 | P0       | Fieldhand routes                                                             | Performance is 82–84 mobile and 58 on dispatch desktop; TBT reaches 582ms.                                                                                                                | Split route-specific clients and defer dispatch-only surfaces.                                                                                                          | 8B    |
|    4 | P0       | Sunreach, Meridian home/track/quote, Harmattan home/subscribe                | Desktop performance is 64–70; multiple mobile routes are also below 90.                                                                                                                   | Audit route-level client boundaries, fonts and render-blocking work.                                                                                                    | 8B    |
|    5 | P0       | All concept-demo routes                                                      | Lighthouse SEO is 66 because fictional demos are intentionally `noindex`; the runner also reports missing `metadataBase`.                                                                 | Confirm the noindex policy, set `metadataBase`, and document a demo-aware SEO threshold rather than silently accepting 66.                                              | 8E    |
|    6 | P0       | Fieldhand dispatch and schedule                                              | Eight critical `select-name` nodes across viewports/themes.                                                                                                                               | Add persistent programmatic labels to each status select and focused axe regression cases.                                                                              | 8C    |
|    7 | P0       | Cross-site, especially Fieldhand and embedded previews                       | 782 serious axe nodes, predominantly color contrast.                                                                                                                                      | Group by token/selector, correct shared color pairs within each demo, and rerun every theme/state.                                                                      | 8C    |
|    8 | P0       | Meridian home, quote and service details; hub; Rentbook; Harmattan roast lab | Real horizontal overflow across required phone/tablet widths.                                                                                                                             | Fix the listed width constraints; mark only deliberate table/list scrollers with `data-scroll-x="intentional"`.                                                         | 8D    |
|    9 | P0       | Sunreach, Rentbook, Fieldhand                                                | The Axmion shell covers interactive controls at phone, tablet and some desktop sizes.                                                                                                     | Reserve the documented safe area or reposition route controls without changing visual hierarchy.                                                                        | 8D    |
|   10 | P0       | Fieldhand and Rentbook interactive flows                                     | Fieldhand B7 leaves its focus-dismissed surface open. Rentbook R4/R5/R7–R10 fail on missing controls, unavailable command palette or ambiguous control ownership; R1–R3, R6 and R11 pass. | Separate product failures from stale locator assumptions, then repair focus dismissal, command access and unique accessible control ownership with focused regressions. | 8C    |
|   11 | P1       | Rentbook payments and rent roll                                              | 566 Rentbook touch-target failures; payments contributes 442 receipt links and rent roll 48 controls.                                                                                     | Increase hit areas without enlarging the visible type or changing table structure.                                                                                      | 8D    |
|   12 | P1       | Meridian, Harmattan, hub and Fieldhand                                       | 231 non-Rentbook touch-target failures, including SVG markers, navigation links, summaries and compact controls.                                                                          | Add pseudo-element or padding hit areas while preserving each design.                                                                                                   | 8D    |
|   13 | P1       | `/work/meridian/quote`                                                       | Observed CLS 0.1229 and Lighthouse CLS 0.124 on mobile; footer is the shifting source.                                                                                                    | Reserve the form/result height and prevent the footer from moving after hydration.                                                                                      | 8D    |
|   14 | P1       | Fieldhand, Sunreach, Harmattan and Rentbook                                  | Production manifests include Motion where the audit detects no use; route totals reach 748492 bytes.                                                                                      | Remove unused imports/providers or isolate Motion to the routes/components that animate.                                                                                | 8B    |
|   15 | P2       | Expected 404s and overlay audit coverage                                     | Three expected 404s return zero Lighthouse scores; axe finds missing landmarks, and several tagged overlays could not be opened generically.                                              | Add 404-specific semantic checks and focused overlay-state audit actions.                                                                                               | 8E    |

## Verification disposition

- `npm run format`: pass.
- `npm run check`: pass with 25 existing size/complexity warnings and zero errors.
- `npm run audit:lighthouse`, `audit:a11y`, `audit:touch-targets`, `audit:reduced-motion`, `audit:bundle`, `audit:layout-shift`, `visual:capture` and `visual:compare`: completed.
- Full overflow and pill-clearance matrices: completed and intentionally exit red because the findings above are product issues reserved for later Phase 8 slices.
- `npm run build`: pass; 49 static pages generated. The existing `metadataBase` warning remains.
- `npm run check:full`: formatting, lint, typecheck, metadata, anatomy, demo-link and mobile-menu checks pass; the command then exits red at the documented overflow matrix, so later chained stages do not run.
- `npm run e2e`: Fieldhand P1–P8 and B1–B6 pass; B7 fails because focus-leave dismissal stays open. The chained Rentbook command was then run independently: R1–R3, R6 and R11 pass; R4, R5 and R7–R10 fail. Screenshots were written to `.screenshots/e2e/`.
