import { type ReactNode, useEffect, useMemo, useReducer } from 'react';

import {
  createInitialSimulationState,
  deriveSimulationStatistics,
  getSelectedAircraft,
  getSimulationTimestamp,
  simulationReducer,
} from '../domain/simulation';

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

  const value = useMemo(
    () => ({
      state,
      selectedAircraft: getSelectedAircraft(state),
      statistics: deriveSimulationStatistics(state.aircraft),
      simulationTimestamp: getSimulationTimestamp(state),
      dispatch,
    }),
    [state],
  );

  return <SimulatorContext.Provider value={value}>{children}</SimulatorContext.Provider>;
}
