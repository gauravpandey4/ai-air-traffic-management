# FutureATC Lab — Task Memory and Evidence Ledger

## Control record

- Current owner: Codex primary agent
- Last updated (UTC): 2026-07-28T17:11:57Z
- Current gate: Gate 4 — Implementation and PR Workflow
- Gate 1 status: Explicitly approved by the user
- Gate 2 status: Explicitly approved by the user
- Gate 3 status: Explicitly approved by the user
- Gate 4 status: In progress
- Last completed action: Sixth check passed format/lint/types, 5/5 tests, 100% measured foundation coverage, and build; privacy scan found a third-party package maintainer email in generated `package-lock.json`.
- Exact next action: Exclude generated lockfile metadata from the authored-content privacy scan and rerun all checks; the lockfile remains committed for reproducibility.
- Current blockers: None.

## User instructions and approvals

| UTC timestamp        | Record                                                                                                                                                                                                                                                                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-28T13:01:38Z | User supplied the complete five-gate project brief and instructed Codex to begin with Gate 1 only. No gate approval has yet been given.                                                                                                                                                                                                             |
| 2026-07-28T13:19:48Z | User reported that the Xcode license action and GitHub CLI installation are complete. Verification is pending.                                                                                                                                                                                                                                      |
| 2026-07-28T13:28:45Z | User answered all Gate 1 project questions: omit the public student name for now; keep the report title unchanged; approve the institution name; use configurable Lucknow default; confirm research-only prior scope; no rubric/deadline/demo-duration requirements supplied; omit guide/department; approve FutureATC Lab; no source PDF supplied. |
| 2026-07-28T13:30:48Z | User explicitly approved Gate 1 with `APPROVE GATE 1`. Gate 2 is authorized; Gate 3 remains locked.                                                                                                                                                                                                                                                 |
| 2026-07-28T16:35:00Z | User replied `approve for gate 2`; exact gate phrase is still required, so Gate 3 remains locked.                                                                                                                                                                                                                                                   |
| 2026-07-28T16:37:44Z | User explicitly approved Gate 2 with the exact response `APPROVE GATE 2`. Gate 3 is authorized; Gate 4 remains locked.                                                                                                                                                                                                                              |
| 2026-07-28T16:56:37Z | User explicitly approved Gate 3 with `APPROVE GATE 3`. Gate 4 implementation and PR work is authorized; Gate 5 deployment remains locked.                                                                                                                                                                                                           |

## Fixed decisions

- Computer: Mac.
- Development interface: Codex app or VS Code with Codex extension.
- Language and app stack: TypeScript, React, Vite.
- Package manager: npm unless a verified compatibility issue requires otherwise.
- Repository: public GitHub repository named `ai-air-traffic-management`.
- Hosting: GitHub Pages using GitHub Actions.
- Cost: free only; no paid APIs, services, or custom domain.
- Browser code must contain no secret API keys.
- Default data mode: deterministic simulation.
- Optional data: legitimate free aircraft and live-weather sources where technically and legally feasible.
- Required fallback: the entire demonstration remains usable when all external APIs fail.
- UI: polished responsive aviation-control dashboard selected and implemented by Codex after Gate 3 approval.
- Gate 2 deliverables: synchronized Markdown and DOCX requirements.
- Pull requests may be merged autonomously only after required checks pass.
- Task memory will be committed during Gate 4.
- After Gate 3 approval, routine technical choices do not require further user approval.

## Report-derived project context

The private source report is a conceptual academic study of future air traffic management. It covers traditional ATC constraints; AI-assisted traffic prediction and conflict detection; automation and human-machine teamwork; GPS, satellite navigation, and ADS-B surveillance; machine learning and analytics; weather-aware decisions; route and runway optimization; fuel and operational efficiency; emergencies; safety, explainability, cybersecurity, and human oversight; and public programs such as FAA NextGen, EUROCONTROL/SESAR, and NASA ATM-X.

