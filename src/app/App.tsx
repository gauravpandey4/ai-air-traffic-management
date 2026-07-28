import { Plane, ShieldCheck } from 'lucide-react';

import { defaultRegion } from '../config/regions';
import { AircraftDetail } from '../components/AircraftDetail';
import { AircraftDataPanel } from '../components/AircraftDataPanel';
import { AircraftList } from '../components/AircraftList';
import { DecisionSupportPanels } from '../components/DecisionSupport';
import { ScenarioBrief } from '../components/ScenarioBrief';
import { SimulationControls } from '../components/SimulationControls';
import { TrafficMap } from '../components/TrafficMap';
import { TrafficStatistics } from '../components/TrafficStatistics';
import { WeatherPanel } from '../components/WeatherPanel';
import { LearningCenter } from '../components/LearningCenter';

import { ErrorBoundary } from './ErrorBoundary';
import { PwaStatus } from './PwaStatus';
import { SimulatorProvider } from './SimulatorProvider';
import { useSimulator } from './simulator-context';

function Dashboard() {
  const { state } = useSimulator();

  return (
    <>
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
            <span className="status-badge status-badge--simulation">
              {state.aircraftMode === 'External Active'
                ? 'Near-live aircraft snapshot'
                : state.aircraftMode === 'Checking'
                  ? 'Checking aircraft snapshot'
                  : 'Simulated data'}
            </span>
            <span className="status-badge status-badge--ready">
              {state.isPlaying ? 'Simulation running' : 'Simulation paused'}
            </span>
          </div>
        </header>

        <aside className="safety-banner" aria-label="Academic safety notice">
          <ShieldCheck aria-hidden="true" size={20} />
          <p>
            <strong>Academic simulation.</strong> A human controller retains final authority. This
            interface has no connection to aircraft or aviation infrastructure.
          </p>
        </aside>

        <PwaStatus />
        <SimulationControls />
        <AircraftDataPanel />

        <main id="main-content" className="dashboard">
          <ScenarioBrief />
          <TrafficStatistics />
          <WeatherPanel />

          <div className="traffic-layout">
            <TrafficMap />
            <AircraftDetail />
          </div>

          <AircraftList />

          <DecisionSupportPanels />

          <LearningCenter />
        </main>

        <footer className="footer">
          <div>
            <p>
              This is an academic simulation for educational demonstration only. It is not an
              operational air traffic control, navigation, collision-avoidance, flight-planning, or
              safety system.
            </p>
            <p>{defaultRegion.displayName} · Amity University Uttar Pradesh, Lucknow</p>
          </div>
          <nav aria-label="Data source attribution">
            <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>
            <a href="https://open-meteo.com/">Open-Meteo</a>
            <a href="https://adsb.fi/">adsb.fi</a>
          </nav>
        </footer>
      </div>
    </>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <SimulatorProvider>
        <Dashboard />
      </SimulatorProvider>
    </ErrorBoundary>
  );
}
