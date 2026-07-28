# FutureATC Lab

## Final Requirements Specification

**Project:** AI-Assisted Air Traffic Management Simulator<br>
**Academic report:** Emerging Technologies in Air Traffic Management: Role of AI and Automation in Future ATC<br>
**Institution:** Amity University Uttar Pradesh, Lucknow<br>
**Document version:** 1.0<br>
**Status:** Gate 2 approval candidate<br>
**Prepared:** 28 July 2026

> **Required safety statement:** “This is an academic simulation for educational demonstration only. It is not an operational air traffic control, navigation, collision-avoidance, flight-planning, or safety system.”

The public website will not display a student name, guide name, department, enrollment number, private report, signature, certificate, declaration, or private contact information unless a later approved scope change explicitly permits it.

## Table of Contents

1. Project Overview
2. Academic Purpose
3. Target Audience
4. Problem Statement
5. Goals
6. Complete Scope
7. Non-Scope
8. User Experience
9. Functional Requirements
10. Simulation Behavior
11. Optional External-Data Behavior
12. Fallback and Rate-Limit Behavior
13. Explainable Decision Logic
14. Data Provenance and Timestamps
15. UI and Responsive Design
16. Accessibility
17. Performance and Reliability
18. Privacy and Security
19. Academic Honesty and Safety
20. Testing Requirements
21. GitHub Workflow
22. GitHub Pages Deployment
23. Acceptance Criteria
24. Known Limitations
25. Verified Sources and Attribution

## 1. Project Overview

FutureATC Lab is a polished, responsive educational website that demonstrates how explainable automation may assist future air traffic management. It combines deterministic simulated aircraft, weather, runway, fuel, emergency, and traffic data with transparent scoring and alert explanations.

The website is a learning and presentation tool. It does not control aircraft, communicate with aviation infrastructure, make operational clearances, replace certified collision-avoidance systems, or provide navigation or safety advice.

The default demonstration region is Lucknow. Region, map center, runways, and simulation bounds must be defined through configuration so the demonstration can be adapted later without rewriting the decision algorithms. The public user interface may expose supported region presets where doing so remains clear and reliable.

The application will be built as a static React, Vite, and TypeScript website. It will run on GitHub Pages and use no paid services, private backend, or browser-embedded secret.

## 2. Academic Purpose

The website converts the report’s conceptual discussion into an interactive demonstration. Its purpose is to:

- make future-ATM concepts understandable through visible scenarios;
- show how deterministic, explainable decision logic can assist a human controller;
- distinguish algorithmic suggestions from human authority;
- demonstrate responsible handling of uncertainty, incomplete external data, failures, and rate limits;
- connect flight tracking, projected separation, weather, runway allocation, fuel, emergencies, and statistics in one coherent interface; and
- support an honest college evaluation without claiming a trained machine-learning model or operational aviation capability.

The project began as a research study. No pre-existing trained model, production ATC system, or operational flight-data platform is claimed.

## 3. Target Audience

The primary audience is:

- college evaluators and faculty reviewing the academic project;
- students learning about AI, automation, and air traffic management;
- non-specialist visitors who need plain-language explanations; and
- developers or researchers reviewing the public source code as an educational prototype.

The interface must not assume professional ATC knowledge. Aviation abbreviations must be expanded or explained when first used, and decision cards must use plain language alongside technical values.

## 4. Problem Statement

Traditional air traffic management requires controllers to combine aircraft position, projected trajectories, weather, runway availability, fuel urgency, emergencies, and traffic flow under time pressure. Future decision-support tools may help organize this information, but opaque automation can create new risks if its data source, assumptions, uncertainty, or reasoning are unclear.

FutureATC Lab must demonstrate a safer educational pattern: automation observes a selected dataset, produces explainable recommendations, shows why each recommendation was made, reports uncertainty and data freshness, and waits for a human-controller confirmation concept. It must remain useful even when every external service fails.

## 5. Goals

### 5.1 Product goals

- Deliver all seven requested simulator capabilities in one coherent dashboard.
- Make the deterministic simulation fully demonstrable without external APIs.
- Provide optional, honestly labelled external aircraft and weather data where legitimate and available.
- Explain every risk score, queue change, warning, and recommendation.
- Preserve a clear human-in-command model.
- Provide a polished desktop, tablet, and mobile experience.
- Deploy publicly at no cost through GitHub Pages.

### 5.2 Quality goals

- Deterministic results for a given scenario seed.
- Strict TypeScript and automated test coverage for safety-relevant educational calculations.
- Clear loading, empty, offline, error, stale, and rate-limited states.
- WCAG 2.2 Level AA as the accessibility target.
- No secrets, private report content, or personal identifiers in the repository or production output.

### 5.3 Success definition

The project succeeds when a college evaluator can open the public site, run every simulated scenario, select aircraft, understand each automated suggestion, observe the effect of emergencies and weather, and verify that the human controller has final authority. Optional external data may be unavailable without making the demonstration fail.

## 6. Complete Scope

The approved scope includes:

- a responsive aviation-control dashboard;
- a Lucknow-centered configurable demonstration region;
- an interactive map with aircraft markers, heading, selection, and detail;
- deterministic scenario generation and replay;
- simulated flight tracking and movement;
- projected-separation and closest-point-of-approach calculations;
- weather display, forecast interpretation, and educational risk classification;
- explainable runway scoring and automatic recommendation;
- educational fuel consumption and reserve monitoring;
- emergency landing priority and queue reordering;
- statistics calculated from the currently selected aircraft dataset;
- source, mode, availability, and freshness labels;
- optional Open-Meteo weather;
- optional `adsb.fi` regional near-live aircraft snapshots published as a same-origin Pages asset;
- map tiles for connected use and a local schematic/grid fallback;
- a “How It Works” learning area tied to the report themes;
- a human-controller review and confirmation interaction;
- offline operation after core application assets have loaded at least once;
- automated quality checks and GitHub Pages deployment; and
- complete public documentation of purpose, algorithms, limitations, sources, and safety.