Academic-honesty constraint: the work does not demonstrate that a trained machine-learning model or production ATC system exists. The public product will be described as an academic simulation, explainable decision logic, or AI-assisted risk-scoring prototype. It will not claim operational authority or real-aircraft control.

### Approved Gate 1 academic/public context

- Public student identity: omit for now. The user's later explicit instruction controls; no student name will appear until the user deliberately approves one.
- Report title: use unchanged.
- Institution: `Amity University Uttar Pradesh, Lucknow`.
- Demonstration region: Lucknow is the default, but location/region must be configurable within safe supported bounds.
- Prior work: research/conceptual study only. This matters for academic honesty: the site will not imply that the student previously trained a model or built an operational ATC implementation.
- College constraints: none supplied (`NA`); no rubric, mandatory extra sections, deadline, or expected demonstration duration is currently known.
- Guide and department: omit.
- Public title: `FutureATC Lab`.
- Source report: unavailable/not supplied; continue from the detailed embedded project context without copying private report content.

## Requirements and acceptance criteria captured from the brief

The eventual website must demonstrate:

1. Flight tracking.
2. AI-assisted collision detection.
3. Weather prediction and risk assessment.
4. Automatic runway allocation.
5. Fuel monitoring.
6. Emergency landing priority.
7. Live air-traffic statistics.
8. Plain-language explanations for every feature.
9. An unmistakable distinction between simulated and external real data.
10. Final authority retained by a human controller.

### Final Gate 2 baseline

- Scope is fixed across 25 top-level sections and includes all seven requested simulator capabilities plus explainability, provenance, responsive UI, accessibility, reliability, privacy, academic safety, automated testing, GitHub workflow, Pages deployment, 27 acceptance criteria, limitations, and verified attribution.
- Simulation is deterministic, the default, and the complete fallback. The external-data state machine is `Simulation → Checking → External Active`; all unsuccessful or later-invalid external states return to Simulation with an explanation, and external and simulated aircraft are never mixed.
- CPA horizon: configurable, initially 10 minutes. Educational Critical threshold: both `<5 NM` horizontal and `<1,000 ft` vertical at CPA. Warning threshold: both `<8 NM` and `<2,000 ft`.
- Weather risk: centralized/configurable educational thresholds. Severe when any severe condition occurs, including gusts `≥35 kt`, visibility `<3 km`, precipitation `≥7.5 mm/h`, or thunderstorm codes. Elevated when wind `≥20 kt`, gusts `≥25 kt`, visibility `<8 km`, precipitation `≥2.5 mm/h`, or a moderate adverse-weather code occurs.
- Fuel: deterministic simulated estimates; Low below 30 minutes endurance and Critical below 15 minutes, both configurable. External fuel is `Unavailable` unless a future, explicitly approved educational estimate is clearly labelled.
- Freshness/caching: aircraft snapshot Fresh for at most 30 minutes; scheduled job no more frequent than every 15 minutes; Open-Meteo browser cache at least 15 minutes.
- Every result must disclose input facts/units, source/mode, applied rule/formula/threshold, output, contributing factors, assumptions/missing data, and required human decision.
- Lucknow remains the configurable default region. The core experience works without external APIs and, after first successful asset load, offline with a local schematic map fallback.
- Human controller remains final authority; confirmation/rejection is an educational UI action with no real-world effect.
- WCAG 2.2 Level AA is the target. Quality gates include formatting, ESLint, strict TypeScript, unit/component/browser tests, production build, privacy/secret scanning, relevant accessibility checks, and manual visual/keyboard/focus/zoom review.
- Gate 4 is ready for approval only after all 27 acceptance criteria pass locally and in CI. Gate 5 additionally requires independent verification of the deployed public URL.

### Gate 2 artifacts

| Artifact                 | Final state                                                      |
| ------------------------ | ---------------------------------------------------------------- |
| `docs/requirements.md`   | 51,324 bytes; canonical synchronized Markdown                    |
| `docs/requirements.docx` | 65,972 bytes; 27-page professionally formatted approval artifact |

