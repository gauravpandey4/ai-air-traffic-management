import {
  Activity,
  BookOpen,
  CloudSun,
  Fuel,
  Gauge,
  GitBranch,
  ListOrdered,
  Plane,
  Route,
  type LucideIcon,
} from 'lucide-react';

type Capability = {
  id: string;
  title: string;
  summary: string;
  inputs: string;
  rule: string;
  output: string;
  limitation: string;
  icon: LucideIcon;
};

const capabilities: readonly Capability[] = [
  {
    id: 'movement',
    title: '1. Deterministic movement',
    summary: 'Replays the same educational traffic picture from the same seed.',
    inputs:
      'Synthetic position, heading, ground speed, scenario seed, and elapsed simulation time.',
    rule: 'Each tick projects heading and speed on a local geographic plane. Tracks that cross the configured demonstration bounds wrap predictably.',
    output: 'Synchronized map, aircraft list, selected detail, and reproducible reset.',
    limitation:
      'This is simplified kinematics, not a flight dynamics, navigation, surveillance, or trajectory-prediction model.',
    icon: Plane,
  },
  {
    id: 'collision',
    title: '2. Collision projection',
    summary: 'Shows why a pair enters an educational separation band.',
    inputs: 'Two valid positions, altitudes, headings, and ground speeds.',
    rule: 'A constant-velocity closest-point-of-approach projection is clamped to 10 minutes, then compared with centralized educational horizontal and vertical bands.',
    output:
      'Projected time, separations, severity, facts, rule, limitation, and required human review.',
    limitation:
      'The geometric projection cannot establish actual collision danger and does not model intent, turns, climb profiles, uncertainty, or controller clearances.',
    icon: Route,
  },
  {
    id: 'weather',
    title: '3. Weather risk',
    summary: 'Classifies a validated observation with transparent local rules.',
    inputs:
      'Wind, gust, direction, visibility, precipitation rate, weather code, and short outlook.',
    rule: 'The highest triggered educational threshold sets Normal, Elevated, or Severe; every contributing factor remains visible.',
    output: 'Risk, trend, source, age, factors, and an independent simulated-weather fallback.',
    limitation:
      'It omits METAR, TAF, SIGMET, radar, NOTAMs, runway state, microbursts, and aircraft-specific performance.',
    icon: CloudSun,
  },
  {
    id: 'runway',
    title: '4. Runway scoring',
    summary: 'Ranks configured reciprocal demonstration runways without issuing a clearance.',
    inputs:
      'Candidate wind, queue load, simulated urgency, fuel state, conflict severity, and runway availability.',
    rule: 'A base score of 50 receives bounded wind and queue contributions, +15 low fuel, +30 critical fuel, up to +20 conflict, and +100 simulated emergency. Unavailable runways stay disqualified.',
    output: 'Suggested runway, named score contributions, and deterministic tie-breaking.',
    limitation:
      'Scores are educational defaults, not airport procedures, declared distances, performance calculations, or operational minima.',
    icon: GitBranch,
  },
  {
    id: 'fuel',
    title: '5. Fuel endurance',
    summary: 'Demonstrates transparent threshold-based fuel review for synthetic tracks.',
    inputs: 'Synthetic initial fuel, burn rate, elapsed time, and scenario modifier.',
    rule: 'Remaining fuel is clamped at zero. Estimated endurance below 30 minutes is Low and below 15 minutes is Critical.',
    output:
      'Remaining synthetic fuel, endurance, state, threshold explanation, and priority factor.',
    limitation:
      'External aircraft fuel is unavailable. The simulator does not model reserves, aircraft performance, route, wind, or real fuel.',
    icon: Fuel,
  },
  {
    id: 'priority',
    title: '6. Emergency and landing priority',
    summary: 'Explains why a synthetic arrival moves in a stable review queue.',
    inputs:
      'Simulated emergency, fuel, projected conflict, weather exposure, estimated arrival, and original order.',
    rule: 'Stable ordering considers emergency first, then critical fuel, time-critical conflict, severe weather, low fuel, arrival estimate, and original order.',
    output: 'A ranked educational queue with the first factor that changed each priority.',
    limitation:
      'Confirm, reject, declare, and clear actions change this browser simulation only. A human retains final authority.',
    icon: ListOrdered,
  },
  {
    id: 'statistics',
    title: '7. Selected-dataset statistics',
    summary: 'Summarizes only the aircraft dataset that is currently active.',
    inputs: 'The complete active Simulation or validated External snapshot—never a mixture.',
    rule: 'Averages exclude invalid observations and disclose their denominators. Unsupported intent, fuel, and operational status remain unavailable.',
    output:
      'Counts, valid-observation averages, active alerts, and a plain-language accessible summary.',
    limitation:
      'Statistics describe the current educational view; they are not airport traffic, safety, performance, or capacity measures.',
    icon: Activity,
  },
];

