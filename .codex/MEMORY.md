# FutureATC Lab — Durable Project Memory

## Resume protocol

Before acting, read this file and `.codex/task-memory.md`, then follow the current gate and exact next action. Do not advance to another gate without the user's explicit approval in the form required by the five-gate workflow.

## Current state

- Owner: Codex primary agent
- Last updated (UTC): 2026-07-28T18:33:06Z
- Current gate: Gate 4 — Implementation and PR Workflow
- Approval status: Gates 1, 2, and 3 explicitly approved; Gate 4 in progress
- Last completed action: Committed the expanded scenario/browser verification and README capability notes as `90c14ce` (`test: verify decision support scenarios`).
- Exact next action: Commit the complete PR 3 validation ledger, rerun the exact branch suite, and review the cumulative branch diff before publication.
- Blockers: None.

## Fixed project facts

- Working name: FutureATC Lab — AI-Assisted Air Traffic Management Simulator
- Repository name: `ai-air-traffic-management`
- Authenticated GitHub owner: `gauravpandey4`
- Expected public URL: `https://gauravpandey4.github.io/ai-air-traffic-management/`
- Academic report title: Emerging Technologies in Air Traffic Management: Role of AI and Automation in Future ATC
- Public student name: omit for now at the user's request; do not display a student identity until explicitly approved later
- Approved public institution: Amity University Uttar Pradesh, Lucknow
- Approved unchanged report title: Emerging Technologies in Air Traffic Management: Role of AI and Automation in Future ATC
- Default region: Lucknow, with a configurable demonstration-region control
- Prior work: conceptual research study only; no prior software implementation is claimed
- Guide/department: omit
- Public product title: FutureATC Lab
- Product type: educational interactive simulator and explainable decision-support demonstration
- Stack: React, Vite, TypeScript, npm
- Hosting: public GitHub repository and GitHub Pages through GitHub Actions
- Default mode: deterministic simulation with complete fallback when external data is unavailable
- Safety: a human controller retains final authority; the site must never claim to control real aircraft or provide operational aviation guidance
- Privacy: do not publish the source report, enrollment number, signatures, certificates, declarations, private email addresses, secrets, or machine-specific private information

## Approved Gate 2 requirements baseline

- The final requirements cover 25 sections spanning product purpose, scope, experience, all seven simulator capabilities, simulation and external-data behavior, explainability, provenance, responsive UI, accessibility, reliability, privacy, safety, testing, GitHub workflow, deployment, acceptance criteria, limitations, and verified sources.
- Deterministic Simulation is the default and complete fallback. External mode uses the state machine `Simulation → Checking → External Active`; invalid, unavailable, stale, offline, blocked, or rate-limited results return to Simulation, and simulated and external aircraft are never mixed.
- Collision projection uses an initial configurable 10-minute CPA horizon. Educational Critical thresholds are `<5 NM` and `<1,000 ft`; Warning thresholds are `<8 NM` and `<2,000 ft`.
- Weather risk uses centralized educational thresholds. Severe examples include gusts `≥35 kt`, visibility `<3 km`, precipitation `≥7.5 mm/h`, or thunderstorm codes. Elevated examples include wind `≥20 kt`, gusts `≥25 kt`, visibility `<8 km`, precipitation `≥2.5 mm/h`, or moderate adverse-weather codes.
- Simulated fuel thresholds are configurable: Low below 30 minutes of estimated endurance and Critical below 15 minutes. External aircraft fuel is unavailable by default.
- Aircraft snapshots are Fresh for at most 30 minutes and scheduled no more often than every 15 minutes. Open-Meteo responses are cached for at least 15 minutes.
- Every derived result exposes facts, units, source/mode, rule or threshold, result, limitations, and the human decision still required. Human-controller confirmation is simulated and retains final authority.
- Lucknow is the configurable default region. Core simulation, explanations, schematic map, and cached assets remain usable offline after a successful first load; external failures are explicit degraded states.
- WCAG 2.2 Level AA is the accessibility target. CI must cover formatting, linting, strict types, unit/component/browser tests, production build, privacy/secret scanning, and relevant accessibility checks.
- Gate 4 acceptance requires all 27 documented criteria; Gate 5 additionally requires the deployed public URL to pass independent smoke and privacy verification.

