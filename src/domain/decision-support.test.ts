import { decorateAircraftForDecisionSupport, deriveDecisionSupport } from './decision-support';
import { createInitialSimulationState, simulationReducer } from './simulation';

describe('integrated decision support', () => {
  it('keeps Normal traffic free of forced decision alerts and queues routine arrivals only', () => {
    const state = createInitialSimulationState('normal-traffic');
    const support = deriveDecisionSupport(state);
    expect(support.alerts).toEqual([]);
    expect(
      support.priority.every((entry) => {
        const aircraft = state.aircraft.find((item) => item.id === entry.aircraftId);
        return aircraft?.phase === 'Arrival';
      }),
    ).toBe(true);
  });

  it('reliably produces a Critical CPA in the collision scenario', () => {
    const state = createInitialSimulationState('collision-risk');
    const support = deriveDecisionSupport(state);
    expect(support.conflicts.some((conflict) => conflict.severity === 'Critical')).toBe(true);
    expect(support.alerts.some((alert) => alert.title === 'Critical projected separation')).toBe(
      true,
    );
    expect(
      decorateAircraftForDecisionSupport(state.aircraft, support)
        .filter((aircraft) => support.alerts[0]?.aircraftIds.includes(aircraft.id))
        .every((aircraft) => aircraft.severity === 'Critical'),
    ).toBe(true);
  });

  it('makes critical fuel visible in priority and runway factors', () => {
    const support = deriveDecisionSupport(createInitialSimulationState('low-fuel'));
    expect(support.alerts.some((alert) => alert.title === 'Critical simulated fuel')).toBe(true);
    expect(support.priority[0]?.reason).toBe('Critical simulated fuel');
    expect(
      support.runwayRecommendation?.scores[0]?.contributions.some(
        (factor) => factor.label === 'Fuel urgency' && factor.value > 0,
      ),
    ).toBe(true);
  });

  it('puts an emergency first without recommending the unavailable runway', () => {
    const support = deriveDecisionSupport(createInitialSimulationState('emergency'));
    expect(support.priority[0]?.reason).toBe('Active simulated emergency');
    expect(support.runwayRecommendation?.suggestedRunwayId).toBe('SIM-27');
    expect(
      support.runwayRecommendation?.scores.find((score) => score.runwayId === 'SIM-09')?.total,
    ).toBeNull();
  });

  it('acknowledges without suppressing recalculation and recomputes after emergency changes', () => {
    const initial = createInitialSimulationState('collision-risk');
    const initialSupport = deriveDecisionSupport(initial);
    const alert = initialSupport.alerts[0];
    expect(alert).toBeDefined();
    if (alert === undefined) return;

    const acknowledged = simulationReducer(initial, {
      type: 'alert-acknowledged',
      alertId: alert.id,
    });
    expect(deriveDecisionSupport(acknowledged).alerts.map((item) => item.id)).toContain(alert.id);

    const emergency = simulationReducer(acknowledged, { type: 'selected-emergency-toggled' });
    expect(deriveDecisionSupport(emergency).priority[0]?.reason).toBe('Active simulated emergency');
  });

  it('recomputes runway scores when scenario wind context and elapsed fuel change', () => {
    const normal = createInitialSimulationState('normal-traffic');
    const weather = createInitialSimulationState('severe-weather');
    expect(deriveDecisionSupport(normal).runwayRecommendation?.scores).not.toEqual(
      deriveDecisionSupport(weather).runwayRecommendation?.scores,
    );

    const lowFuel = createInitialSimulationState('low-fuel');
    const later = simulationReducer(lowFuel, { type: 'simulation-ticked', seconds: 600 });
    expect(
      deriveDecisionSupport(later).fuelByAircraftId[later.selectedAircraftId]?.enduranceMinutes,
    ).toBeLessThan(
      deriveDecisionSupport(lowFuel).fuelByAircraftId[lowFuel.selectedAircraftId]
        ?.enduranceMinutes ?? 0,
    );
  });

  it('handles an empty educational dataset without fabricating a recommendation', () => {
    const initial = createInitialSimulationState();
    const support = deriveDecisionSupport({
      ...initial,
      aircraft: [],
      selectedAircraftId: '',
    });
    expect(support.priority).toEqual([]);
    expect(support.runwayRecommendation).toBeNull();
    expect(decorateAircraftForDecisionSupport([], support)).toEqual([]);
  });

  it('includes a declared non-arrival emergency and decorates fuel severity', () => {
    const initial = createInitialSimulationState('low-fuel');
    const initialSupport = deriveDecisionSupport(initial);
    const fuelDecorated = decorateAircraftForDecisionSupport(initial.aircraft, initialSupport);
    expect(
      fuelDecorated.find(
        (aircraft) => initialSupport.fuelByAircraftId[aircraft.id]?.state === 'Critical',
      )?.severity,
    ).toBe('Critical');
    expect(
      fuelDecorated.find(
        (aircraft) => initialSupport.fuelByAircraftId[aircraft.id]?.state === 'Low',
      )?.severity,
    ).toBe('Warning');

    const departure = initial.aircraft.find((aircraft) => aircraft.phase === 'Departure');
    expect(departure).toBeDefined();
    if (departure === undefined) return;

    const emergency = simulationReducer(
      { ...initial, selectedAircraftId: departure.id },
      { type: 'selected-emergency-toggled' },
    );
    const support = deriveDecisionSupport(emergency);
    expect(support.priority[0]?.aircraftId).toBe(departure.id);

    const decorated = decorateAircraftForDecisionSupport(emergency.aircraft, support);
    expect(decorated.find((aircraft) => aircraft.id === departure.id)?.severity).toBe('Critical');
  });
});
