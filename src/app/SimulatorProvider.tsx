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
import { loadAircraftSnapshot } from '../domain/aircraft-snapshot-client';

import { SimulatorContext } from './simulator-context';

export function SimulatorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(simulationReducer, undefined, () =>
    createInitialSimulationState(),
  );
  const weatherRequestIdRef = useRef(0);
  const aircraftRequestIdRef = useRef(0);

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
    aircraftRequestIdRef.current += 1;
  }, [state.scenarioId]);

  useEffect(() => {
    const snapshot = state.externalSnapshot;
    const fetchedAt = snapshot?.fetchedAt;
    if (
      state.aircraftMode !== 'External Active' ||
      snapshot === null ||
      fetchedAt === null ||
      fetchedAt === undefined
    ) {
      return undefined;
    }
    const expiresAt = Date.parse(fetchedAt) + snapshot.freshForMinutes * 60_000 - Date.now();
    if (expiresAt <= 0) {
      dispatch({ type: 'external-snapshot-expired' });
      return undefined;
    }
    const timeout = window.setTimeout(() => {
      dispatch({ type: 'external-snapshot-expired' });
    }, expiresAt);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [state.aircraftMode, state.externalSnapshot]);

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

  const requestExternalAircraft = useCallback(async () => {
    const requestId = aircraftRequestIdRef.current + 1;
    aircraftRequestIdRef.current = requestId;
    dispatch({ type: 'external-check-requested' });
    if (!navigator.onLine) {
      dispatch({
        type: 'external-fallback',
        reason: 'Browser is offline.',
        retryAtIso: null,
      });
      return;
    }
    const result = await loadAircraftSnapshot();
    if (aircraftRequestIdRef.current !== requestId) return;
    if (result.kind === 'success') {
      dispatch({
        type: 'external-loaded',
        snapshot: result.snapshot,
        aircraft: result.aircraft,
      });
    } else {
      dispatch({
        type: 'external-fallback',
        reason: result.reason,
        retryAtIso: result.retryAtIso,
      });
    }
  }, []);

  const selectSimulatedAircraft = useCallback(() => {
    aircraftRequestIdRef.current += 1;
    dispatch({ type: 'external-simulation-selected' });
  }, []);

  const value = useMemo(() => {
    const decisionSupport = deriveDecisionSupport(state);
    const aircraft = decorateAircraftForDecisionSupport(state.aircraft, decisionSupport);
    const selectedAircraft =
      aircraft.find((item) => item.id === state.selectedAircraftId) ??
      getSelectedAircraft({ ...state, aircraft });
    return {
      state,
      aircraft,
      selectedAircraft,
      statistics: deriveSimulationStatistics(aircraft, decisionSupport.fuelByAircraftId),
      decisionSupport,
      simulationTimestamp: getSimulationTimestamp(state),
      requestObservedWeather,
      selectSimulatedWeather,
      requestExternalAircraft,
      selectSimulatedAircraft,
      dispatch,
    };
  }, [
    requestExternalAircraft,
    requestObservedWeather,
    selectSimulatedAircraft,
    selectSimulatedWeather,
    state,
  ]);

  return <SimulatorContext.Provider value={value}>{children}</SimulatorContext.Provider>;
}
