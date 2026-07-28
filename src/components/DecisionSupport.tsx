import {
  AlertTriangle,
  Check,
  ClipboardCheck,
  Fuel,
  ListOrdered,
  RotateCcw,
  Siren,
  X,
} from 'lucide-react';

import { useSimulator } from '../app/simulator-context';
import type { Explanation } from '../domain/types';

function ExplanationDetails({ explanation }: { explanation: Explanation }) {
  return (
    <details className="explanation-details">
      <summary>Why this result?</summary>
      <div className="explanation-content">
        <div>
          <strong>Facts and units</strong>
          <ul>
            {explanation.facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </div>
        <p>
          <strong>Source:</strong> {explanation.source}
        </p>
        <p>
          <strong>Rule:</strong> {explanation.rule}
        </p>
        <p>
          <strong>Result:</strong> {explanation.result}
        </p>
        <p>
          <strong>Main factors:</strong> {explanation.factors.join('; ')}
        </p>
        <p>
          <strong>Limitation:</strong> {explanation.limitation}
        </p>
        <p>
          <strong>Human review:</strong> {explanation.humanAction}
        </p>
      </div>
    </details>
  );
}

export function AlertCenter() {
  const { decisionSupport, state, dispatch } = useSimulator();

  return (
    <section className="panel decision-panel alert-panel" aria-labelledby="alert-center-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Educational projections</p>
          <h2 id="alert-center-title">Alert center</h2>
        </div>
        <span className="count-badge">{decisionSupport.alerts.length}</span>
      </div>
      <div className="decision-panel-body" aria-live="polite">
        {decisionSupport.alerts.length === 0 ? (
          <div className="empty-decision-state">
            <Check aria-hidden="true" size={20} />
            <p>No Monitor, Warning, or Critical rules are triggered in this simulated snapshot.</p>
          </div>
        ) : (
          <ul className="alert-list">
            {decisionSupport.alerts.map((alert) => {
              const acknowledged = state.acknowledgedAlertIds.includes(alert.id);
              return (
                <li
                  className={`alert-card severity-border-${alert.severity.toLowerCase()}`}
                  key={alert.id}
                >
                  <div className="alert-heading">
                    <AlertTriangle aria-hidden="true" size={18} />
                    <div>
                      <strong>{alert.title}</strong>
                      <p>{alert.summary}</p>
                    </div>
                    <span className={`severity-label severity-${alert.severity.toLowerCase()}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <ExplanationDetails explanation={alert.explanation} />
                  <button
                    type="button"
                    className="text-action"
                    disabled={acknowledged}
                    onClick={() => dispatch({ type: 'alert-acknowledged', alertId: alert.id })}
                  >
                    {acknowledged ? 'Acknowledged in simulation' : 'Acknowledge for review'}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

export function LandingPriority() {
  const { decisionSupport, dispatch } = useSimulator();

  return (
    <section className="panel decision-panel" aria-labelledby="landing-priority-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Stable lexicographic queue</p>
          <h2 id="landing-priority-title">Landing priority</h2>
        </div>
        <ListOrdered aria-hidden="true" size={21} />
      </div>
      <ol className="priority-list">
        {decisionSupport.priority.slice(0, 5).map((entry) => (
          <li key={entry.aircraftId}>
            <span className="priority-rank">{entry.rank}</span>
            <div>
              <button
                type="button"
                className="callsign-action"
                onClick={() =>
                  dispatch({ type: 'aircraft-selected', aircraftId: entry.aircraftId })
                }
              >
                {entry.callsign}
              </button>
              <strong>{entry.reason}</strong>
              <p>{entry.supportingFactors.join(' · ')}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="module-note">
        Emergency → Critical fuel → Critical projected conflict → Severe weather → Low fuel → ETA →
        original order.
      </p>
    </section>
  );
}

export function RunwayPanel() {
  const { decisionSupport } = useSimulator();
  const recommendation = decisionSupport.runwayRecommendation;

  return (
    <section className="panel decision-panel runway-panel" aria-labelledby="runway-panel-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Transparent score, human decision</p>
          <h2 id="runway-panel-title">Runway recommendation</h2>
        </div>
        <span className="status-badge status-badge--simulation">Simulated config</span>
      </div>
      {recommendation === null ? (
        <p className="decision-panel-body">No aircraft is available for runway scoring.</p>
      ) : (
        <div className="decision-panel-body">
          <p className="recommendation-lead">
            <span>Recommendation for {recommendation.callsign}</span>
            <strong>
              {recommendation.suggestedRunwayId === null
                ? 'No valid runway'
                : `Suggested runway ${recommendation.suggestedRunwayId}`}
            </strong>
          </p>
          <div className="runway-score-grid">
            {recommendation.scores.map((score) => (
              <article
                className={score.available ? 'runway-score' : 'runway-score is-unavailable'}
                key={score.runwayId}
              >
                <header>
                  <strong>{score.runwayId}</strong>
                  <span>
                    {score.total === null ? 'Unavailable' : `${score.total.toFixed(1)} pts`}
                  </span>
                </header>
                <ul>
                  {score.contributions.map((contribution) => (
                    <li key={contribution.label}>
                      <span>
                        {contribution.label}
                        <small>{contribution.detail}</small>
                      </span>
                      <strong>
                        {contribution.value > 0 ? '+' : ''}
                        {contribution.value.toFixed(1)}
                      </strong>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <ExplanationDetails explanation={recommendation.explanation} />
        </div>
      )}
    </section>
  );
}

export function HumanReviewPanel() {
  const { decisionSupport, selectedAircraft, state, dispatch } = useSimulator();
  const recommendation = decisionSupport.runwayRecommendation;
  const decision =
    recommendation === null
      ? 'Awaiting review'
      : (state.reviewDecisions[recommendation.id] ?? 'Awaiting review');

  return (
    <section
      className="panel decision-panel human-review-panel"
      aria-labelledby="human-review-title"
    >
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Controller retains authority</p>
          <h2 id="human-review-title">Human review</h2>
        </div>
        <ClipboardCheck aria-hidden="true" size={21} />
      </div>
      <div className="decision-panel-body">
        <p className="review-status" role="status">
          <span>Current state</span>
          <strong>{decision}</strong>
        </p>
        <div className="review-actions">
          <button
            type="button"
            className="primary-action"
            disabled={recommendation === null}
            onClick={() => {
              if (recommendation !== null) {
                dispatch({
                  type: 'recommendation-reviewed',
                  recommendationId: recommendation.id,
                  decision: 'Confirmed in simulation',
                });
              }
            }}
          >
            <Check aria-hidden="true" size={17} />
            Confirm simulation
          </button>
          <button
            type="button"
            disabled={recommendation === null}
            onClick={() => {
              if (recommendation !== null) {
                dispatch({
                  type: 'recommendation-reviewed',
                  recommendationId: recommendation.id,
                  decision: 'Rejected in simulation',
                });
              }
            }}
          >
            <X aria-hidden="true" size={17} />
            Reject simulation
          </button>
        </div>
        {selectedAircraft === null ? (
          <p className="empty-decision-state">No aircraft is available for simulated review.</p>
        ) : (
          <div className="emergency-control">
            <Siren aria-hidden="true" size={18} />
            <div>
              <strong>{selectedAircraft.callsign}</strong>
              <p>
                {state.aircraftMode === 'External Active'
                  ? 'Emergency state unavailable for external snapshots.'
                  : selectedAircraft.simulatedEmergency
                    ? 'A simulated emergency is active.'
                    : 'No simulated emergency is active.'}
              </p>
            </div>
            <button
              type="button"
              disabled={state.aircraftMode === 'External Active'}
              onClick={() => dispatch({ type: 'selected-emergency-toggled' })}
            >
              {selectedAircraft.simulatedEmergency ? (
                <RotateCcw aria-hidden="true" size={16} />
              ) : (
                <Fuel aria-hidden="true" size={16} />
              )}
              {selectedAircraft.simulatedEmergency
                ? 'Clear simulated emergency'
                : 'Declare simulated emergency'}
            </button>
          </div>
        )}
        <p className="module-note">
          These controls update browser-only educational state. They do not issue a clearance,
          contact an aircraft, or affect any external system.
        </p>
      </div>
    </section>
  );
}

export function DecisionSupportPanels() {
  return (
    <div className="decision-layout">
      <AlertCenter />
      <LandingPriority />
      <RunwayPanel />
      <HumanReviewPanel />
    </div>
  );
}