### Gate 2 QA evidence

- Visual render: 27/27 pages inspected at original detail; no clipping, overlap, broken tables, missing glyphs, or pagination defects.
- Accessibility audit: high 0, medium 0, low 0.
- Table geometry: all `tblW`, `tblInd`, `tblGrid`, and `tcW` values match.
- Synchronization: all 25 top-level sections found in DOCX; 208 unique requirement IDs match exactly between Markdown and DOCX.
- Privacy: DOCX creator and last-modified-by fields are blank; no public student name, email, local path, token pattern, source PDF, or private report exists in `docs`.
- Hyperlinks: 15 hyperlink relationships; all use descriptive labels and no Markdown link label contains literal backticks.

## Environment evidence

Checked on 2026-07-28 during Gate 1:

| Check                 | Result                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------- |
| macOS                 | macOS 26.5.1, build 25F80                                                                    |
| Processor             | Apple Silicon / `arm64`                                                                      |
| Available disk        | Approximately 39 GiB available on the data volume                                            |
| Project target        | Did not exist before this task; created without overwriting prior work                       |
| Project write access  | Confirmed writable                                                                           |
| Terminal access       | Confirmed commands execute from the Codex environment                                        |
| Xcode tools path      | `/Applications/Xcode.app/Contents/Developer`                                                 |
| Xcode license         | Not accepted; blocks the system Git executable                                               |
| Homebrew              | Installed, version 4.4.0                                                                     |
| Node.js               | Installed, v24.16.0                                                                          |
| npm                   | Installed, 11.13.0                                                                           |
| Git                   | Verified operational: Apple Git 2.50.1                                                       |
| GitHub CLI            | Verified operational: 2.96.0                                                                 |
| Git author            | Name and email are configured; private email value intentionally omitted from project memory |
| GitHub network        | Confirmed reachable with HTTP 200                                                            |
| GitHub authentication | Authenticated account: `gauravpandey4`; active HTTPS Git credentials configured              |

## Technical research ledger

Research completed 2026-07-28 using official/primary documentation and direct HTTP checks.

### Aircraft positions

Preferred Gate 2 candidate: the public `adsb.fi` open-data regional endpoint, used only by a conservative GitHub Actions snapshot job—not directly from the browser.

- Official documentation and terms: https://github.com/adsbfi/opendata/blob/main/README.md
- Endpoint: `https://opendata.adsb.fi/api/v3/lat/{lat}/lon/{lon}/dist/{dist}`
- Authentication: no API key for public regional queries.
- Allowed use: personal, non-commercial use; this public, ad-free academic demonstration fits that stated category.
- Attribution: the site must cite and link to `adsb.fi`.
- Scope control: regional requests support up to 250 nautical miles. The demonstration will use a much smaller Lucknow-centred region.
- Published limit: public endpoints are limited to 1 request per second. Planned access is one request per scheduled run, far below that rate.
- Availability: best effort, no warranty; service access may be suspended.
- Browser CORS test on 2026-07-28: a valid regional GET returned HTTP 200 and current aircraft JSON, but no `Access-Control-Allow-Origin`; OPTIONS returned HTTP 405. Direct GitHub Pages browser access is therefore unsuitable.
- Retry behavior: official documentation identifies HTTP 429 but does not promise a retry header. The system must parse a valid `Retry-After`/reset value if present and otherwise say to try later without inventing a time.
- Data label: every successful published file must be labelled **near-live snapshot**, never real-time, and must include source, fetched timestamp, age/freshness, availability, and any valid retry time.
- Fallback: if fetching, validation, freshness, or deployment fails, the UI remains in Simulation and explains why. Aircraft snapshots must never be silently mixed with simulation aircraft.

Rejected current alternative:

