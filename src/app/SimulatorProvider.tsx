import { type ReactNode, useCallback, useEffect, useMemo, useReducer, useRef } from 'react';

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
import { loadObservedWeather } from '../domain/weather-client';

import { SimulatorContext } from './simulator-context';

export function SimulatorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(simulationReducer, undefined, () =>
    createInitialSimulationState(),
  );
  const weatherRequestIdRef = useRef(0);

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

  useEffect(() => {
    weatherRequestIdRef.current += 1;
  }, [state.scenarioId]);

  const requestObservedWeather = useCallback(async () => {
    const requestId = weatherRequestIdRef.current + 1;
    weatherRequestIdRef.current = requestId;
    dispatch({ type: 'weather-check-requested' });
    if (!navigator.onLine) {
      dispatch({ type: 'weather-fallback', reason: 'Browser is offline.', retryAtIso: null });
      return;
    }
    try {
      const result = await loadObservedWeather({ storage: window.localStorage });
      if (weatherRequestIdRef.current !== requestId) return;
      if (result.kind === 'success') {
        dispatch({ type: 'weather-loaded', snapshot: result.snapshot });
      } else {
        dispatch({
          type: 'weather-fallback',
          reason: result.reason,
          retryAtIso: result.retryAtIso,
        });
      }
    } catch {
      if (weatherRequestIdRef.current === requestId) {
        dispatch({
          type: 'weather-fallback',
          reason: 'Weather storage or network access failed.',
          retryAtIso: null,
        });
      }
    }
  }, []);

  const selectSimulatedWeather = useCallback(() => {
    weatherRequestIdRef.current += 1;
    dispatch({ type: 'weather-simulation-selected' });
  }, []);

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
      requestObservedWeather,
      selectSimulatedWeather,
      dispatch,
    };
  }, [requestObservedWeather, selectSimulatedWeather, state]);

  return <SimulatorContext.Provider value={value}>{children}</SimulatorContext.Provider>;
}