## 7. Non-Scope

The following are explicitly outside scope:

- real air traffic control or operational decision-making;
- communication with pilots, aircraft, airports, radar, ADS-B receivers, or ATC systems;
- certified surveillance, conflict alerting, TCAS, ACAS, navigation, flight planning, or dispatch;
- issuing clearances, changing real routes, reserving real runways, or declaring emergencies;
- a trained machine-learning model, model training, model evaluation, or claims of predictive accuracy;
- authentication, user accounts, payments, advertising, analytics, or personal-data collection;
- a private backend, paid API, paid map service, or custom domain;
- long-term historical aircraft storage;
- airline logos, copyrighted aircraft photography, or unlicensed assets;
- publication of the private source report or academic enrollment information;
- exact real-aircraft fuel, intent, route, destination, runway assignment, or safety status; and
- guaranteed external-data availability, accuracy, geographic coverage, or update time.

## 8. User Experience

### 8.1 First view

On first load, the website must:

- open in Simulation mode;
- show a prominent `SIMULATED DATA` badge;
- load a deterministic normal-traffic scenario;
- display the required safety statement without requiring a menu search;
- show the current configured region as Lucknow;
- present a concise system-status summary; and
- provide immediate access to scenario controls and “How It Works.”

### 8.2 Primary workflow

The expected demonstration flow is:

1. Select a scenario.
2. Observe aircraft movement and live statistics.
3. Select an aircraft to inspect callsign, altitude, speed, heading, fuel state, status, and current recommendation.
4. Open an alert to see the triggering facts, thresholds, calculation summary, confidence/limitations, and recommended action.
5. Review runway and landing-priority suggestions.
6. Confirm or reject a recommendation as the human controller.
7. Optionally request External Data and observe its availability, freshness, source, and fallback behavior.
8. Open “How It Works” to connect the demonstration to the academic study.

### 8.3 Human authority

No recommendation may visually appear final before a controller confirmation. The interface must use language such as `Recommendation`, `Suggested runway`, and `Awaiting human review`, never `Clearance issued` or `Aircraft controlled`.

The human confirmation is an educational interaction only. It must not imply communication with a real aircraft or airport.

### 8.4 Region configuration

Lucknow is the default. Region settings must be centralized in typed configuration and include:

- public display name;
- map center and simulation bounds;
- local schematic runway identifiers and headings;
- default zoom;
- aircraft generation limits; and
- external-snapshot region and freshness settings.

Any runway representation associated with Lucknow must be labelled as a simulated configuration unless verified authoritative airport data is intentionally added in a later approved scope.

## 9. Functional Requirements

### 9.1 Flight tracking

- **FR-FT-01:** Display every aircraft in the selected dataset on the map using a marker rotated to its current heading.
- **FR-FT-02:** Update simulated aircraft positions on a stable timed loop while keeping the same seed reproducible.
- **FR-FT-03:** Provide a synchronized flight list containing callsign, altitude, ground speed, heading, vertical trend, status, and alert severity.
- **FR-FT-04:** Selecting an aircraft from either the map or list must highlight the same aircraft and open its detail panel.
- **FR-FT-05:** The detail panel must state whether each value is simulated, externally observed, educationally derived, unavailable, or stale.
- **FR-FT-06:** Aircraft that leave configured bounds must be handled deterministically by route completion, replacement, or controlled wrap behavior documented in the simulator.
- **FR-FT-07:** The map must remain usable without external tiles through a local schematic background, grid, boundaries, runway overlay, and relative aircraft positions.
- **FR-FT-08:** External aircraft must never inherit simulated fuel, intent, route, runway, or emergency values without an explicit `educational estimate` label. The preferred default is `unavailable`.

### 9.2 AI-assisted collision detection

- **FR-CD-01:** For relevant aircraft pairs, calculate current horizontal and vertical separation.
- **FR-CD-02:** Project constant-velocity motion over a configurable educational look-ahead horizon, initially 10 minutes.
- **FR-CD-03:** Calculate time to closest point of approach (CPA), horizontal distance at CPA, and vertical separation at CPA.
- **FR-CD-04:** Classify pairwise proximity as Normal, Monitor, Warning, or Critical using documented educational thresholds.
- **FR-CD-05:** Initial critical thresholds are less than 5 nautical miles horizontally and less than 1,000 feet vertically at CPA within the look-ahead horizon. These are demonstration thresholds, not operational minima.
- **FR-CD-06:** Initial warning thresholds are less than 8 nautical miles horizontally and less than 2,000 feet vertically at CPA within the horizon.
- **FR-CD-07:** Each alert must name both aircraft, show the predicted time and separations, identify the threshold crossed, and explain the constant-velocity assumption.
- **FR-CD-08:** Acknowledge or dismiss actions must not suppress recalculation; unresolved geometry may produce a renewed alert.
- **FR-CD-09:** When applied to external snapshots, label the result `educational geometric projection` and explicitly state that incomplete public data cannot establish actual collision danger.
- **FR-CD-10:** The module must be described as explainable decision logic or an AI-assisted risk-scoring prototype, not a trained AI model.

### 9.3 Weather prediction and risk assessment

