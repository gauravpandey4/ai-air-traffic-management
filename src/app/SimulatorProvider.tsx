import { type ReactNode, useEffect, useMemo, useReducer } from 'react';

import {
  createInitialSimulationState,
  deriveSimulationStatistics,
  getSelectedAircraft,
  getSimulationTimestamp,
  simulationReducer,
} from '../domain/simulation';
import {
  decorateAircraftForDecisionSupport,
  deriveDecisionSupport,
} from '../domain/decision-support';

import { SimulatorContext } from './simulator-context';

export function SimulatorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(simulationReducer, undefined, () =>
    createInitialSimulationState(),
  );

  useEffect(() => {
    if (!state.isPlaying) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      dispatch({ type: 'simulation-ticked', seconds: state.playbackRate });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [state.isPlaying, state.playbackRate]);

  const value = useMemo(() => {
    const decisionSupport = deriveDecisionSupport(state);
    const aircraft = decorateAircraftForDecisionSupport(state.aircraft, decisionSupport);
    const selectedAircraft =
      aircraft.find((item) => item.id === state.selectedAircraftId) ?? getSelectedAircraft(state);
    return {
      state,
      aircraft,
      selectedAircraft,
      statistics: deriveSimulationStatistics(aircraft, decisionSupport.fuelByAircraftId),
      decisionSupport,
      simulationTimestamp: getSimulationTimestamp(state),
      dispatch,
    };
  }, [state]);

  return <SimulatorContext.Provider value={value}>{children}</SimulatorContext.Provider>;
}
