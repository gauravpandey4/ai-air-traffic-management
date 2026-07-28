# FutureATC Lab — Durable Project Memory

## Resume protocol

Before acting, read this file and `.codex/task-memory.md`, then follow the current gate and exact next action. Do not advance to another gate without the user's explicit approval in the form required by the five-gate workflow.

## Current state

- Owner: Codex primary agent
- Last updated (UTC): 2026-07-28T20:51:00Z
- Current gate: Gate 4 — Implementation and PR Workflow
- Approval status: Gates 1, 2, and 3 explicitly approved; Gate 4 in progress
- Last completed action: Commit `9e25a8b` records the complete PR 6 local validation and focused commit ledger.
- Exact next action: Verify the exact committed branch, record/push it, open a draft PR, and wait for exact-head CI/review guards.
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
- 2026-07-28T18:33:38Z — Commit `8c1f0c1` (`docs: record decision support validation`) created; branch clean immediately afterward.
- 2026-07-28T18:34:38Z — Commit `2ef3b3a` (`docs: record decision support commits`) created; exact branch quality/browser suite and cumulative diff review passed afterward.
- 2026-07-28T18:34:38Z — This branch-verification ledger will be committed before publishing `feat/decision-support`.
- 2026-07-28T18:35:11Z — Commit `730a8f4` recorded exact branch verification; `feat/decision-support` was pushed with upstream tracking at that head.
- 2026-07-28T18:35:11Z — This publication-ledger update will be committed and pushed before PR creation.
- 2026-07-28T18:36:02Z — Commit `f9dd96b` recorded branch publication and was pushed; draft PR `#7` created at that exact head.
- 2026-07-28T18:36:02Z — This PR-creation ledger will be committed/pushed before PR `#7` is marked ready.
- 2026-07-28T18:36:36Z — Commit `65aedbb` recorded PR creation and was pushed; PR `#7` marked ready. Check registration is initially empty.
- 2026-07-28T18:36:36Z — This final readiness ledger will be committed and pushed once before exact-head CI polling.
- 2026-07-28T18:37:12Z — Commit `df9d34e` recorded readiness and was pushed; immediate `gh pr checks --watch` returned no registered checks and no branch run was listed, so polling continues without further head changes.
- 2026-07-28T18:39:15Z — Quality run `30388251715` passed all 12 steps at exact head `df9d34e` in 1m26s; PR `#7` is CLEAN/MERGEABLE with no comments or reviews.
- 2026-07-28T18:39:46Z — PR `#7` squash-merged with expected-head guard; merge commit `6e222eadf9e070e4f2207bcbd574b9f9d7cabaa1`.
- 2026-07-28T18:40:15Z — Exact remote branch `feat/decision-support` resolved to `df9d34e` and was deleted after confirmed merge.
- 2026-07-28T18:40:45Z — Refreshed local `main` to merge SHA `6e222ea`, restored the carried ledger, and deleted local PR 3 branch.
- 2026-07-28T18:41:39Z — PR 3 post-merge verification passed: full quality suite, 66/66 tests, 8/8 Chromium, zero deployments, and no open pull requests.
- 2026-07-28T18:42:05Z — Created `feat/weather-integration` from verified merge SHA `6e222ea`; commit `9d734c1` starts PR 4.
- 2026-07-28T18:47:54Z — First PR 4 lint run found unsafe untrusted-JSON assignments and deprecated Zod v4 `.finite()` no-ops; explicit unknown narrowing and current Zod number semantics selected.
- 2026-07-28T18:48:33Z — PR 4 strict types rejected a forecast rank reducer inferred against `WeatherRisk`; explicit numeric accumulator selected.
- 2026-07-28T18:50:31Z — Weather test lint found eight async mocks without awaits; explicit `Promise.resolve`/`Promise.reject` fixture returns selected.
- 2026-07-28T18:50:31Z — A combined memory/test patch missed a Prettier-expanded mock and changed no files; retry split by exact file structure.
- 2026-07-28T18:51:47Z — Weather suite passed 107/108; invalid cooldown date produced `NaN` and escaped the expiry comparison. Finite-date validation selected.
- 2026-07-28T18:53:46Z — Strict typecheck rejected returning the conditionally parsed `unknown` cooldown timestamp; an explicit string guard was selected.
- 2026-07-28T18:55:58Z — Provider integration passed 113/115; two exact-text queries could not match a React element whose text was split by interpolation. Exact element `textContent` matching selected.
- 2026-07-28T18:57:49Z — Full non-browser quality passed with 115/115 tests; Playwright passed 9/10 because the fallback-label query matched both its exact badge and longer source summary. Exact matching selected.
- 2026-07-28T18:59:38Z — Expanded Playwright passed 10/10. Cumulative review found an explicit simulated-weather selection did not invalidate a pending observed request; provider-mediated cancellation and regression coverage selected.
- 2026-07-28T19:01:59Z — Full validation passed with 116/116 tests and 10/10 browser cases. Manual browser review found a misleading roughly 300,000-minute age on deterministic scenario weather; scenario-time wording without real-world age selected.
- 2026-07-28T19:02:55Z — Simulated-time wording passed lint, types, and 55 focused tests. The in-app browser wait first used an unsupported object argument, then passed with the numeric timeout API; manual text confirmed no real-world age.
- 2026-07-28T19:03:54Z — Manual severe-weather layout passed. A real Open-Meteo request exposed that the requested UTC timezone is returned as `GMT`; strict `UTC`-only validation caused safe fallback. Equivalent `UTC`/`GMT` acceptance and regression coverage selected.
- 2026-07-28T19:05:30Z — GMT handling passed 50 focused tests and a real provider smoke. Official provider documentation confirms hourly precipitation is a preceding-hour sum while current data can use a shorter interval; matching hourly accumulation and explicit average-rate wording selected.
- 2026-07-28T19:07:15Z — Final PR 4 validation passed: 118/118 tests, 95.9/90.71/94.47/96.61 coverage, production build/privacy/audit, 10/10 Chromium cases, manual simulated/severe/observed/cached review, exact responsive geometry, and real Open-Meteo smoke. No deployment occurred.
- 2026-07-28T19:07:49Z — Commit `7026c60` (`feat: add weather schemas cache and source adapter`) created after staged scope and whitespace review.
- 2026-07-28T19:08:16Z — Commit `c54172d` (`feat: add explainable weather risk and dashboard`) created after staged scope and whitespace review.
- 2026-07-28T19:08:39Z — Commit `825fe9d` (`test: cover weather thresholds caching and fallback`) created after staged scope and whitespace review.
- 2026-07-28T19:09:03Z — Commit `5f73472` (`docs: record weather integration validation`) created; the branch was clean immediately afterward.
- 2026-07-28T19:09:27Z — Commit `054ff74` (`docs: record weather integration commits`) created; exact branch verification begins.
- 2026-07-28T19:10:21Z — Exact branch head `d345e2627bfecac230b7291e91e138940d04c1fb` passed full quality, 118/118 tests, 95.9/90.71/94.47/96.61 coverage, build/privacy, 10/10 Chromium, cumulative diff review, production audit zero, zero deployments, and no open PRs.
- 2026-07-28T19:10:53Z — Commit `83507fa` recorded exact branch verification; `feat/weather-integration` was pushed with upstream tracking at that head.
- 2026-07-28T19:11:32Z — Commit `be8d756` (`docs: record weather branch publication`) was pushed successfully.
- 2026-07-28T19:12:10Z — Commit `9dbc779` finalized the publication ledger and was pushed; draft PR `#8` was created at exact head `9dbc77992fea6de5d35c9b596886c8d0deeccd10`, MERGEABLE, with Quality queued.
- 2026-07-28T19:17:48Z — Commit `1ada4e3` recorded PR creation and was pushed; PR `#8` was marked ready. Quality run `30390948155` passed at exact head `1ada4e3f2e1f256a311567378776926834b7f5cc`; PR is MERGEABLE.
- 2026-07-28T19:20:03Z — Quality run `30391358186` passed in 1m28s at exact head `08b83abf5302db3c61317bb841d26c8af6a1141b`; PR `#8` was CLEAN/MERGEABLE with no comments, reviews, or inline comments and zero deployments.
- 2026-07-28T19:20:50Z — PR `#8` squash-merged as `4b933c5a2dd4dbfeacfc7633b528360c6f5be8e6` with exact-head guard; GitHub/local cleanup deleted `feat/weather-integration`, main refreshed cleanly, and deployments remain zero.
- 2026-07-28T19:21:51Z — PR 4 post-merge verification passed on main `4b933c5`: full quality, 118/118 tests, 95.9/90.71/94.47/96.61 coverage, build/privacy, 10/10 Chromium, zero deployments, and no open PRs.
- 2026-07-28T19:22:25Z — Created `feat/external-aircraft` from verified PR 4 merge `4b933c5`; commit `0340bc8` records the carried ledger. Official adsb.fi documentation reconfirmed v3 regional endpoint, one-request/second public limit, personal non-commercial terms, required linked attribution, and as-is/no-warranty limits.
- 2026-07-28T19:27:22Z — PR 5 first lint reported 25 errors: two deprecated Zod passthrough calls, one shorthand void timeout callback, nullable fuel arithmetic in existing simulation code, and cascading unsafe-type diagnostics. Loose objects, explicit braces, fuel-unavailable narrowing, and safe simulated overrides selected.
- 2026-07-28T19:29:01Z — Second lint reduced to 17 cascading unsafe-type errors. Direct Node typecheck showed NodeNext could not traverse the existing extensionless browser-domain imports used by the snapshot script; bundler resolution matching Vite/tsx was selected.
- 2026-07-28T19:33:21Z — First atomic external-mode UI/state pass reached clean lint; strict types found nullable effect-closure narrowing and an exact-optional explicit undefined unit. Local snapshot capture and explicit undefined allowance selected.
- 2026-07-28T19:37:50Z — First external test run stopped at lint with 95 errors: script/release tests lacked Vitest global types in the Node project, and eight fixture mutations used forbidden non-null assertions. Node Vitest types and checked fixture accessors selected.
- 2026-07-28T19:38:56Z — External-test lint reduced to one unsafe nested asymmetric matcher in the script request assertion; typed captured request arguments selected.
- 2026-07-28T19:41:05Z — Lint and typecheck passed. Coverage passed 163/164 tests; the sole failure was an ambiguous single-element query because the external callsign correctly appeared in four UI regions. An all-elements assertion and the actual simulation callsign were selected.
- 2026-07-28T19:42:16Z — Follow-up coverage passed 160/164 tests; four integration cases stopped on the same test-only ambiguity because the simulated callsign intentionally appears in five UI regions. All presence assertions will use multi-element queries while absence assertions remain exact.
- 2026-07-28T19:42:52Z — Coverage returned to 163/164 tests. The sole failure was a test-only DOM assumption: the fuel `dt` and `dd` share a detail-item parent rather than being direct siblings. A container-scoped semantic assertion was selected.
- 2026-07-28T19:45:41Z — Full lint, strict types, and coverage passed: 164/164 tests with 95.85/91.9/94.56/96.83 coverage. Expanded browser coverage now checks atomic external replacement, attribution, unavailable fuel, external geometric-CPA limitation, valid empty state, explicit Simulation return, and active-snapshot expiry.
- 2026-07-28T19:46:37Z — Full quality/build/privacy and 165/165 tests passed. Chromium passed 11/12; trace evidence confirmed active-snapshot expiry restored Simulation and displayed “Snapshot is stale. Simulation restored.” The test alone expected “became stale,” so its wording was corrected.
- 2026-07-28T19:51:08Z — Chromium passed 12/12. A single permitted adsb.fi Lucknow regional smoke returned HTTP 200 and normalized to `available`/`valid`, `regional-v3`, 3 records without logging payloads or altering the committed baseline. Browser inspection failures were limited to unsupported `networkidle`, a non-navigating new tab, unavailable page-world fetch injection, and a strict duplicate region name; direct navigation/local built fixture succeeded. Review found external mode still labelled an active deterministic exercise and disabled playback visually weak. External-only/fallback-context wording, distinct external-list/statistics names, and disabled styling were selected.
- 2026-07-28T19:52:34Z — Post-review quality and 12/12 Chromium passed. Manual reload then timed out waiting for the replaced snapshot even though the preview served it; generated `sw.js` showed Workbox precached `data/aircraft-snapshot.json`. Client freshness remained safe, but cached dynamic data could hide a newly published snapshot. Excluding only that JSON from precache with a release-guard assertion was selected.
- 2026-07-28T19:59:30Z — The targeted release-guard test/build passed and generated Workbox precache dropped from 14 to 13 entries with no aircraft JSON. Fresh-origin manual external review passed: distinct external context/list/statistics regions, disabled playback, attribution, and zero overflow. State review found external activation could inherit a running simulation and aircraft fallback/expiry could reset independently observed weather; activation now pauses, Checking always displays Simulation, late results are ignored, and weather provenance is preserved. Published-snapshot validation now checks generated/provider consistency and every observation age. Workflow storage review found full snapshots were being cached for cooldown; cache scope was narrowed to a minimal retry-only JSON so aircraft history remains only in the current deployment artifact.
- 2026-07-28T20:00:06Z — Focused verification stopped before lint because Prettier cannot infer a parser for `.gitignore`; all other listed files formatted, no application command ran, and `.gitignore` was excluded from the corrected formatter call.
- 2026-07-28T20:01:03Z — Corrected formatting, lint, and strict types passed; focused tests passed 51/52. Stricter cross-field validation correctly rejected a stale fixture before the stale-age branch because its observations remained months newer than its old fetch timestamp. Stale/expiry fixtures will anchor observations to fetch time, and non-network schema errors will consistently map to “Invalid snapshot response.”
- 2026-07-28T20:01:52Z — Focused rerun passed lint but strict types stopped before tests because `snapshot.fetchedAt` remains declared `string | null` inside a mapper despite the prior assignment. A known local string constant was selected for the fixture calculation.
- 2026-07-28T20:03:55Z — Corrected focused verification passed 59/59. Final PR 5 validation then passed format/lint/types, 172/172 tests, 95.7/91.91/94.65/96.62 coverage, production build/privacy, 12/12 Chromium, generated precache excluding aircraft JSON, whitespace, and authored-content scan. Production dependency audit is zero; full audit reports only the previously accepted development `brace-expansion` advisory whose offered fix forces incompatible ESLint 10. GitHub auth/repository/default branch passed; no open PRs, deployments, or repository release variable exist.
- 2026-07-28T20:04:28Z — Commit `c4411e8` (`feat: add validated aircraft snapshot generator`) created after explicit staged-file and whitespace review.
- 2026-07-28T20:04:57Z — Commit `984763f` (`feat: add atomic external aircraft mode and provenance`) created after explicit staged-file and whitespace review.
- 2026-07-28T20:05:22Z — Commit `d4e6068` (`ci: integrate guarded aircraft snapshots with Pages`) created after explicit staged-file and whitespace review.
- 2026-07-28T20:05:49Z — Commit `f474ca0` (`test: cover external success freshness quotas and fallback`) created after explicit staged-file and whitespace review.
- 2026-07-28T20:06:21Z — Commit `9732d9c` (`docs: record external aircraft validation`) created; the branch was clean immediately afterward.
- 2026-07-28T20:07:36Z — Exact branch head `8da33411b617fd24fb02af993b8140c4d6ecdb3c` passed full format/lint/types, 172/172 tests, 95.7/91.91/94.65/96.62 coverage, build/privacy, 12/12 Chromium, dynamic snapshot precache exclusion, production audit zero, clean status, and cumulative main diff/commit review.
- 2026-07-28T20:08:10Z — Commit `84514aa` recorded exact local verification; branch `feat/external-aircraft` was pushed successfully with upstream tracking.
- 2026-07-28T20:09:02Z — Commit `0272faf` recorded branch publication and was pushed. GitHub connector PR creation failed with HTTP 403 `Resource not accessible by integration`; authenticated `gh` fallback selected.
- 2026-07-28T20:10:04Z — Connector-fallback ledger commit `d747242` was pushed. Draft PR `#9` was created through authenticated `gh`; it is OPEN/MERGEABLE at head `d7472427cbb0696dd9ee9df318aef6c8ca37e19b`, with Quality run `30395127589` in progress.
- 2026-07-28T20:10:49Z — PR-ledger commit `b51c111` was pushed and PR `#9` marked ready. PR is MERGEABLE; Quality run `30395177619` is queued at exact head `b51c111535560e3ef6910a1b7e6318b70b4ec59b`.
- 2026-07-28T20:13:00Z — Exact-head Quality run `30395177619` passed in 1m35s at `b51c111535560e3ef6910a1b7e6318b70b4ec59b`, including format, lint, strict types, coverage, production build, privacy scan, and essential Chromium tests.
- 2026-07-28T20:14:00Z — PR `#9` final guards passed: OPEN/ready/CLEAN/MERGEABLE at exact remote head, successful exact-head Quality, no comments/reviews/inline comments/review threads, zero deployments, and no repository variables.
- 2026-07-28T20:15:00Z — `gh pr merge` completed the remote merge but its local checkout step failed because the intentionally uncommitted Gate ledger would be overwritten. No ledger data was discarded.
- 2026-07-28T20:15:30Z — Read-only resolution confirmed PR `#9` squash-merged at the exact guarded head as `78b700f1c108d94196e538537f6d779da8178df4`; the remote feature branch remained because only cleanup failed.
- 2026-07-28T20:16:00Z — Restoring the named two-file ledger stash before local `main` fast-forwarded caused conflicts limited to both memory files. Git retained two safety stashes; complete newer histories were manually resolved, then `main` fast-forwarded to the merge without application-code conflicts.
- 2026-07-28T20:17:00Z — Verified local `main` and `origin/main` both equal merge `78b700f1c108d94196e538537f6d779da8178df4`; deleted the exact resolved local and remote `feat/external-aircraft` refs. Two named safety stashes remain temporarily until the restored ledger is committed on the next branch.
- 2026-07-28T20:17:30Z — Post-cleanup guards passed: only remote `main` exists at `78b700f`, no open PRs, deployments, repository variables, or listeners on preview ports 4173/4174. The only worktree changes are both restored ledgers; two named safety stashes remain.
- 2026-07-28T20:19:00Z — PR 5 post-merge verification passed on exact `main` merge `78b700f`: format/lint/types, 172/172 tests at 95.7/91.91/94.65/96.62 coverage, production build/privacy, dynamic-aircraft precache exclusion, 12/12 Chromium, and production audit zero. No deployment occurred.
- 2026-07-28T20:19:30Z — Created `feat/learning-accessibility` from verified `main` merge `78b700f1c108d94196e538537f6d779da8178df4`; the restored PR 5 ledger is the only pending change.
- 2026-07-28T20:20:00Z — Commit `bb5461b` (`docs: record external aircraft merge`) preserved the complete restored PR 5 audit trail after staged scope and whitespace review.
- 2026-07-28T20:20:30Z — Removed both temporary ledger safety stashes after commit `bb5461b` made their complete contents durable; no user or application files were removed.
- 2026-07-28T20:28:00Z — First PR 6 focused verification passed lint and strict types; 11 domain/learning tests passed, but three suites could not import `virtual:pwa-register/react` during Vitest transform. A native service-worker registration/update layer was selected to preserve prompt behavior without a test-only build virtual dependency.
- 2026-07-28T20:30:00Z — Native PWA-layer lint found one stylistic `Array<T>` violation; it was changed to the repository-required `T[]` form before any further check.
- 2026-07-28T20:31:30Z — Second PR 6 focused verification passed lint/types and 24/26 tests. Failures showed zero supported observations still appeared as numeric zero and the prior “Declared simulated events” label was replaced. Zero-denominator metrics now resolve to `Unavailable`, with the simulated label retained.
- 2026-07-28T20:32:30Z — Third focused run passed 25/26. The remaining legacy assertion requires “Declared simulated events” as its own detail line immediately after the value; metric details were converted to line arrays so the exact label and denominator are both preserved.
- 2026-07-28T20:34:30Z — Full PR 6 non-browser gate passed with 176/176 tests, 91.04/88.85/88.78/92.88 coverage, build, and privacy scan. Built HTML inspection found the PWA plugin auto-injected `registerSW.js` in addition to the native lifecycle handler; `injectRegister: null` was selected so registration and update prompts have one owner.
- 2026-07-28T20:36:00Z — Expanded Chromium passed 13/16. Failures were an ambiguous `Unavailable` query, a warm offline reload served through an older locally reused worker lifecycle, and genuine horizontal overflow at 200% text size. Exact matching, fresh service-worker isolation, and element-level overflow inspection were selected.
- 2026-07-28T20:39:00Z — Overflow inspection showed the 200% test doubled root text while retaining a 1280 CSS-pixel layout viewport, unlike browser zoom, so desktop grids intentionally exceeded the viewport. The check now models 1440-at-200%-zoom as a 720 CSS-pixel layout. Offline evidence also confirmed service-worker navigation can succeed while `navigator.onLine` remains advisory after reload; offline status is asserted on the live connectivity event before the warm reload.
- 2026-07-28T20:40:30Z — Corrected external and warm-offline browser cases passed. The 720 CSS-pixel zoom model still exposed the table's intentional 48rem internal width; the existing accessible card-table breakpoint was promoted from 38rem to 45rem so the 200% view does not require horizontal table scrolling.
- 2026-07-28T20:43:00Z — Full expanded Chromium passed 16/16. Manual in-app browser review on a fresh local origin confirmed current statistics denominators, seven learning modules, visible keyboard focus, readable expanded input/rule/output/limitation content, permanent provider attribution, Emergency state, no page overflow, and no console warnings/errors. Initial fresh-tab navigation probes used unsupported nested methods before the documented root `tab.goto` method succeeded; the browser viewport override stayed at 1280, so automated Playwright remains the authoritative 768/390/320 responsive evidence.
- 2026-07-28T20:45:00Z — Final PR 6 gate stopped at lint because the new overflow diagnostic used an unnecessary optional chain/null fallback on non-null `HTMLElement.textContent`. Direct non-null string handling selected; no type, test, build, or privacy command ran in that chain.
- 2026-07-28T20:46:30Z — Corrected final non-browser gate passed: format/lint/types, 176/176 tests, 91.04/88.85/88.78/92.88 coverage, production build with a 12-entry local-asset precache and no auto-injected registration script, plus privacy scan.
- 2026-07-28T20:47:30Z — Final built-site browser gate passed 16/16 at the current source state, including warm offline reload, seven-module keyboard disclosure, 200% zoom modeling, Axe, reduced motion, and 1440/768/390/320 reflow. Production dependency audit reported zero vulnerabilities.
- 2026-07-28T20:49:00Z — Commit `85f89b9` (`feat: add live-derived statistics and learning content`) created after staged scope and whitespace review.
- 2026-07-28T20:49:30Z — Commit `3cae2de` (`feat: add offline shell and update handling`) created after staged scope and whitespace review.
- 2026-07-28T20:50:00Z — Commit `f9763e1` (`style: polish evaluator-ready dashboard`) created after staged scope and whitespace review.
- 2026-07-28T20:50:30Z — Commit `1b8349c` (`test: add accessibility offline and responsive coverage`) created after staged scope and whitespace review.
- 2026-07-28T20:51:00Z — Commit `9e25a8b` (`docs: record learning accessibility validation`) created; only the immediate commit record is now pending.