- **FR-WX-01:** Show current conditions and a short hourly outlook for the configured region.
- **FR-WX-02:** In deterministic scenarios, generate weather from the scenario seed and label it `SIMULATED WEATHER`.
- **FR-WX-03:** When requested and available, fetch Open-Meteo data without a secret key and display source and fetch timestamp.
- **FR-WX-04:** Evaluate wind speed/gust, visibility, precipitation, weather code, and forecast trend using documented thresholds.
- **FR-WX-05:** Initial Severe classification applies when any configured severe condition occurs, including gusts at or above 35 knots, visibility below 3 kilometres, precipitation at or above 7.5 millimetres/hour, or thunderstorm weather codes.
- **FR-WX-06:** Initial Elevated classification applies when wind is at or above 20 knots, gusts at or above 25 knots, visibility is below 8 kilometres, precipitation is at or above 2.5 millimetres/hour, or a moderate adverse-weather code occurs.
- **FR-WX-07:** Risk thresholds must remain centralized, testable, and described as educational defaults rather than airport operating rules.
- **FR-WX-08:** Every risk card must list the contributing observations and the exact threshold comparisons.
- **FR-WX-09:** If live weather fails, use simulated weather only with a prominent fallback label and a source-status explanation.
- **FR-WX-10:** Weather attribution must appear next to displayed Open-Meteo data.

### 9.4 Automatic runway allocation

- **FR-RW-01:** Represent each configured demonstration runway with identifier, heading, availability, occupancy, and simulated operational status.
- **FR-RW-02:** Score candidate runways using availability, wind suitability, crosswind/tailwind penalty, aircraft arrival urgency, fuel urgency, emergency status, and queue load.
- **FR-RW-03:** An unavailable runway must be excluded or receive a disqualifying score.
- **FR-RW-04:** The highest valid score becomes the suggested runway, subject to human review.
- **FR-RW-05:** Display a score breakdown so a user can see why one runway ranked above another.
- **FR-RW-06:** An emergency must override ordinary queue ordering but must not override a runway marked unavailable.
- **FR-RW-07:** Changes in weather, runway state, fuel, or emergency state must trigger recomputation.
- **FR-RW-08:** A human controller must be able to confirm or reject a recommendation and see that the result is a simulation action.
- **FR-RW-09:** Runway scoring in External Data mode must not be presented as a real airport assignment. It may be disabled or shown only as an educational what-if using the simulated runway configuration.

### 9.5 Fuel monitoring

- **FR-FU-01:** Simulated aircraft must have deterministic initial fuel, aircraft-category burn rate, and elapsed-flight state.
- **FR-FU-02:** Calculate remaining fuel using `initial fuel - estimated burn rate × elapsed simulated time`, with scenario-specific adjustments documented.
- **FR-FU-03:** Show remaining fuel, estimated endurance, reserve state, and trend.
- **FR-FU-04:** Initial Low Fuel status begins below 30 minutes of estimated endurance; Critical Fuel begins below 15 minutes.
- **FR-FU-05:** Thresholds are educational and configurable; they are not airline procedures or legal reserves.
- **FR-FU-06:** Low or critical fuel must influence landing priority and runway scoring.
- **FR-FU-07:** The low-fuel scenario must reliably trigger an explainable warning.
- **FR-FU-08:** Public aircraft feeds do not provide measured fuel. External aircraft must therefore show `Fuel unavailable` by default; any future estimate must be labelled `educational estimate`.

### 9.6 Emergency landing priority

- **FR-EM-01:** Provide a deterministic emergency scenario and a clearly labelled simulation control for declaring or clearing a simulated emergency.
- **FR-EM-02:** Emergency aircraft must move ahead of routine traffic in the landing-priority queue.
- **FR-EM-03:** Priority logic must consider emergency state first, then critical fuel, conflict urgency, weather exposure, estimated arrival time, and normal queue order.
- **FR-EM-04:** Each queue change must explain which factor caused the change.
- **FR-EM-05:** Emergency status must be visible on map marker, flight row, aircraft detail, alert area, runway card, and statistics without relying on colour alone.
- **FR-EM-06:** Controller confirmation remains required for the simulated landing recommendation.
- **FR-EM-07:** The interface must never include controls that appear to contact emergency services, pilots, or real airports.

### 9.7 Live air-traffic statistics

- **FR-ST-01:** Recompute statistics from only the currently selected aircraft dataset.
- **FR-ST-02:** Show at minimum total aircraft, airborne/ground count where known, arrivals/queued aircraft in simulation, active alerts by severity, emergencies, low-fuel aircraft, average altitude, and average speed.
- **FR-ST-03:** Statistics must update when aircraft positions, scenario, source mode, or status changes.
- **FR-ST-04:** Unsupported statistics in External Data mode must show `Unavailable` rather than a simulated number.
- **FR-ST-05:** Charts must have accessible text summaries and must not rely only on colour.
- **FR-ST-06:** The interface must call the values `live statistics` only in the sense of live recomputation from the current dataset; external snapshot age must remain visible.

### 9.8 Explanations and learning content

- **FR-EX-01:** Every major module must include a short `How it works` explanation.
- **FR-EX-02:** Every alert or recommendation must include triggering facts, applied threshold/rule, result, limitation, and suggested human review.
- **FR-EX-03:** A dedicated learning section must connect the demonstration to AI-assisted prediction, human-machine teamwork, satellite navigation/ADS-B, data analytics, weather support, efficiency, emergencies, explainability, cybersecurity, and oversight.
- **FR-EX-04:** References to FAA NextGen, EUROCONTROL/SESAR, and NASA ATM-X must be contextual examples, not claims of endorsement or direct implementation.
- **FR-EX-05:** A glossary must explain CPA, ADS-B, ATM, ATC, near-live, cached, stale, simulated, and educational estimate.

## 10. Simulation Behavior

### 10.1 Determinism