## Gate 2 artifacts and verification

- `docs/requirements.md`: 51,324 bytes.
- `docs/requirements.docx`: 65,972 bytes; 27 pages.
- DOCX accessibility audit: high 0, medium 0, low 0.
- Exact table geometry audit: passed for every table.
- Synchronization audit: 25 top-level sections and 208 unique requirement IDs match between Markdown and DOCX.
- Visual QA: every rendered page inspected at original detail; no clipping, overlap, broken tables, missing glyphs, or pagination defects.
- Privacy QA: author and last-modified-by metadata are blank; no student name, email, local path, credential pattern, or source PDF is present.

## Gate 3 architecture and execution baseline

- Architecture: static React/Vite/TypeScript SPA; pure deterministic domain engine; explicit reducer/context state; validated browser/Actions adapters; Leaflet connected map with a local schematic fallback; optional Open-Meteo browser weather; same-origin scheduled `adsb.fi` aircraft snapshot; PWA app shell.
- Compatibility: Node 24.16.x, npm 11.x, React 19.2.8, Vite 8.1.5, TypeScript 6.0.3, ESLint 9.39.5, Leaflet 1.9.4, Vitest 4.1.10, Playwright 1.62.0.
- TypeScript 7 was rejected because current TypeScript-ESLint supports TypeScript below 6.1. `react-leaflet` was rejected because its current Hippocratic-2.1 licence is not the chosen conventional permissive dependency baseline; Leaflet will be integrated directly.
- The 2026 `brace-expansion` denial-of-service advisory is present only through development lint/PWA tools. Production dependencies audit clean. `npm audit fix --force` and a global 5.0.8 override are rejected because they would downgrade accessibility tooling or break older minimatch APIs; monitor upstream replacements and revisit in PR 7.
- State: aircraft uses `Simulation → Checking → External Active`, with every invalid/unavailable/stale/offline/rate-limited outcome returning to Simulation. Weather has independent observed/cached/simulated fallback state with mixed-source disclosure.
- Release guard: the Pages workflow may be committed in Gate 4, but scheduled deployment jobs require repository variable `PAGES_RELEASE_ENABLED=true`; the variable stays absent/false and no manual dispatch occurs until Gate 5.
- Sequential Gate 4 PRs:
  1. `chore/repository-foundation`
  2. `feat/simulation-dashboard`
  3. `feat/decision-support`
  4. `feat/weather-integration`
  5. `feat/external-aircraft`
  6. `feat/learning-accessibility`
  7. `test/release-hardening`
- Every PR follows refresh → branch → implement/test/document → full local checks → privacy/diff review → independent review where available → focused commits → push → one PR → green CI → squash merge → local/remote branch cleanup → verified refreshed `main` → memory ledger update.
- Gate 3 artifact: `docs/implementation-plan.md`, 67,374 bytes, 1,651 lines, 9,180 words, 22 numbered sections, seven fully specified PRs, all 27 acceptance IDs mapped, and all 15 mandatory test topics explicitly traced.

## Gate rule

Work on exactly one gate at a time. Coding is prohibited until Gate 3 has been explicitly approved. Deployment is prohibited until Gate 4 has been completed and explicitly approved.

## Latest execution notes

