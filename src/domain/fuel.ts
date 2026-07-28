import type { Aircraft, FuelAssessment, FuelState } from './types';

export const fuelThresholds = {
  lowMinutes: 30,
  criticalMinutes: 15,
} as const;

export function classifyFuel(enduranceMinutes: number): FuelState {
  if (enduranceMinutes < fuelThresholds.criticalMinutes) {
    return 'Critical';
  }
  if (enduranceMinutes < fuelThresholds.lowMinutes) {
    return 'Low';
  }
  return 'Normal';
}

export function assessFuel(aircraft: Aircraft, simulationElapsedSeconds: number): FuelAssessment {
  const totalElapsedHours = (aircraft.elapsedFlightMinutes + simulationElapsedSeconds / 60) / 60;
  const remainingFuelKg = Math.max(
    0,
    aircraft.initialFuelKg - aircraft.fuelBurnKgPerHour * totalElapsedHours,
  );
  const enduranceMinutes =
    aircraft.fuelBurnKgPerHour > 0
      ? (remainingFuelKg / aircraft.fuelBurnKgPerHour) * 60
      : Number.POSITIVE_INFINITY;
  const state =
    Number.isFinite(enduranceMinutes) && aircraft.fuelBurnKgPerHour > 0
      ? classifyFuel(enduranceMinutes)
      : 'Unavailable';

  return {
    aircraftId: aircraft.id,
    state,
    remainingFuelKg,
    enduranceMinutes,
    burnKgPerHour: aircraft.fuelBurnKgPerHour,
    explanation: {
      facts: [
        `Initial simulated fuel ${aircraft.initialFuelKg.toFixed(0)} kg`,
        `Estimated burn ${aircraft.fuelBurnKgPerHour.toLocaleString()} kg/h`,
        `Elapsed flight ${(aircraft.elapsedFlightMinutes + simulationElapsedSeconds / 60).toFixed(1)} min`,
        Number.isFinite(enduranceMinutes)
          ? `Estimated endurance ${enduranceMinutes.toFixed(1)} min`
          : 'Estimated endurance unavailable',
      ],
      source: `FutureATC ${aircraft.aircraftCategory.toLowerCase()}-category simulation profile`,
      rule: 'Remaining fuel = initial fuel − estimated burn × elapsed time; Critical <15 min and Low <30 min.',
      result: `${state} simulated fuel`,
      factors: [`Remaining simulated fuel ${remainingFuelKg.toFixed(0)} kg`],
      limitation:
        'Educational estimate only; it is not an aircraft-performance calculation or measured aircraft fuel.',
      humanAction: 'A human controller would verify crew reports and operational fuel data.',
    },
  };
}

export function assessAllFuel(
  aircraft: readonly Aircraft[],
  simulationElapsedSeconds: number,
): Record<string, FuelAssessment> {
  return Object.fromEntries(
    aircraft.map((item) => [item.id, assessFuel(item, simulationElapsedSeconds)]),
  );
}