- **SIM-01:** The same scenario name, region configuration, and seed must produce the same starting aircraft, routes, weather, fuel, runway state, and event timing.
- **SIM-02:** A reset action must return the scenario to its initial deterministic state.
- **SIM-03:** A visible seed identifier may be shown for reproducibility, but it must not be presented as a security token.
- **SIM-04:** Generated callsigns must be clearly synthetic and must not be represented as current real flights.

### 10.2 Required scenarios

| Scenario       | Required outcome                                                                      |
| -------------- | ------------------------------------------------------------------------------------- |
| Normal traffic | Stable traffic flow, no forced critical alert, routine runway recommendations         |
| Severe weather | Severe simulated weather, visible risk factors, changed runway suitability            |
| Collision risk | A reproducible aircraft pair crossing critical projected-separation thresholds        |
| Low fuel       | At least one aircraft crosses Low and/or Critical Fuel threshold and gains priority   |
| Emergency      | A declared simulated emergency overrides routine queue order and prompts human review |

### 10.3 Offline simulation

After the application assets have loaded successfully at least once:

- core UI, algorithms, scenarios, explanations, local schematic map, and previously cached static assets must work without network access;
- the site must display an Offline state;
- external requests must stop or fail quickly without repeated retries;
- unavailable external tiles must be replaced by the local schematic; and
- external data must not be represented as current while offline.

## 11. Optional External-Data Behavior

### 11.1 Mode selection

- **EXT-01:** The primary mode selector defaults to Simulation.
- **EXT-02:** Selecting External Data first triggers an availability, schema, and freshness check.
- **EXT-03:** Do not switch aircraft datasets until a valid, fresh external snapshot exists.
- **EXT-04:** If activation succeeds, replace the entire simulated aircraft dataset; never mix external and simulated aircraft.
- **EXT-05:** Mode changes must be announced visually and through an accessible status message.
- **EXT-06:** Returning to Simulation must restore the deterministic scenario without depending on external data.

### 11.2 Aircraft snapshots

- **EXT-AC-01:** Use a small `adsb.fi` regional query centered on the configured external region.
- **EXT-AC-02:** Fetch from GitHub Actions because direct browser CORS is unsuitable.
- **EXT-AC-03:** Publish a same-origin JSON asset containing normalized aircraft plus status metadata.
- **EXT-AC-04:** Label it `NEAR-LIVE AIRCRAFT SNAPSHOT`, not real-time.
- **EXT-AC-05:** The status must include provider, endpoint class, fetched time, generated time, freshness threshold, availability, validation result, record count, and optional retry time.
- **EXT-AC-06:** A snapshot is Fresh for at most 30 minutes by default. This threshold must be centralized and testable.
- **EXT-AC-07:** Validate coordinates, timestamps, identifier shape, numeric ranges, and maximum record count before publishing.
- **EXT-AC-08:** Do not store long-term aircraft history. The deployment artifact contains only the current small snapshot and status.
- **EXT-AC-09:** Provide provider attribution and a limitations link.
- **EXT-AC-10:** If provider terms materially change or legitimate free access disappears, disable External Aircraft gracefully.

### 11.3 Weather

- **EXT-WX-01:** Fetch the configured region’s current and hourly forecast directly from Open-Meteo over HTTPS.
- **EXT-WX-02:** Request only variables required by the documented risk model.
- **EXT-WX-03:** Cache a successful response in the browser for at least 15 minutes and reuse it while fresh.
- **EXT-WX-04:** Display Open-Meteo source, fetch timestamp, forecast/model time where supplied, and derived-risk label.
- **EXT-WX-05:** Validate response schema, coordinate proximity, arrays, times, units, and finite numeric values.
- **EXT-WX-06:** If external aircraft is available but weather falls back, show an explicit mixed-source summary. Never describe fallback weather as observed.

## 12. Fallback and Rate-Limit Behavior

### 12.1 External-data state machine

The data-mode controller must use explicit states:

`Simulation → Checking → External Active`

From `Checking`, invalid, unavailable, blocked, stale, offline, or rate-limited results return to `Simulation`. From `External Active`, a later freshness or validation failure returns to `Simulation` with an explanation.

### 12.2 Failure behavior

- **FB-01:** Network errors, timeouts, non-success HTTP codes, malformed JSON, invalid schema, empty-but-invalid results, stale timestamps, CORS-style failures, and provider unavailability must be handled without crashing.
- **FB-02:** Remain in or return to Simulation when aircraft external data is unusable.
- **FB-03:** Show a concise reason such as `Snapshot is stale`, `Provider unavailable`, `Invalid response`, `Offline`, or `Rate limited`.
- **FB-04:** Never silently keep displaying an expired snapshot as current.
- **FB-05:** Preserve the user’s ability to run every simulated feature after failure.

### 12.3 Rate limits and retry

- **RL-01:** The `adsb.fi` workflow must make one regional request per run and never exceed the published one-request-per-second public limit.
- **RL-02:** The planned schedule is no more frequent than every 15 minutes and should avoid the start of the hour, while acknowledging that GitHub schedules can be delayed or dropped.
- **RL-03:** Open-Meteo usage must remain far below 600 calls/minute, 5,000/hour, 10,000/day, and 300,000/month.
- **RL-04:** Cache weather and prevent refresh-button request spam.
- **RL-05:** For HTTP 429 or equivalent, accept an exact retry time only when a valid provider `Retry-After` or documented reset value is supplied.
- **RL-06:** If no valid retry value exists, say the provider is unavailable and to try again later; do not invent an exact time.
- **RL-07:** Store cooldown state and do not call an exhausted source again before the valid retry time.
- **RL-08:** Snapshot status must carry retry metadata so the static UI can explain a workflow-side rate limit.

## 13. Explainable Decision Logic

### 13.1 General explanation contract