- 2026-07-28T18:06:31Z — PR 2 post-merge verification passed: full quality suite, 7/7 Chromium checks, zero GitHub deployments, and no open pull requests.
- 2026-07-28T18:06:31Z — A combined memory patch failed because the compact memory file does not contain the detailed ledger table; no content changed, and updates were split by file structure.
- 2026-07-28T18:07:22Z — Created `feat/decision-support` from `761e1c8`; commit `1b5c27a` records the PR 2 post-merge ledger and starts PR 3.
- 2026-07-28T18:13:29Z — First PR 3 lint run found one restricted numeric template interpolation in `collision.ts`; explicit string conversion selected.
- 2026-07-28T18:13:56Z — PR 3 strict types rejected a nullable priority-candidate predicate whose declared weather union was broader than its mapped inference; explicit typed accumulation selected.
- 2026-07-28T18:15:59Z — PR 3 decision-test lint rejected `expect.closeTo` values inside `objectContaining` as unsafe; direct `toBeCloseTo` assertions selected.
- 2026-07-28T18:17:22Z — PR 3 integration suite passed 62/63; a broad runway text query matched the lead and explanation, so the assertion will explicitly accept the duplicate accessible presentations.
- 2026-07-28T18:17:22Z — A combined memory/test patch missed a whitespace-aligned ledger row after Prettier; no content changed, and the retry uses exact file structure.
- 2026-07-28T18:19:04Z — Full PR 3 non-browser suite and current 7/7 Playwright suite passed; in-app browser navigation succeeded, but its unsupported `networkidle` wait failed, so verification continues with the supported DOM readiness signal.
- 2026-07-28T18:20:05Z — Manual browser review found random Normal-traffic geometry could trigger four conflict alerts and routine non-arrivals appeared in landing priority; deterministic separation and arrival-only routine queueing selected.
- 2026-07-28T18:22:13Z — Responsive browser geometry passed at 1440/768/390 with no panel or score overflow; subsequent lint found two unreachable baseline status branches after vertical rates were stabilized at zero.
- 2026-07-28T18:22:39Z — Full check stopped at formatting for `decision-support.test.ts`, which was outside the preceding narrow formatter target; project-wide formatting selected.
- 2026-07-28T18:22:39Z — A combined memory patch missed another Prettier-aligned table row; no content changed, and the file-specific retry avoided aligned-row context.
- 2026-07-28T18:23:39Z — Complete check passed format/lint/types, then one movement assertion wrapped at the north edge after deterministic scenario regeneration; center the test fixture before measuring direction.
- 2026-07-28T18:24:30Z — PR 3 full quality suite passed; browser suite passed 7/8, with one broad alert query matching the visible title and explanation result, so exact text matching is required.
- 2026-07-28T18:25:11Z — Expanded browser rerun passed the collision assertion and 7/8 overall; the identical low-fuel title/result duplication requires exact matching too.
- 2026-07-28T18:26:39Z — Expanded browser suite passed 8/8. Cumulative review found projected/fuel severity and low-fuel statistics were not recomputed across every consumer; one derived aircraft view will synchronize map, list, detail, and statistics.
- 2026-07-28T18:26:39Z — A multi-file coherence patch had an invalid hunk boundary and changed no files; implementation is split into structurally valid patches.
- 2026-07-28T18:28:43Z — Post-review coherence rerun passed format/lint/types, 64/64 tests, 94.72/86.33/93.12/95.02 coverage, build/PWA/privacy, and 8/8 Playwright cases.
- 2026-07-28T18:31:46Z — Final cumulative review passed: 66/66 tests, 95.69/89.7/93.12/95.79 global coverage, 98.86/95.09/100/99.2 domain coverage, build/PWA/privacy, 8/8 browser, whitespace, production audit zero, zero deployments, and no open PRs.
- 2026-07-28T18:32:16Z — Commit `e6e17e4` (`feat: add explainable decision engines`) created after staged whitespace/scope review.
- 2026-07-28T18:32:41Z — Commit `21ed6b3` (`feat: present recommendations and human review`) created after staged whitespace/scope review.
- 2026-07-28T18:33:06Z — Commit `90c14ce` (`test: verify decision support scenarios`) created after staged whitespace/scope review.
- 2026-07-28T18:33:06Z — This validation-ledger commit records the fully reviewed PR 3 branch state before the final exact branch suite and publication.
