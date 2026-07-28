# FutureATC Lab

FutureATC Lab is an academic AI-assisted air traffic management simulator. Its deterministic
scenarios now combine a responsive aircraft dashboard with explainable educational decision
support:

- ten-minute closest-point-of-approach projections with explicit thresholds and limitations;
- simulated fuel burn, endurance, Low/Critical states, and stable emergency priority;
- deterministic scenario weather plus an optional, validated
  [Open-Meteo](https://open-meteo.com/en/docs) current/hourly outlook with a 15-minute cache,
  explicit provenance, and simulated fallback;
- transparent runway scoring that recomputes from the active weather and shows every contribution;
  and
- browser-only human confirm/reject and simulated-emergency controls with no external effect.

Run `npm install`, then `npm run dev` for local use. `npm run check` and
`npm run test:e2e` execute the complete automated verification suite.

Observed weather is fetched only when the user selects **Check observed weather**. The request sends
the configured demonstration-region coordinates to Open-Meteo; aircraft remain synthetic, and no
aircraft or personal data is sent. Provider data is licensed under CC BY 4.0 and is used here only
for this non-commercial educational research demonstration.

> This is an academic simulation for educational demonstration only. It is not an operational air traffic control, navigation, collision-avoidance, flight-planning, or safety system.