const glossary = [
  ['CPA', 'Closest point of approach in the local constant-velocity projection.'],
  [
    'Freshness',
    'The validated age window during which an optional provider snapshot may be shown.',
  ],
  ['Ground speed', 'Horizontal speed over the ground, displayed in knots when supplied.'],
  [
    'Near-live',
    'A recent validated snapshot that may already be delayed; it is never labelled real-time.',
  ],
  [
    'Provenance',
    'Where a value came from, when it was generated or fetched, and its known limits.',
  ],
  [
    'Runway score',
    'A transparent educational comparison of configured candidates, not a clearance.',
  ],
  [
    'Simulation seed',
    'A fixed input that makes the same scenario generate the same synthetic traffic.',
  ],
] as const;

export function LearningCenter() {
  return (
    <section className="learning-center panel" aria-labelledby="learning-title">
      <header className="learning-heading">
        <div>
          <p className="eyebrow">Evaluator guide</p>
          <h2 id="learning-title">How FutureATC Lab works</h2>
          <p>
            Open any capability for its inputs, rule, output, and limitation. Every result is an
            educational aid for human review—not an operational instruction.
          </p>
        </div>
        <BookOpen aria-hidden="true" size={28} />
      </header>

      <div className="capability-grid">
        {capabilities.map(
          ({ id, title, summary, inputs, rule, output, limitation, icon: Icon }) => (
            <details className="capability-card" key={id}>
              <summary>
                <Icon aria-hidden="true" size={20} />
                <span>
                  <strong>{title}</strong>
                  <small>{summary}</small>
                </span>
              </summary>
              <dl>
                <div>
                  <dt>Inputs</dt>
                  <dd>{inputs}</dd>
                </div>
                <div>
                  <dt>Rule</dt>
                  <dd>{rule}</dd>
                </div>
                <div>
                  <dt>Output</dt>
                  <dd>{output}</dd>
                </div>
                <div>
                  <dt>Limitation</dt>
                  <dd>{limitation}</dd>
                </div>
              </dl>
            </details>
          ),
        )}
      </div>

      <div className="learning-reference-grid">
        <article aria-labelledby="demo-guide-title">
          <Gauge aria-hidden="true" size={20} />
          <h3 id="demo-guide-title">Five-minute demo path</h3>
          <ol>
            <li>Start in Normal traffic and select a synthetic aircraft.</li>
            <li>Open Collision risk and inspect “Why this result?”.</li>
            <li>Compare Severe weather runway contributions.</li>
            <li>Review Low fuel, Emergency priority, and simulated human actions.</li>
            <li>Optionally check provider data, then return to the full Simulation.</li>
          </ol>
        </article>

        <article aria-labelledby="glossary-title">
          <BookOpen aria-hidden="true" size={20} />
          <h3 id="glossary-title">Plain-language glossary</h3>
          <dl className="glossary-list">
            {glossary.map(([term, definition]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{definition}</dd>
              </div>
            ))}
          </dl>
        </article>

        <article aria-labelledby="sources-title">
          <CloudSun aria-hidden="true" size={20} />
          <h3 id="sources-title">Sources and attribution</h3>
          <ul>
            <li>
              Optional map tiles:{' '}
              <a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>.
            </li>
            <li>
              Optional weather: <a href="https://open-meteo.com/">Open-Meteo</a>.
            </li>
            <li>
              Optional aircraft snapshots: <a href="https://adsb.fi/">adsb.fi</a>.
            </li>
            <li>
              Decision rules, scenarios, and classifications: local FutureATC educational code.
            </li>
          </ul>
          <p>No analytics, accounts, advertising, or personal-data collection are used.</p>
        </article>

        <article aria-labelledby="limits-title">
          <Route aria-hidden="true" size={20} />
          <h3 id="limits-title">System boundary</h3>
          <ul>
            <li>No connection to aircraft, controllers, airports, or aviation infrastructure.</li>
            <li>No clearance, navigation, collision avoidance, dispatch, or flight planning.</li>
            <li>Provider coverage, timing, availability, and accuracy are not guaranteed.</li>
            <li>The offline shell caches local app assets—not bulk OpenStreetMap tiles.</li>
          </ul>
        </article>
      </div>
    </section>
  );
}