Every derived result must expose:

- input facts and units;
- source or simulation label;
- rule, formula, or threshold applied;
- output classification or score;
- main contributing factors;
- known assumption or missing information; and
- the human decision still required.

### 13.2 Collision projection

For each relevant aircraft pair:

1. Convert latitude/longitude near the configured region into a local planar east/north position suitable for short educational distances.
2. Convert ground speed and track into east/north velocity.
3. Calculate relative position and relative velocity.
4. Compute unconstrained time to CPA as `-dot(relative position, relative velocity) / |relative velocity|²`.
5. Clamp time to the interval from now through the configured 10-minute horizon.
6. Project both aircraft to that time.
7. Calculate horizontal and vertical separation at CPA.
8. Apply Critical, Warning, Monitor, or Normal thresholds.

If relative speed is effectively zero, use current separation and avoid division by zero. Invalid or missing velocity data produces `Insufficient data`, not a fabricated prediction.

### 13.3 Weather risk

Weather risk uses a rule-based maximum-severity model:

- start at Normal;
- elevate based on wind/gust, visibility, precipitation, and WMO weather code;
- select the highest triggered severity;
- show all triggered factors, not only the highest one; and
- identify forecast trend separately from current risk.

The project must state that the thresholds are educational simplifications and omit airport-specific procedures, runway condition codes, aircraft performance, microbursts, radar, NOTAMs, and controller reports.

### 13.4 Runway scoring

Each valid runway begins with a neutral base score. The explainable breakdown must include:

- availability gate: unavailable means disqualified;
- wind alignment: reward headwind suitability;
- crosswind/tailwind: apply transparent penalties;
- queue load: prefer less-congested valid runways;
- estimated arrival urgency: add a bounded priority contribution;
- low/critical fuel: add urgency;
- emergency: add the largest priority contribution; and
- stability: use deterministic tie-breaking to prevent flicker.

Exact weights must be centralized, documented in code and the website, and covered by unit tests. Human confirmation is required.

### 13.5 Fuel estimation

Simulated fuel uses aircraft-category profiles with initial fuel and burn rate. The calculation is educational and must avoid claims of aircraft-performance accuracy. Remaining endurance is `remaining fuel / current estimated burn rate` when the rate is positive.

### 13.6 Emergency ordering

Queue sorting must be stable and lexicographically explainable:

1. active simulated emergency;
2. critical fuel;
3. time-critical projected conflict;
4. severe weather exposure;
5. low fuel;
6. estimated arrival time;
7. original stable queue order.

The visible explanation must list the first factor that changed an aircraft’s priority and any supporting factors.

### 13.7 Statistics

Statistics are pure derived values from the current selected dataset. Unsupported or missing fields are excluded with an `Unavailable` label rather than replaced with simulation values.

## 14. Data Provenance and Timestamps

### 14.1 Required provenance fields

Every data-bearing module must expose:

- mode: Simulated, External, Derived, Cached, or Unavailable;
- provider or generator;
- observation or generation time where available;
- fetch time;
- displayed age;
- freshness category;
- unit;
- derivation label for calculated values; and
- limitation or fallback reason.

### 14.2 Freshness categories

| Category    | Aircraft snapshot                         | Weather                                                                 | Required behavior                       |
| ----------- | ----------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------- |
| Fresh       | 0–30 minutes                              | Within 15-minute client cache and valid forecast time                   | May be used with source and age shown   |
| Aging       | Not used as active aircraft mode          | Cache expired but last response may be shown only as historical context | Refresh/check before activation         |
| Stale       | More than 30 minutes or missing timestamp | Forecast/observation outside configured validity                        | Do not present as current; use fallback |
| Unavailable | Fetch/validation failed                   | Fetch/validation failed                                                 | Explain failure and preserve Simulation |

### 14.3 Time presentation

- Use ISO 8601 UTC in machine-readable data.
- Show user-facing time with timezone and an explicit `UTC` or local designation.
- Avoid ambiguous relative labels without an accessible exact timestamp.
- Calculate age from the device clock defensively; future timestamps beyond a small tolerance are invalid.

## 15. UI and Responsive Design

### 15.1 Visual direction

The interface must use a distinctive aviation-control visual language:

- dark navy/charcoal operational canvas with restrained cyan, amber, red, and green signals;
- strong information hierarchy and compact but readable data typography;
- clear separation of source status, alerts, map, aircraft, weather, runway, statistics, and learning content;
- aircraft markers with heading and selected/alert states;
- severity expressed through icon, text, shape, and colour;
- no generic admin-template appearance; and
- no airline branding or copyrighted imagery.

### 15.2 Required layout regions

- persistent title/status bar;
- safety and human-authority status;
- mode and scenario controls;
- primary map/schematic;
- aircraft list and selected-aircraft detail;
- alerts and explanation panel;
- runway and landing-priority panel;
- weather panel;
- statistics panel;
- “How It Works,” glossary, sources, and limitations; and
- provider attribution.

### 15.3 Responsive behavior

| Viewport                      | Required layout behavior                                                                                                                          |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Approximately 1440 px desktop | Multi-panel control-room layout; map remains primary; key statistics and alerts visible without excessive scrolling                               |
| Approximately 768 px tablet   | Two-column or staged layout; map and active panel remain prominent; no clipped tables or horizontal page scroll                                   |
| Approximately 390 px mobile   | Single-column prioritized flow; sticky compact status/controls where helpful; minimum touch targets; panels become accessible sections or drawers |

- **UI-01:** No essential control or explanation may be available only on hover.
- **UI-02:** Text must reflow without horizontal page scrolling at 320 CSS pixels, excluding the internal map canvas where panning is expected.
- **UI-03:** Loading, empty, error, offline, rate-limited, stale, and disabled states require designed presentations.
- **UI-04:** User choices must not obscure the persistent data-source badge or safety statement.
- **UI-05:** Animations must respect reduced-motion preferences and remain optional.

