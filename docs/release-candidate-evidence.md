# Gate 4 Release-Candidate Evidence

This document traces the FutureATC Lab release candidate to the approved acceptance criteria. It is
an evidence guide, not a deployment record. Production remains locked until explicit Gate 4
approval.

## Verification commands

The release candidate is eligible for merge only after these commands pass at the same branch head:

```bash
npm ci
npm run check
npm run test:e2e
npm audit --omit=dev
```

`npm run check` includes formatting, lint, strict TypeScript, unit/component coverage, production
build, deterministic built-artifact verification, and the privacy scan. Playwright serves `dist`
under `/ai-air-traffic-management/`, matching GitHub Pages.

## Acceptance trace

| Criteria | Primary automated evidence                                                                                                         | Manual or artifact evidence                                                                                                                   |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-01–03 | `src/domain/scenarios.test.ts`, `src/domain/simulation.test.ts`, `src/app/App.test.tsx`, Playwright branded-shell/scenario flow    | Default Simulation badge, synchronized marker/list/detail, reproducible reset                                                                 |
| AC-04    | `src/domain/collision.test.ts`, `src/domain/decision-support.test.ts`, Playwright explanation flow                                 | CPA facts, threshold, result, simplification, and human action are visible                                                                    |
| AC-05    | `src/domain/weather.test.ts`, `src/domain/weather-client.test.ts`, weather integration and Playwright fixture                      | Source, time, inputs, contributing thresholds, result, trend, and fallback are visible                                                        |
| AC-06–08 | `src/domain/runway.test.ts`, `src/domain/fuel.test.ts`, `src/domain/priority.test.ts`, decision-support tests                      | Runway contributions, fuel endurance, emergency override, unavailable-runway gate, and queue reason are visible                               |
| AC-09–10 | Simulation/statistics tests and Playwright external denominator/human-review flows                                                 | Statistics use only the active dataset; confirm/reject remains browser-only simulation                                                        |
| AC-11    | App/component tests, Playwright shell and learning flows                                                                           | Permanent exact disclaimer and human-authority boundary                                                                                       |
| AC-12–18 | External normalizer/client/reducer/integration suites, snapshot workflow tests, Playwright success/empty/expiry/offline/tile flows | Simulation remains complete; no mixed aircraft; unsupported fields are Unavailable; provenance and age stay visible                           |
| AC-19–20 | Playwright 1440/768/390/320, 720 CSS-pixel 200%-zoom model, Axe, keyboard, reduced motion, and runtime-error guard                 | Visible focus, readable card-table reflow, non-colour status text, local schematic equivalent                                                 |
| AC-21–23 | `npm run check`, `npm run test:e2e`, `scripts/verify-production-build.ts`                                                          | Exact Pages base, existing local assets, PWA scope/start URL, app-shell cache boundary, compressed initial-script budget, console/page errors |
| AC-24    | `README.md`, this trace, requirements, implementation plan, and in-app learning guide                                              | Purpose, setup, architecture, algorithms, data modes, sources, privacy, safety, limitations, testing, evaluator path                          |
| AC-25    | `scripts/privacy-scan.ts`, production artifact inspection, Git diff/history review                                                 | No private report, identifier, student name, private contact, secret, credential, or local path                                               |
| AC-26    | App/component and Playwright attribution checks                                                                                    | Permanent OpenStreetMap, Open-Meteo, and adsb.fi links; README/requirements licence notes                                                     |
| AC-27    | Post-merge local/remote SHA, GitHub Quality, PR/branch/deployment/variable checks                                                  | Verified only after PR 7 merge and cleanup                                                                                                    |

## External failure and fallback matrix

| Path                                                     | Evidence                                                             | Required result                                                                      |
| -------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Fresh aircraft snapshot                                  | External normalizer/client/integration and Playwright fixture        | Activate one complete External dataset with provider, time, age, and limitations     |
| Valid fresh empty snapshot                               | External normalizer/reducer/integration and Playwright empty fixture | Show a genuine empty External dataset without inventing aircraft                     |
| Network/CORS-style failure                               | Aircraft client and snapshot workflow parameterized tests            | Preserve Simulation and explain unavailability                                       |
| Timeout                                                  | Snapshot workflow timeout test                                       | Publish/consume unavailable state; no crash or repeated browser request              |
| Non-success HTTP/provider unavailable                    | Snapshot workflow/client tests                                       | Preserve Simulation and carry validated status metadata                              |
| HTTP 429                                                 | Snapshot workflow, client, and integration tests                     | Show exact retry only when valid provider metadata exists                            |
| Malformed JSON/schema/value                              | External normalizer/client parameterized tests                       | Reject the whole snapshot; no partial or mixed activation                            |
| Stale/inconsistent timestamps                            | External normalizer/client/integration and Playwright expiry flow    | Reject or expire External data and restore Simulation                                |
| Weather success/cache                                    | Weather parser/client/integration and Playwright fixture             | Use validated observation, source, time, derived classification, and 15-minute cache |
| Weather network/offline/timeout/HTTP/429/invalid/storage | Weather client and integration matrix plus Playwright offline flow   | Restore simulated weather, explain the reason, and avoid fabricated retry time       |
| Map tile failure                                         | Playwright tile-failure flow                                         | Restore the complete local schematic without blocking the simulator                  |
| Warm offline reload                                      | Playwright service-worker flow                                       | Serve cached local shell and simulator; retain honest Offline state                  |

## Scenario and evaluator matrix

| Scenario       | Expected demonstration                                                              |
| -------------- | ----------------------------------------------------------------------------------- |
| Normal traffic | Stable deterministic movement, routine statistics, selection, and runway review     |
| Severe weather | Severe factors and changed reciprocal runway wind contributions                     |
| Collision risk | Reproducible critical CPA pair and complete explanation                             |
| Low fuel       | Low/Critical synthetic endurance alert and increased landing priority               |
| Emergency      | Simulated emergency ahead of routine traffic without overriding runway availability |

The in-app evaluator guide covers all seven capabilities: movement, collision projection, weather
risk, runway scoring, fuel endurance, emergency/landing priority, and selected-dataset statistics.

## Release boundary

- No GitHub Pages deployment is part of Gate 4.
- `PAGES_RELEASE_ENABLED` must remain absent or false.
- The Pages workflow remains gated and is not manually dispatched.
- Provider terms, public HTTP/assets, deployed commit, responsive flows, and privacy are reverified
  at Gate 5 after explicit approval.
