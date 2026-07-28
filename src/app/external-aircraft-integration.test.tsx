import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

import { createAvailableAircraftSnapshot } from '../test/aircraft-fixture';
import { createUnavailableAircraftSnapshot } from '../domain/external-aircraft';

import { App } from './App';

function createCurrentSnapshot() {
  const snapshot = createAvailableAircraftSnapshot();
  const now = new Date().toISOString();
  snapshot.generatedAt = now;
  snapshot.fetchedAt = now;
  snapshot.aircraft = snapshot.aircraft.map((aircraft, index) => ({
    ...aircraft,
    observedAtIso: new Date(Date.parse(now) - (index + 1) * 1_000).toISOString(),
  }));
  return snapshot;
}

const server = setupServer(
  http.get('*/data/aircraft-snapshot.json', () => HttpResponse.json(createCurrentSnapshot())),
);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  vi.restoreAllMocks();
});

afterAll(() => {
  server.close();
});

describe('external aircraft mode integration', () => {
  it('atomically replaces simulation with a fresh near-live snapshot and unavailable fields', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getAllByText('SIM-NOR01').length).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Check aircraft snapshot' }));

    expect(await screen.findByText('Near-live aircraft snapshot active.')).toBeVisible();
    expect(screen.getAllByText('IGO123').length).toBeGreaterThan(0);
    expect(screen.queryByText('SIM-NOR01')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Aircraft data by adsb.fi' })).toBeVisible();
    expect(screen.getByText('External · Fresh')).toBeVisible();
    expect(screen.getByText('External aircraft over simulation context')).toBeVisible();
    expect(
      screen.getByText(/aircraft tracks come only from the selected fresh external snapshot/i),
    ).toBeVisible();
    expect(
      screen.getByText(/educational runway context plus any simulated weather context/i),
    ).toBeVisible();
    const fuelDetail = screen.getByText('Fuel state').closest('.detail-item');
    expect(fuelDetail).not.toBeNull();
    expect(within(fuelDetail as HTMLElement).getByText('Unavailable')).toBeVisible();
    expect(screen.getAllByText('Unavailable').length).toBeGreaterThan(2);
    expect(screen.getByRole('button', { name: 'Play' })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: 'Use simulation aircraft' }));
    expect(screen.getAllByText('SIM-NOR01').length).toBeGreaterThan(0);
    expect(screen.queryByText('IGO123')).not.toBeInTheDocument();
  });

  it('keeps simulation during checking and honors explicit simulation selection', async () => {
    server.use(
      http.get('*/data/aircraft-snapshot.json', async () => {
        await delay(50);
        return HttpResponse.json(createCurrentSnapshot());
      }),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Check aircraft snapshot' }));
    expect(screen.getAllByText('SIM-NOR01').length).toBeGreaterThan(0);
    expect(screen.getByText(/simulation remains active/i)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Use simulation aircraft' }));
    await delay(75);

    expect(screen.queryByText('IGO123')).not.toBeInTheDocument();
    expect(screen.getAllByText('SIM-NOR01').length).toBeGreaterThan(0);
  });

  it('restores deterministic simulation when offline', async () => {
    vi.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(false);
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Check aircraft snapshot' }));

    expect(screen.getByText(/Browser is offline. Simulation restored/i)).toBeVisible();
    expect(screen.getAllByText('SIM-NOR01').length).toBeGreaterThan(0);
  });

  it('shows exact workflow retry metadata only when supplied', async () => {
    server.use(
      http.get('*/data/aircraft-snapshot.json', () =>
        HttpResponse.json(
          createUnavailableAircraftSnapshot({
            generatedAtIso: new Date().toISOString(),
            validation: 'rate-limited',
            reason: 'Rate limited.',
            retryAt: '2026-07-28T20:00:00.000Z',
          }),
        ),
      ),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Check aircraft snapshot' }));

    expect(await screen.findByText('Rate limited. Simulation restored.')).toBeVisible();
    expect(screen.getByText(/Retry after/i)).toBeVisible();
  });

  it('presents a valid fresh empty snapshot without crashing', async () => {
    server.use(
      http.get('*/data/aircraft-snapshot.json', () => {
        const snapshot = createCurrentSnapshot();
        snapshot.aircraft = [];
        snapshot.recordCount = 0;
        snapshot.reason = 'Valid fresh regional snapshot; no aircraft were reported.';
        return HttpResponse.json(snapshot);
      }),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Check aircraft snapshot' }));

    expect(await screen.findByText(/valid regional snapshot is empty/i)).toBeVisible();
    expect(screen.getByRole('heading', { name: 'No aircraft in snapshot' })).toBeVisible();
    expect(within(screen.getByRole('table')).getByText(/no aircraft reported/i)).toBeVisible();
  });

  it('rejects a stale static snapshot and preserves simulation', async () => {
    server.use(
      http.get('*/data/aircraft-snapshot.json', () => {
        const snapshot = createAvailableAircraftSnapshot();
        const staleFetchedAt = '2026-01-01T00:00:00.000Z';
        snapshot.generatedAt = staleFetchedAt;
        snapshot.fetchedAt = staleFetchedAt;
        snapshot.aircraft = snapshot.aircraft.map((aircraft, index) => ({
          ...aircraft,
          observedAtIso: new Date(Date.parse(staleFetchedAt) - (index + 1) * 1_000).toISOString(),
        }));
        return HttpResponse.json(snapshot);
      }),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Check aircraft snapshot' }));

    await waitFor(() => {
      expect(screen.getByText(/Snapshot is stale. Simulation restored/i)).toBeVisible();
      expect(screen.getAllByText('SIM-NOR01').length).toBeGreaterThan(0);
    });
  });
});
