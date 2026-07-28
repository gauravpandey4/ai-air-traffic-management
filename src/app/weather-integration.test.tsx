import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { delay, http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';

import { createOpenMeteoFixture } from '../test/weather-fixture';

import { App } from './App';

function getSourceSummary(expected: string) {
  return screen.getByText(
    (_content, element) => element?.tagName === 'SPAN' && element.textContent === expected,
  );
}

function createCurrentFixture() {
  const fixture = createOpenMeteoFixture();
  const current = new Date();
  current.setUTCMinutes(0, 0, 0);
  const times = Array.from({ length: 4 }, (_, index) =>
    new Date(current.getTime() + index * 3_600_000).toISOString().slice(0, 16),
  );
  fixture.current.time = times[0] ?? fixture.current.time;
  fixture.hourly.time = times;
  return fixture;
}

const server = setupServer(
  http.get('https://api.open-meteo.com/v1/forecast', () =>
    HttpResponse.json(createCurrentFixture()),
  ),
);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

afterAll(() => {
  server.close();
});

describe('weather provider integration', () => {
  it('shows deterministic provenance and the scenario-seeded severe weather state', async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Weather support' })).toBeVisible();
    expect(screen.getAllByText('Simulated').length).toBeGreaterThan(0);
    expect(
      getSourceSummary('Aircraft: Simulated · Weather: Simulated. Sources are not mixed silently.'),
    ).toHaveTextContent('Aircraft: Simulated · Weather: Simulated.');
    expect(screen.getByText(/Scenario weather time .* deterministic seed snapshot/i)).toBeVisible();
    expect(screen.queryByText(/min old/i)).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Scenario'), 'severe-weather');
    expect(screen.getByText('Severe risk')).toBeVisible();
    expect(screen.getByText(/Gust 42.0 kt ≥ 35 kt/i)).toBeVisible();
  });

  it('loads validated observed weather, attribution, and recomputed runway wind', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Check observed weather' }));

    expect(await screen.findByText('Observed · Open-Meteo')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Weather data by Open-Meteo.com' })).toBeVisible();
    expect(screen.getByText(/min old/i)).toBeVisible();
    expect(
      getSourceSummary('Aircraft: Simulated · Weather: Observed. Sources are not mixed silently.'),
    ).toBeVisible();
    expect(screen.getByText('Candidate wind 80° at 12 kt')).toBeInTheDocument();
  });

  it('uses a clearly labeled simulated fallback when offline', async () => {
    vi.spyOn(window.navigator, 'onLine', 'get').mockReturnValue(false);
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Check observed weather' }));

    expect(screen.getByText('Simulated fallback')).toBeVisible();
    expect(screen.getByText(/Browser is offline. Simulated weather restored/i)).toBeVisible();
  });

  it('rejects invalid provider data without replacing simulated weather', async () => {
    server.use(
      http.get('https://api.open-meteo.com/v1/forecast', () => {
        const fixture = createCurrentFixture();
        fixture.current_units.visibility = 'km';
        return HttpResponse.json(fixture);
      }),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Check observed weather' }));

    expect(
      await screen.findByText(/Invalid weather response. Simulated weather restored/i),
    ).toBeVisible();
    expect(screen.getByText('Simulated fallback')).toBeVisible();
    expect(
      screen.queryByRole('link', { name: 'Weather data by Open-Meteo.com' }),
    ).not.toBeInTheDocument();
  });

  it('ignores a weather response that completes after a scenario change', async () => {
    server.use(
      http.get('https://api.open-meteo.com/v1/forecast', async () => {
        await delay(50);
        return HttpResponse.json(createCurrentFixture());
      }),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Check observed weather' }));
    await user.selectOptions(screen.getByLabelText('Scenario'), 'severe-weather');

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Severe weather' })).toBeVisible();
      expect(screen.getByText('Severe risk')).toBeVisible();
      expect(
        getSourceSummary(
          'Aircraft: Simulated · Weather: Simulated. Sources are not mixed silently.',
        ),
      ).toBeVisible();
    });
  });

  it('honors an explicit simulated-weather selection while a request is pending', async () => {
    server.use(
      http.get('https://api.open-meteo.com/v1/forecast', async () => {
        await delay(50);
        return HttpResponse.json(createCurrentFixture());
      }),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Check observed weather' }));
    await user.click(screen.getByRole('button', { name: 'Use simulated weather' }));

    await waitFor(() => {
      expect(
        getSourceSummary(
          'Aircraft: Simulated · Weather: Simulated. Sources are not mixed silently.',
        ),
      ).toBeVisible();
    });
    await delay(75);
    expect(screen.queryByText('Observed · Open-Meteo')).not.toBeInTheDocument();
  });

  it('recovers when browser storage access throws', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('storage disabled');
    });
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Check observed weather' }));

    expect(
      await screen.findByText(
        /Weather storage or network access failed. Simulated weather restored/i,
      ),
    ).toBeVisible();
  });
});