- OpenSky REST API documentation: https://openskynetwork.github.io/opensky-api/rest.html
- OpenSky terms: https://opensky-network.org/about/terms-of-use
- Reason: although anonymous access and documented credit/rate-limit headers exist, the current terms state that operational REST API use in a live product/service/automated system requires a written licence. This project will not request a licence or add credentials, so OpenSky is not suitable for the deployed data path.

Secondary candidate not selected:

- ADSB.lol documentation: https://api.adsb.lol/docs
- It currently offers no-key ODbL data but warns that a feeder-issued API key may be required in future. A direct GET also lacked a CORS allowance. `adsb.fi` has clearer published public-rate and attribution terms for this educational use.

### Weather

Selected Gate 2 candidate: Open-Meteo Forecast API.

- Forecast documentation: https://open-meteo.com/en/docs
- Terms and limits: https://open-meteo.com/en/terms
- Licence and attribution: https://open-meteo.com/en/license
- Authentication: no key for the non-commercial free API.
- Eligibility: official terms explicitly include non-profit websites, public research, and educational content.
- Limits: fewer than 600 calls/minute, 5,000/hour, 10,000/day, and 300,000/month; no uptime guarantee.
- Licence: weather data is CC BY 4.0. Display a nearby link such as “Weather data by Open-Meteo.com” and indicate that the application derives an educational risk score from the forecast.
- CORS/browser compatibility: official repository documents CORS support. A browser-origin GET test returned HTTP 200 with `Access-Control-Allow-Origin: *`.
- Caching: cache one Lucknow-area forecast in-browser, avoid repeated calls, and reuse fresh data.
- Rate limits: handle HTTP 429, respect a valid provider retry value when supplied, otherwise report unavailability without inventing an exact retry time.
- Fallback: simulated weather remains fully functional and is clearly labelled when the API is unavailable, invalid, stale, or rate-limited.

### Map

Selected candidate: Leaflet with the OpenStreetMap Standard raster tile service for normal interactive human viewing, plus a local schematic/grid fallback so simulator controls and aircraft positions remain usable when tiles are offline.

