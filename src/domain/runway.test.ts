import { recommendRunway, runwayWeights, scoreRunway } from './runway';

const routineAircraft = {
  aircraftId: 'aircraft-a',
  callsign: 'SIM-TEST1',
  estimatedArrivalMinutes: 5,
  fuelState: 'Normal',
  conflictSeverity: 'Normal',
  simulatedEmergency: false,
} as const;

describe('explainable runway scoring', () => {
  it('disqualifies an unavailable runway regardless of emergency priority', () => {
    const score = scoreRunway(
      { id: 'SIM-09', headingDeg: 90, available: false, queueLength: 0 },
      { ...routineAircraft, simulatedEmergency: true },
      90,
      10,
    );
    expect(score.total).toBeNull();
    expect(score.contributions).toHaveLength(1);
  });

  it('shows bounded headwind, crosswind, tailwind, queue, urgency, fuel, conflict, and emergency factors', () => {
    const score = scoreRunway(
      { id: 'SIM-09', headingDeg: 90, available: true, queueLength: 9 },
      {
        ...routineAircraft,
        fuelState: 'Critical',
        conflictSeverity: 'Critical',
        simulatedEmergency: true,
      },
      270,
      40,
    );
    const values = Object.fromEntries(
      score.contributions.map((contribution) => [contribution.label, contribution.value]),
    );
    expect(values['Neutral base']).toBe(runwayWeights.base);
    expect(values['Headwind suitability']).toBe(0);
    expect(values.Crosswind).toBeCloseTo(0, 5);
    expect(values.Tailwind).toBe(-runwayWeights.maximumTailwindPenalty);
    expect(values['Queue load']).toBe(-runwayWeights.maximumQueuePenalty);
    expect(values['Arrival urgency']).toBe(5);
    expect(values['Fuel urgency']).toBe(runwayWeights.criticalFuel);
    expect(values['Conflict urgency']).toBe(runwayWeights.criticalConflict);
    expect(values['Emergency priority']).toBe(runwayWeights.emergency);
  });

  it('applies Low/Warning contributions and crosswind cap', () => {
    const score = scoreRunway(
      { id: 'SIM-09', headingDeg: 90, available: true, queueLength: 1 },
      { ...routineAircraft, fuelState: 'Low', conflictSeverity: 'Warning' },
      0,
      50,
    );
    const values = Object.fromEntries(
      score.contributions.map((contribution) => [contribution.label, contribution.value]),
    );
    expect(values.Crosswind).toBe(-runwayWeights.maximumCrosswindPenalty);
    expect(values['Fuel urgency']).toBe(runwayWeights.lowFuel);
    expect(values['Conflict urgency']).toBe(runwayWeights.warningConflict);
  });

  it('caps the headwind reward and clamps late-arrival urgency to zero', () => {
    const score = scoreRunway(
      { id: 'SIM-09', headingDeg: 90, available: true, queueLength: 0 },
      { ...routineAircraft, estimatedArrivalMinutes: 30 },
      90,
      50,
    );
    const values = Object.fromEntries(
      score.contributions.map((contribution) => [contribution.label, contribution.value]),
    );
    expect(values['Headwind suitability']).toBe(runwayWeights.maximumHeadwindReward);
    expect(values['Arrival urgency']).toBe(0);
  });

  it('chooses the highest valid score and breaks exact ties by runway id', () => {
    const recommendation = recommendRunway(
      routineAircraft,
      [
        { id: 'SIM-27', headingDeg: 90, available: true, queueLength: 0 },
        { id: 'SIM-09', headingDeg: 90, available: true, queueLength: 0 },
      ],
      90,
      5,
    );
    expect(recommendation.suggestedRunwayId).toBe('SIM-09');
    expect(recommendation.explanation.result).toBe('Suggested runway SIM-09');
  });

  it('reports no recommendation when every runway is unavailable', () => {
    const recommendation = recommendRunway(
      routineAircraft,
      [
        { id: 'SIM-27', headingDeg: 270, available: false, queueLength: 0 },
        { id: 'SIM-09', headingDeg: 90, available: false, queueLength: 0 },
      ],
      90,
      5,
    );
    expect(recommendation.suggestedRunwayId).toBeNull();
    expect(recommendation.scores.map((score) => score.runwayId)).toEqual(['SIM-09', 'SIM-27']);
    expect(recommendation.explanation.result).toBe('No valid runway recommendation');
  });
});
