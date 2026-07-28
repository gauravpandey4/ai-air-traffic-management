import { createContext, type Dispatch, useContext } from 'react';

import type { SimulationAction } from '../domain/simulation';
import type {
  Aircraft,
  DecisionSupport,
  SimulationState,
  SimulationStatistics,
} from '../domain/types';

export type SimulatorContextValue = {
  state: SimulationState;
  aircraft: Aircraft[];
  selectedAircraft: Aircraft;
  statistics: SimulationStatistics;
  decisionSupport: DecisionSupport;
  simulationTimestamp: string;
  dispatch: Dispatch<SimulationAction>;
};

export const SimulatorContext = createContext<SimulatorContextValue | undefined>(undefined);

export function useSimulator(): SimulatorContextValue {
  const value = useContext(SimulatorContext);
  if (value === undefined) {
    throw new Error('useSimulator must be used inside SimulatorProvider.');
  }
  return value;
}