- OSM tile policy: https://operations.osmfoundation.org/policies/tiles/
- Leaflet reference: https://leafletjs.com/reference
- Required tile URL: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`.
- Required visible attribution: `© OpenStreetMap contributors`, linked to the copyright/attribution page.
- Usage obligations: preserve a normal browser Referer, honour browser caching, do not send no-cache headers, bulk-download, prefetch, scrape, or offer offline tile downloads.
- Reliability: best effort with no SLA; tile failure must not break the educational simulator.
- CORS: tile responses advertise `Access-Control-Allow-Origin: *`; a command-line request without browser identification was blocked by policy, confirming that implementation must rely on ordinary interactive browser requests with a valid Referer.
- Privacy: no private or confidential data is sent to the tile service.

### GitHub Actions snapshot and Pages feasibility

- Workflow syntax and schedule: https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax
- Pages custom workflow: https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
- Actions billing: https://docs.github.com/en/actions/concepts/billing-and-usage
- Scheduled workflows run from the latest default-branch commit. Minimum interval is five minutes, but runs can be delayed or dropped at high-load times.
- Standard GitHub-hosted runners are free for public repositories.
- Pages custom workflows support official `configure-pages`, `upload-pages-artifact`, and `deploy-pages` actions. Deployment requires only `pages: write` and `id-token: write` in the deploy job.
- Proposed conservative strategy: fetch one small Lucknow-region aircraft snapshot no more often than every 15 minutes at a non-round cron minute, validate and attach status metadata, build the site with the snapshot as a same-origin asset, and deploy the production artifact. Also support manual dispatch.
- Scheduled workflows in inactive public repositories may be disabled after 60 days. The freshness gate will therefore keep the UI in Simulation when a snapshot ages out; the README will document manual refresh/reactivation.
- The snapshot is labelled near-live and is never treated as operational or safety-grade data.

## Architecture and UI decisions

### Gate 3 architecture

- Static React/Vite/TypeScript single-page application hosted under `/ai-air-traffic-management/`.
- Pure domain layer owns deterministic simulation, CPA, weather risk, runway scoring, fuel, priority, statistics, provenance, and explanations.
- React reducer/context owns state transitions; recommendations/statistics are derived selectors rather than independently mutable state.
- Browser/provider concerns are isolated behind validated adapters. No external data reaches active state before schema, range, count, timestamp, and freshness checks.
- Lucknow is a typed region configuration, not hard-coded inside algorithms.
- Leaflet 1.9.4 is integrated directly through a small typed React adapter. Connected mode uses normal interactive OSM Standard tiles with attribution and normal browser caching; a local schematic is always available.
- Open-Meteo is fetched directly by the browser, cached for at least 15 minutes, and replaced by seeded simulated weather on failure.
- `adsb.fi` is fetched only by an authorized GitHub Actions run. One small regional payload is normalized to a same-origin runner-generated JSON asset and is never committed as history.
- PWA generation precaches the app shell/local assets only; OSM tiles are excluded from offline prefetch/cache behavior.
- UI uses CSS Modules plus global CSS variables, a dark aviation-control visual language, semantic HTML, text equivalents for map/charts, responsive layouts at 1440/768/390, 320-pixel reflow, 200% zoom, keyboard operation, visible focus, and reduced motion.

### Gate 3 dependency evidence

Registry metadata checked 2026-07-28:

- Runtime/build: Node 24.16.x, npm 11.x, React/React DOM 19.2.8, Vite 8.1.5, Vite React plugin 6.0.4.
- Type system/tooling: TypeScript 6.0.3, ESLint 9.39.5, TypeScript-ESLint 8.65.0, Prettier 3.9.6.
- App: Leaflet 1.9.4 (BSD-2-Clause), Lucide React 1.27.0 (ISC), Zod 4.4.3 (MIT).
- Tests: Vitest 4.1.10, React Testing Library 16.3.2, Playwright 1.62.0, Axe Playwright 4.12.1, MSW 2.15.0.
- Offline/scripts: Vite PWA Plugin 1.3.0, `tsx` 4.23.1.
- Rejected TypeScript 7.0.2 because TypeScript-ESLint 8.65.0 declares TypeScript `<6.1`.
- Rejected React-Leaflet 5.0.0 because its Hippocratic-2.1 licence is not the chosen conventional permissive public-project baseline.
- All exact versions/licences/peers must be rechecked before Gate 4 installation; routine compatible patch movement is allowed and recorded.

Official references rechecked: Vite build/base/browser docs, Leaflet 1.9.4 reference, Vite PWA service-worker strategies, Playwright CI, GitHub Pages custom workflows, GitHub Actions schedule behavior, and OSM tile policy.

### Domain decisions

- Aircraft dataset states: `Simulation`, `Checking`, `ExternalActive`; invalid, empty-invalid, stale, future-timestamp, offline, network, timeout, CORS-style, rate-limited, or blocked results preserve/restore Simulation.
- Weather source is independent: simulated, loading, observed-fresh, cached-fresh, or simulated-fallback. Mixed aircraft/weather sources require explicit disclosure.
- CPA uses a local equirectangular projection, relative velocity, zero-speed guard, and time clamped to 0–600 seconds. Monitor is initially `<12 NM` and `<3,000 ft`; approved Warning/Critical thresholds remain unchanged.
- Runway score contributions: base `+50`; unavailable disqualifies; headwind `0..+15`; crosswind `0..-20`; tailwind `0..-30`; queue `-5` each capped `-20`; arrival `0..+10`; low fuel `+15`; critical fuel `+30`; warning/critical conflict `+10/+20`; simulated emergency `+100`; deterministic ties.
- Priority order: emergency, critical fuel, time-critical conflict, severe weather, low fuel, estimated arrival, original stable order.
- External unsupported fuel/intent/route/runway/emergency remains `Unavailable`.
- Every result returns a structured explanation with facts/units, source, rule/threshold, result/factors, limitations, suggested review, and human authority.

### Testing/CI decisions

- Unit/component: Vitest/Testing Library/jsdom; provider/state fixtures via MSW.
- Browser: Playwright Chromium against production build; one worker in CI for reproducibility.
- Accessibility: JSX a11y, Axe Playwright, and mandatory manual keyboard/focus/zoom/reflow/VoiceOver-oriented review.
- Coverage: statements/lines/functions 85%, branches 80%, plus explicit 100% boundary coverage for CPA, fuel, weather, runway availability, retry, freshness, and priority.
- CI on every PR and `main`: `npm ci`, format, lint, strict types, unit/component/coverage, build, privacy/secret scan, and essential Playwright tests.
- Current official action pins are recorded in `docs/implementation-plan.md`; reverify during Gate 4.

### Deployment/live-refresh decisions

- Pages workflow builds only from `main`, uses official configure/upload/deploy actions, minimum permissions, one deployment concurrency group, manual dispatch, and a conservative schedule.
- Workflow can be merged in Gate 4 but scheduled deploy jobs are guarded by absent/false repository variable `PAGES_RELEASE_ENABLED`. Gate 5 sets it to true and performs first manual deployment.
- Authorized snapshot schedule: minutes `2,17,32,47`, no more often than every 15 minutes; delays/drops/60-day inactivity disabling are expected.
- Every run writes a fresh normalized asset or unavailable status in the runner, runs quality/build, and uploads only `dist`; no aircraft history is committed.

## Complete Gate 3 implementation checklist

Each item has exactly one sequential branch and PR. Detailed purpose, visible outcome, files, contracts, dependencies, commits, unit/integration/UI checks, acceptance criteria, risks/fallbacks, review, merge, and cleanup are in `docs/implementation-plan.md`.

1. `chore/repository-foundation` — strict Vite foundation, approved docs/memory/AGENTS, design tokens/shell, CI, guarded Pages workflow.
2. `feat/simulation-dashboard` — region config, seeded simulator, five scenarios, reducer, responsive dashboard, Leaflet/schematic, tracking and details.
3. `feat/decision-support` — CPA, fuel, emergency order, runway score, structured explanations, alerts and human review.
4. `feat/weather-integration` — Open-Meteo validation/cache, simulated fallback, risk/trend, weather UI and attribution.
5. `feat/external-aircraft` — typed snapshot job, same-origin adapter, data state machine, provenance, retry/cooldown, quota/fallback.
6. `feat/learning-accessibility` — statistics, How It Works, glossary/sources/limitations, PWA offline shell, responsive/accessibility polish.
7. `test/release-hardening` — full failure/smoke matrix, README/evaluator guidance, privacy/security/performance review, Gate 4 evidence.

Every PR follows: refresh clean `main`; branch; memory in-progress entry; implementation/tests/docs; local format/lint/type/test/build/browser checks; full privacy/secret/diff review; independent review if available; resolve findings; focused commits; push; one PR; wait/fix CI; squash merge; delete remote/local branch; refresh and verify `main`; update ledger.

The Gate 4 bootstrap before PR 1 is: re-read memory/plan; confirm folder and remote availability; initialize `main`; make only a minimal bootstrap commit; confirm the GitHub repository name is unused; create the public repository; add origin/push; verify default branch; then never push later implementation directly to `main`.

The complete Gate 4 completion checklist and public Gate 5 smoke checklist are Sections 19 and 21 of the plan.

## Checklist and delivery ledger

- Gate 1: Complete and explicitly approved.
- Gate 2: Complete and explicitly approved.
- Gate 3: Complete and explicitly approved.
- Gate 4: In progress.
- Gate 5: Locked pending explicit Gate 4 approval.
- Gate 4 bootstrap is complete; the detailed branch/commit/PR/check/merge/deployment ledger follows.

## Gate 4 branch, commit, PR, and deployment ledger

| UTC                  | Type       | Identifier                                                   | Result                                                                                                                                                |
| -------------------- | ---------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-07-28T16:57:25Z | Error      | Bootstrap staged diff                                        | Whitespace check found blank lines at EOF in `.gitignore` and `README.md`; corrected before commit                                                    |
| 2026-07-28T16:58:09Z | Commit     | `eda283638a2a58253c203892fba34109a14512b8`                   | `chore: bootstrap repository`; pushed to `main`                                                                                                       |
| 2026-07-28T16:58:09Z | Repository | `https://github.com/gauravpandey4/ai-air-traffic-management` | Public repository created; origin/default branch verified                                                                                             |
| 2026-07-28T16:58:09Z | Deployment | None                                                         | Gate 5 remains locked                                                                                                                                 |
| 2026-07-28T16:59:03Z | Branch     | `chore/repository-foundation`                                | Created from verified `main`; PR 1 in progress                                                                                                        |
| 2026-07-28T17:04:04Z | Error      | PR 1 dependency install                                      | `ERESOLVE`: JSX-a11y 6.10.2 does not support ESLint 10; selected supported ESLint 9.39.5 instead of forcing the tree                                  |
| 2026-07-28T17:06:27Z | Error      | PR 1 first quality run                                       | ESLint found five project-service/interpolation/unused-parameter issues; narrow fixes applied, full rerun pending                                     |
| 2026-07-28T17:07:48Z | Error      | PR 1 second quality run                                      | ESLint found five E2E DOM and config self-lint metadata issues; configuration narrowed, full rerun pending                                            |
| 2026-07-28T17:09:05Z | Error      | PR 1 third quality run                                       | Strict types rejected explicit `undefined` for optional Playwright workers; replaced with conditional property                                        |
| 2026-07-28T17:09:56Z | Error      | PR 1 fourth quality run                                      | Vitest discovered the Playwright E2E spec; `e2e/**` excluded from unit-test discovery                                                                 |
| 2026-07-28T17:10:45Z | Error      | PR 1 fifth quality run                                       | All tests passed but error-boundary coverage missed thresholds; recovery/reload test added                                                            |
| 2026-07-28T17:11:57Z | Error      | PR 1 sixth quality run                                       | Generated lockfile contained a third-party maintainer email; authored-content scan now excludes lockfile metadata                                     |
| 2026-07-28T17:13:59Z | Check      | PR 1 complete local check                                    | Format, lint, types, 5/5 tests, 100% measured coverage, build/PWA, and authored-content privacy scan all passed                                       |
| 2026-07-28T17:15:03Z | Check      | PR 1 Playwright Chromium                                     | All 4/4 browser tests passed across desktop, tablet, and mobile viewports                                                                             |
| 2026-07-28T17:15:48Z | Check      | PR 1 responsive visual QA                                    | 1440, 768, and 390 px full-page renders passed with no clipping, overlap, broken hierarchy, or overflow                                               |
| 2026-07-28T17:16:30Z | Error      | PR 1 dependency/workflow review                              | Production audit clean; full audit found development-only `brace-expansion` advisory; forced fix rejected. Bundled Ruby Psych lacked `safe_load_file` |
| 2026-07-28T17:17:31Z | Decision   | PR 1 development advisory                                    | Patched major is API-incompatible with older minimatch; rejected unsafe override/downgrade, accepted dev-only risk for upstream monitoring in PR 7    |
| 2026-07-28T17:17:31Z | Error      | PR 1 review command                                          | Used nonexistent `npm run privacy`; command stopped before later checks and made no changes; corrected to `privacy:scan`                              |
| 2026-07-28T17:18:25Z | Check      | PR 1 security/workflow review                                | Privacy/secrets clean, YAML parsed, no oversized authored files, action pins/permissions/quality and Gate 5 guard reviewed                            |
| 2026-07-28T17:18:50Z | Commit     | `d7d575b`                                                    | `chore: establish strict project toolchain`; staged whitespace/file review passed                                                                     |
| 2026-07-28T17:19:09Z | Commit     | `53e9c77`                                                    | `feat: add FutureATC foundation shell`; staged whitespace/file review passed                                                                          |
| 2026-07-28T17:19:30Z | Error      | PR 1 documentation staged review                             | Markdown metadata hard-break spaces triggered trailing-whitespace checks; commit stopped before creation                                              |
| 2026-07-28T17:20:56Z | Commit     | `7d83dd8`                                                    | `docs: record approved project baseline`; HTML breaks replaced trailing whitespace and staged review passed                                           |
| 2026-07-28T17:21:43Z | Check      | PR 1 final local suite                                       | Format, lint, types, 5/5 tests, 100% coverage, build/PWA, privacy, 4/4 Playwright, and whitespace checks passed                                       |
| 2026-07-28T17:22:19Z | Finding    | PR 1 separate cumulative self-review                         | Scanner covered classic/fine-grained PATs incompletely; expanded to all current GitHub token prefixes and minimum lengths                             |
| 2026-07-28T17:23:25Z | Check      | PR 1 post-review full suite                                  | All quality/browser checks passed again; production dependency audit reported zero vulnerabilities                                                    |
| 2026-07-28T17:24:21Z | Commit     | `712b251`                                                    | `chore: harden privacy validation`; self-review finding resolved and all local checks green                                                           |
| 2026-07-28T17:24:21Z | Commit     | This ledger commit                                           | Records the reviewed PR 1 branch state immediately before push                                                                                        |
| 2026-07-28T17:24:51Z | Push       | `chore/repository-foundation`                                | New remote branch published with upstream tracking at head `68b52cf`                                                                                  |
| 2026-07-28T17:24:51Z | Commit     | This publication-ledger commit                               | Records PR 1 branch publication before pull-request creation                                                                                          |
| 2026-07-28T17:26:00Z | Error      | GitHub integration PR creation                               | HTTP 403 `Resource not accessible by integration`; no PR created, authenticated `gh` fallback selected                                                |
| 2026-07-28T17:26:46Z | PR         | `#1`                                                         | Draft created by authenticated `gh` fallback, then marked ready; targets `main`, Quality check queued                                                 |
| 2026-07-28T17:26:46Z | Commit     | This PR-publication ledger commit                            | Records PR 1 URL/state before the final remote check run                                                                                              |