## 16. Accessibility

WCAG 2.2 Level AA is the target for all responsive variations.

- **A11Y-01:** Use semantic landmarks, headings, buttons, lists, tables, and status regions.
- **A11Y-02:** Every interactive control must be reachable and operable with a keyboard.
- **A11Y-03:** Provide a visible focus indicator that is not obscured by sticky UI.
- **A11Y-04:** Map-only information must have an equivalent aircraft list and text explanation.
- **A11Y-05:** Do not rely on colour alone for mode, severity, emergency, fuel, runway, or weather status.
- **A11Y-06:** Meet at least 4.5:1 contrast for normal text and 3:1 for large text and meaningful UI components.
- **A11Y-07:** Controls must have accessible names, states, and instructions.
- **A11Y-08:** Dynamic mode changes, alerts, and errors must use restrained accessible status announcements without excessive repetition.
- **A11Y-09:** Touch targets must meet WCAG 2.2 minimum target-size requirements or permitted spacing exceptions.
- **A11Y-10:** Support browser zoom to 200% without lost content or functionality.
- **A11Y-11:** Respect `prefers-reduced-motion`; avoid flashing content.
- **A11Y-12:** Charts and indicators require meaningful text alternatives or summaries.
- **A11Y-13:** Automated accessibility tests must be supplemented by keyboard, focus-order, zoom, and screen-reader-oriented manual checks.

## 17. Performance and Reliability

- **PERF-01:** Production assets must use Vite optimization, code splitting where useful, and compressed static resources.
- **PERF-02:** Avoid unnecessary dependencies and large media.
- **PERF-03:** Initial production JavaScript should target a practical compressed budget of 350 KB or less unless a documented map-library exception is approved during implementation.
- **PERF-04:** Scenario changes and aircraft selection should respond within 100 milliseconds on a typical modern laptop after load.
- **PERF-05:** Simulation ticks and pair calculations must avoid blocking the main thread; cap aircraft count to a tested educational maximum.
- **PERF-06:** External requests require finite timeouts and cancellation when superseded.
- **PERF-07:** A failed external request must not cause an unhandled exception or blank screen.
- **PERF-08:** A top-level error boundary must provide a recoverable message.
- **PERF-09:** Core application assets must be cached for repeat/offline demonstration; external freshness rules still apply.
- **PERF-10:** The production build must load correctly under `/ai-air-traffic-management/`.
- **PERF-11:** Browser console must be free of uncaught errors in the verified demonstration flows.
- **PERF-12:** GitHub Actions schedule delay, provider outage, and map-tile failure are expected degraded states, not application failures.

## 18. Privacy and Security

- **SEC-01:** Do not publish the source PDF, enrollment number, signatures, certificates, declarations, or private information.
- **SEC-02:** Do not display a student name until separately approved; the current requirement is to omit it.
- **SEC-03:** Do not publish private email addresses or local machine paths.
- **SEC-04:** Do not commit passwords, personal access tokens, OAuth client secrets, API keys, cookies, or credentials.
- **SEC-05:** No browser code may contain a secret.
- **SEC-06:** Do not collect names, emails, location, analytics, advertising identifiers, or user accounts.
- **SEC-07:** Store only non-sensitive preferences such as selected scenario or dismissed educational notice, if storage is necessary.
- **SEC-08:** Treat all external JSON as untrusted: validate schema, types, ranges, timestamps, record count, and string length.
- **SEC-09:** Render external text as text, never untrusted HTML.
- **SEC-10:** Use HTTPS sources only.
- **SEC-11:** Use minimum GitHub Actions permissions and pin action major versions or commit SHAs according to the approved implementation plan.
- **SEC-12:** Run dependency and secret scanning before merge and release.
- **SEC-13:** Avoid logging external payloads, tokens, environment variables, or private machine information.
- **SEC-14:** Include a restrictive static-site security policy where compatible with GitHub Pages, without breaking required map/weather requests or OSM Referer requirements.
- **SEC-15:** Scrub personal author metadata from the public DOCX artifact.

## 19. Academic Honesty and Safety

The exact required statement must be visible in the application:

> “This is an academic simulation for educational demonstration only. It is not an operational air traffic control, navigation, collision-avoidance, flight-planning, or safety system.”

Additional requirements:

- **HON-01:** Describe algorithms as explainable decision logic, AI-assisted simulation, or a risk-scoring prototype.
- **HON-02:** Do not claim a trained model, learned prediction, model accuracy, or production validation.
- **HON-03:** Do not call delayed aircraft snapshots real-time.
- **HON-04:** Do not imply that an external callsign, altitude, position, track, or squawk is complete, verified, or suitable for safety decisions.
- **HON-05:** Do not describe geometric projection from incomplete public data as actual collision danger.
- **HON-06:** Do not invent external aircraft fuel or operational intent.
- **HON-07:** Clearly state that a human controller retains final authority.
- **HON-08:** Explain that controller confirmation in the website is simulated and has no external effect.
- **HON-09:** Cite external providers and distinguish provider observations from application-derived scores.
- **HON-10:** Public program examples are educational references and do not imply FAA, EUROCONTROL, SESAR, NASA, university, airline, or airport endorsement.

## 20. Testing Requirements

### 20.1 Automated unit tests

Unit tests must cover:

