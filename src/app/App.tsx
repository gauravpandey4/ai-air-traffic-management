import { Activity, CloudSun, Plane, Radar, ShieldCheck } from 'lucide-react';

import { ErrorBoundary } from './ErrorBoundary';

const modules = [
  {
    icon: Radar,
    title: 'Traffic picture',
    text: 'A deterministic scenario and synchronized aircraft detail surface will appear here.',
  },
  {
    icon: ShieldCheck,
    title: 'Decision support',
    text: 'Conflict, runway, fuel, and emergency recommendations always await human review.',
  },
  {
    icon: CloudSun,
    title: 'Weather context',
    text: 'Seeded weather remains available when optional external observations cannot be used.',
  },
  {
    icon: Activity,
    title: 'Explainable statistics',
    text: 'Every value will identify its source, units, time, and educational derivation.',
  },
] as const;

export function App() {
  return (
    <ErrorBoundary>
      <a className="skip-link" href="#main-content">
        Skip to simulator
      </a>
      <div className="app-shell">
        <header className="topbar">
          <div className="identity">
            <span className="identity-mark" aria-hidden="true">
              <Plane size={22} strokeWidth={1.8} />
            </span>
            <div>
              <p className="eyebrow">AI-assisted ATM simulator</p>
              <h1>FutureATC Lab</h1>
            </div>
          </div>
          <div className="status-cluster" aria-label="System status">
            <span className="status-badge status-badge--simulation">Simulated data</span>
            <span className="status-badge status-badge--ready">System ready</span>
          </div>
        </header>

        <aside className="safety-banner" aria-label="Academic safety notice">
          <ShieldCheck aria-hidden="true" size={20} />
          <p>
            <strong>Academic simulation.</strong> A human controller retains final authority. This
            interface has no connection to aircraft or aviation infrastructure.
          </p>
        </aside>

        <main id="main-content" className="workspace">
          <section className="hero-panel" aria-labelledby="overview-title">
            <div>
              <p className="eyebrow">Lucknow demonstration region · Foundation preview</p>
              <h2 id="overview-title">
                A clear, explainable view of future air traffic decisions.
              </h2>
              <p className="hero-copy">
                The approved implementation will combine deterministic flight movement, projected
                separation, weather risk, runway scoring, fuel monitoring, emergency priority, and
                live-derived statistics in one responsive learning environment.
              </p>
            </div>
            <div className="radar-preview" aria-label="Decorative schematic radar preview">
              <span className="radar-ring radar-ring--outer" />
              <span className="radar-ring radar-ring--inner" />
              <span className="radar-sweep" />
              <Plane className="radar-aircraft" size={26} aria-hidden="true" />
              <span className="radar-label">SIM · LUCKNOW</span>
            </div>
          </section>

          <section className="module-grid" aria-label="Planned simulator modules">
            {modules.map(({ icon: Icon, title, text }) => (
              <article className="module-card" key={title}>
                <Icon aria-hidden="true" size={22} />
                <h2>{title}</h2>
                <p>{text}</p>
              </article>
            ))}
          </section>
        </main>

        <footer className="footer">
          <p>
            This is an academic simulation for educational demonstration only. It is not an
            operational air traffic control, navigation, collision-avoidance, flight-planning, or
            safety system.
          </p>
          <p>Amity University Uttar Pradesh, Lucknow</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