## Errors and verification

| UTC timestamp        | Symptom                                               | Root cause                                                                                                                  | Fix/status                                                                | Verification                                                                                 |
| -------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| 2026-07-28T13:01:38Z | `git --version` and Git config reads failed           | Apple Xcode license agreements had not been accepted                                                                        | User completed the one-time local license action                          | Verified Git 2.50.1 on 2026-07-28T13:20:14Z                                                  |
| 2026-07-28T13:01:38Z | `gh` command not found                                | GitHub CLI was not installed                                                                                                | User installed GitHub CLI after resolving the Xcode license               | Verified GitHub CLI 2.96.0 and authenticated access on 2026-07-28T13:20:14Z                  |
| 2026-07-28T13:02:43Z | `brew install gh` stopped before making changes       | Homebrew required the Xcode license to be accepted before installing packages                                               | User completed the required local action                                  | Toolchain and GitHub access fully verified on 2026-07-28T13:20:14Z                           |
| 2026-07-28T13:41:37Z | Final DOCX render batch was rejected before execution | The command included a broad `rm -rf` temporary-directory cleanup pattern, which is disallowed by the safe execution policy | Used fresh unique directories from `mktemp -d` with no recursive deletion | Resolved; final 27-page render, visual inspection, and audits passed at 2026-07-28T13:46:20Z |

## Deferred or out of scope

- Production deployment remains explicitly deferred until Gate 5; Gate 4 implementation through reviewed PRs is now authorized and in progress.
- Private source-report material and enrollment information will never be copied into the project.