- deterministic scenario generation and reset;
- seeded aircraft identity and movement;
- coordinate/velocity conversion;
- CPA time clamping and zero-relative-speed handling;
- horizontal/vertical threshold boundaries;
- weather classification at, below, and above every threshold;
- runway disqualification, score factors, tie-breaking, and recomputation;
- emergency ordering;
- fuel burn and Low/Critical boundaries;
- statistics over valid, partial, empty, simulated, and external datasets;
- provenance and freshness classification;
- external schema validation;
- HTTP error and timeout normalization;
- 429 retry parsing with seconds, valid dates/reset values, malformed values, and missing values;
- cooldown enforcement; and
- GitHub Pages base-path helpers.

### 20.2 Component and integration tests

Tests must verify:

- Simulation is the default mode.
- Scenario controls update map, list, alerts, runway, fuel, weather, and statistics coherently.
- Selecting an aircraft from map or list synchronizes details.
- Explanations include facts, threshold/rule, result, limitation, and human action.
- External mode activates only after valid fresh data.
- Invalid, empty-invalid, stale, offline, network, CORS-style, and rate-limited cases remain in Simulation.
- Simulated and external aircraft are never combined.
- Unsupported external values show `Unavailable`.
- Weather fallback is explicitly labelled.
- Controller confirm/reject interactions remain simulated.
- Safety, source, freshness, and attribution labels remain visible.

### 20.3 Browser and visual tests

Essential Playwright or equivalent tests must cover:

- production build at the repository base path;
- desktop at approximately 1440 px;
- tablet at approximately 768 px;
- mobile at approximately 390 px;
- offline repeat load after cached assets;
- map-tile failure with schematic fallback;
- keyboard navigation and focus visibility;
- reduced-motion behavior;
- every required deterministic scenario;
- External Data success using a fixture;
- network, validation, stale, CORS-style, and rate-limit fixtures; and
- no console errors during core flows.

### 20.4 Quality commands

Before each implementation PR is eligible to merge, CI must pass:

- formatting check;
- ESLint;
- strict TypeScript type checking;
- unit and component tests;
- production build;
- essential browser smoke tests;
- privacy/secret scan; and
- relevant accessibility checks.

Manual visual review remains required because automated tests cannot fully validate hierarchy, clipping, map readability, focus order, or explanation quality.

## 21. GitHub Workflow

- **GH-01:** Git initialization and GitHub repository creation occur only after Gate 3 approval.
- **GH-02:** Establish `main` with a minimal bootstrap commit.
- **GH-03:** After bootstrap, never push implementation directly to `main`.
- **GH-04:** Implement the Gate 3 checklist as small sequential branches and pull requests.
- **GH-05:** Each PR must include summary, user-visible behavior, test plan, risks/limitations, and screenshots where useful.
- **GH-06:** Each PR must contain focused commits and no `Co-Authored-By` trailer.
- **GH-07:** Required checks must pass before squash merge.
- **GH-08:** Material review findings must be resolved before merge.
- **GH-09:** Delete merged branches locally and remotely, refresh `main`, and verify the merged state.
- **GH-10:** Track every branch, commit, PR, check, merge, error, fix, and verification in `.codex/task-memory.md`.
- **GH-11:** Commit `.codex/MEMORY.md`, `.codex/task-memory.md`, and a root `AGENTS.md` during Gate 4.
- **GH-12:** Keep the source report and private identifiers outside the repository.

## 22. GitHub Pages Deployment

- **DEP-01:** Deploy only after Gate 4 is complete and explicitly approved.
- **DEP-02:** Build from `main` using GitHub Actions.
- **DEP-03:** Configure Vite base path as `/ai-air-traffic-management/`.
- **DEP-04:** Use the official GitHub Pages actions and production build artifact only.
- **DEP-05:** Use minimum permissions: repository contents read for build, then `pages: write` and `id-token: write` only where deployment requires them.
- **DEP-06:** Support manual dispatch.
- **DEP-07:** Use deployment concurrency to prevent overlapping Pages deployments.
- **DEP-08:** The scheduled aircraft-snapshot job must fetch one conservative regional request, validate it, emit status metadata, build the same-origin asset, and deploy without printing secrets.
- **DEP-09:** Schedule no more frequently than every 15 minutes at a non-round minute; document that GitHub may delay, drop, or disable inactive schedules.
- **DEP-10:** A failed scheduled fetch should publish or preserve an unavailable status without presenting stale aircraft as current.
- **DEP-11:** Verify the public URL, HTTP status, assets, base path, browser console, responsive layouts, all scenarios, external-data behavior, disclaimer, attribution, privacy, and repository state after deployment.
- **DEP-12:** Deployment workflow success alone is insufficient; the public interactions must pass smoke testing.

## 23. Acceptance Criteria

Gate 4 implementation may be presented for approval only when all applicable criteria below pass locally and in CI:

- **AC-01:** The application opens in Simulation with a visible `SIMULATED DATA` badge.
- **AC-02:** Normal, Severe Weather, Collision Risk, Low Fuel, and Emergency scenarios are deterministic and demonstrable.
- **AC-03:** Aircraft tracking, selection, details, movement, and heading markers work.
- **AC-04:** Collision projection produces tested CPA results and plain-language explanations.
- **AC-05:** Weather risk shows inputs, thresholds, result, source, and timestamp.
- **AC-06:** Runway scoring shows availability, wind, urgency, queue, and emergency contributions.
- **AC-07:** Fuel warnings use documented educational estimates and tested thresholds.
- **AC-08:** Emergency priority overrides routine ordering and explains why.
- **AC-09:** Statistics recompute from only the selected dataset.
- **AC-10:** Human review is required before any simulated recommendation is accepted.
- **AC-11:** The required safety statement is visible and technically honest language is used throughout.
- **AC-12:** External mode does not activate until a fresh, valid snapshot is available.
- **AC-13:** No screen silently mixes simulated and external aircraft.
- **AC-14:** External aircraft fuel and unsupported fields display `Unavailable` or an explicit educational label.
- **AC-15:** Network, CORS-style, invalid-data, stale, offline, and 429 paths preserve Simulation and explain the fallback.
- **AC-16:** Exact retry time is shown only from a valid provider value.
- **AC-17:** Source, mode, fetched time, age, freshness, and derived-value labels are visible.
- **AC-18:** The application remains demonstrable after external APIs and map tiles fail.
- **AC-19:** Desktop 1440 px, tablet 768 px, and mobile 390 px layouts pass visual review.
- **AC-20:** Keyboard, focus, contrast, reflow, reduced-motion, and accessible status behaviors meet the stated target.
- **AC-21:** Formatting, linting, strict type checking, unit tests, production build, and essential browser tests pass.
- **AC-22:** Production assets load under `/ai-air-traffic-management/`.
- **AC-23:** No uncaught console errors occur in verified flows.
- **AC-24:** README, requirements, explanations, sources, limitations, and demonstration guidance are complete.
- **AC-25:** The repository and production artifact contain no private PDF, enrollment number, student name, private contact detail, secret, or local machine path.
- **AC-26:** All provider attribution and licensing notices are visible and linked.
- **AC-27:** Main is synchronized, CI is green, no implementation PR remains open, and Git status is clean.

Gate 5 completes only after the deployed public URL independently passes the same core smoke tests and final privacy inspection.

## 24. Known Limitations

- The simulator uses simplified deterministic logic, not a trained AI model.
- CPA assumes short-term constant velocity and omits intent, clearances, turns, winds aloft, surveillance quality, aircraft performance, and certified separation logic.
- Educational thresholds are not operational minima or airport procedures.
- Weather forecasts can be inaccurate, delayed, unavailable, or spatially coarse.
- The weather score omits many aviation hazards and authoritative sources such as METAR, TAF, SIGMET, radar, NOTAMs, runway condition reports, and controller/pilot reports.
- Public ADS-B aggregation is incomplete and may contain stale, wrong, duplicated, filtered, or missing aircraft.
- The aircraft source does not provide authoritative route, intent, destination, runway, fuel, passenger, or safety information.
- Scheduled snapshots are near-live at best and can be delayed, dropped, or disabled after repository inactivity.
- External aircraft coverage around Lucknow depends on community receivers and may legitimately be empty.
- GitHub Pages is static and cannot hide secrets or provide a continuously running backend.
- OpenStreetMap tiles are best effort and do not support bulk or offline download from the standard service.
- Offline mode works only after core assets have been loaded and cached; the first visit requires internet access.
- A device clock that is substantially wrong can affect displayed age; defensive validation reduces but cannot eliminate this issue.
- The configurable region uses demonstration configuration and does not automatically become an authoritative airport database.
- Human-controller confirmation is a UI concept with no real-world effect.

## 25. Verified Sources and Attribution

Sources were checked on 28 July 2026. Provider terms can change and must be rechecked before final deployment.

### 25.1 Weather

- [Open-Meteo Forecast API documentation](https://open-meteo.com/en/docs)
- [Open-Meteo terms and rate limits](https://open-meteo.com/en/terms)
- [Open-Meteo licence](https://open-meteo.com/en/license)
- Required nearby display attribution: `Weather data by Open-Meteo.com`, linked to [Open-Meteo](https://open-meteo.com/)
- Data licence: CC BY 4.0. The site must state that weather risk is derived by FutureATC Lab from provider data.

### 25.2 Aircraft

- [adsb.fi open-data API documentation, limits, terms, and attribution](https://github.com/adsbfi/opendata/blob/main/README.md)
- Required display attribution: `Aircraft data: adsb.fi`, linked to [adsb.fi](https://adsb.fi/)
- Use only for this personal, non-commercial, ad-free educational project.
- Public endpoint limit: one request per second. FutureATC Lab uses one small regional request per scheduled run.
- Direct browser use was rejected because a live CORS test did not provide an origin allowance; the same-origin scheduled snapshot is required.
- [OpenSky terms](https://opensky-network.org/about/terms-of-use) were reviewed and rejected for the deployed path because current terms require a written licence for operational REST API use in a live service or automated system.

### 25.3 Map

- [OpenStreetMap Standard tile policy](https://operations.osmfoundation.org/policies/tiles/)
- [OpenStreetMap copyright and attribution](https://www.openstreetmap.org/copyright)
- Required visible map attribution: `© OpenStreetMap contributors`.
- Use only the documented HTTPS tile URL, preserve normal browser Referer behavior, honour caching, and do not prefetch, bulk-download, scrape, or offer offline tile downloads.
- [Leaflet stable-download information](https://leafletjs.com/download.html)
- Leaflet is a candidate open-source browser map library; final dependency version and licence metadata must be reverified during Gate 3 planning and Gate 4 installation.

### 25.4 Hosting and scheduling

- [GitHub Actions workflow syntax and schedule behavior](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
- [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)
- [GitHub Actions billing for public repositories](https://docs.github.com/en/actions/concepts/billing-and-usage)
- [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)

### 25.5 Accessibility

- [W3C Web Content Accessibility Guidelines 2.2](https://www.w3.org/TR/WCAG22/)
- Target: WCAG 2.2 Level AA, verified through automated and manual testing rather than an unsupported blanket conformance claim.

## Approval Control

This specification is the Gate 2 approval candidate. It authorizes requirements only. It does not authorize Git initialization, package installation, application code, GitHub repository creation, pull requests, or deployment.

After approval, Gate 3 will convert these requirements into the implementation architecture, data flow, state machine, test strategy, deployment strategy, and complete branch/commit/PR checklist.
