import { expect, test } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

function createCurrentWeatherFixture() {
  const current = new Date();
  current.setUTCMinutes(0, 0, 0);
  const times = Array.from({ length: 4 }, (_, index) =>
    new Date(current.getTime() + index * 3_600_000).toISOString().slice(0, 16),
  );
  return {
    latitude: 26.85,
    longitude: 80.95,
    timezone: 'UTC',
    current_units: {
      wind_speed_10m: 'kn',
      wind_gusts_10m: 'kn',
      wind_direction_10m: '°',
      visibility: 'm',
      weather_code: 'wmo code',
    },
    current: {
      time: times[0],
      wind_speed_10m: 12,
      wind_gusts_10m: 18,
      wind_direction_10m: 80,
      visibility: 15_000,
      weather_code: 0,
    },
    hourly_units: {
      wind_speed_10m: 'kn',
      wind_gusts_10m: 'kn',
      wind_direction_10m: '°',
      visibility: 'm',
      precipitation: 'mm',
      weather_code: 'wmo code',
    },
    hourly: {
      time: times,
      wind_speed_10m: [12, 14, 16, 18],
      wind_gusts_10m: [18, 20, 23, 26],
      wind_direction_10m: [80, 85, 90, 95],
      visibility: [15_000, 14_000, 12_000, 7_000],
      precipitation: [0, 0, 0.5, 2.5],
      weather_code: [0, 1, 2, 61],
    },
  };
}

function createCurrentAircraftSnapshot(
  options: {
    empty?: boolean;
    fetchedAtOffsetMs?: number;
  } = {},
) {
  const nowMs = Date.now();
  const fetchedAtMs = nowMs - (options.fetchedAtOffsetMs ?? 0);
  const fetchedAt = new Date(fetchedAtMs).toISOString();
  const aircraft = options.empty
    ? []
    : [
        {
          id: 'external-800001',
          callsign: 'IGO123',
          latitude: 26.8467,
          longitude: 80.8,
          altitudeFt: 12_000,
          groundSpeedKt: 360,
          headingDeg: 90,
          verticalRateFpm: 0,
          observedAtIso: new Date(fetchedAtMs - 1_000).toISOString(),
          status: 'Observed airborne track',
        },
        {
          id: 'external-800002',
          callsign: 'AXB456',
          latitude: 26.8467,
          longitude: 81.09,
          altitudeFt: 12_400,
          groundSpeedKt: 340,
          headingDeg: 270,
          verticalRateFpm: 0,
          observedAtIso: new Date(fetchedAtMs - 2_000).toISOString(),
          status: 'Observed airborne track',
        },
      ];
  return {
    schemaVersion: 1,
    availability: 'available',
    provider: 'adsb.fi',
    endpointClass: 'regional-v3',
    generatedAt: fetchedAt,
    fetchedAt,
    freshForMinutes: 30,
    validation: 'valid',
    recordCount: aircraft.length,
    retryAt: null,
    reason:
      aircraft.length === 0
        ? 'Valid fresh regional snapshot; no aircraft were reported.'
        : 'Valid fresh regional aircraft snapshot.',
    aircraft,
  };
}

test('loads the branded shell under the repository base path', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });

  await page.goto('.');

  await expect(page).toHaveTitle('FutureATC Lab');
  await expect(page.getByRole('heading', { level: 1, name: 'FutureATC Lab' })).toBeVisible();
  await expect(page.getByText('Simulated data', { exact: true })).toBeVisible();
  await expect(page.getByLabel(/academic safety notice/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Normal traffic' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Local schematic' })).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();
  expect(errors).toEqual([]);
});

test('changes scenarios and keeps map, list, and details synchronized', async ({ page }) => {
  await page.goto('.');

  for (const [scenarioId, heading] of [
    ['normal-traffic', 'Normal traffic'],
    ['severe-weather', 'Severe weather'],
    ['collision-risk', 'Collision risk'],
    ['low-fuel', 'Low fuel'],
    ['emergency', 'Emergency'],
  ] as const) {
    await page.getByLabel('Scenario').selectOption(scenarioId);
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
  }

  await page.getByLabel('Scenario').selectOption('emergency');
  await expect(page.getByRole('heading', { name: 'Emergency' })).toBeVisible();
  await expect(page.locator('.aircraft-status')).toHaveText('Declared simulated emergency');

  const flightButtons = page.getByRole('table').getByRole('button');
  const secondCallsign = await flightButtons.nth(1).textContent();
  await flightButtons.nth(1).click();
  await expect(page.getByRole('heading', { name: secondCallsign ?? '' })).toBeVisible();
  await expect(page.locator('.aircraft-marker').nth(1)).toHaveAttribute('aria-pressed', 'true');

  await page.getByLabel('Scenario').selectOption('normal-traffic');
  await page.locator('.aircraft-marker').nth(2).click();
  await expect(page.getByRole('table').getByRole('button').nth(2)).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  const markerStyle = await page.locator('.aircraft-marker').first().getAttribute('style');
  await page.getByRole('button', { name: 'Play' }).click();
  await expect(page.getByRole('button', { name: 'Pause' })).toHaveAttribute('aria-pressed', 'true');
  await expect
    .poll(() => page.locator('.aircraft-marker').first().getAttribute('style'))
    .not.toBe(markerStyle);
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByText('FATC-NORMAL-2401')).toBeVisible();
});

test('restores the local schematic when connected tiles fail', async ({ page }) => {
  await page.route('https://tile.openstreetmap.org/**', (route) => route.abort());
  await page.goto('.');

  await page.getByRole('button', { name: 'Connected' }).click();
  await expect(page.getByRole('heading', { name: 'Local schematic' })).toBeVisible({
    timeout: 10_000,
  });
  await expect(page.getByText(/OpenStreetMap tiles could not be loaded/i)).toBeVisible();
});

test('has no serious accessibility violations and respects keyboard and motion settings', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('.');

  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(
    accessibility.violations.filter(
      (violation) => violation.impact === 'critical' || violation.impact === 'serious',
    ),
  ).toEqual([]);

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to simulator' })).toBeFocused();

  const animationDuration = await page
    .locator('.aircraft-marker')
    .first()
    .evaluate((element) => getComputedStyle(element).animationDuration);
  expect(Number.parseFloat(animationDuration)).toBeLessThanOrEqual(0.00001);
});

test('explains scenario decisions and keeps human review explicitly simulated', async ({
  page,
}) => {
  await page.goto('.');

  await page.getByLabel('Scenario').selectOption('collision-risk');
  const alertCenter = page.getByRole('region', { name: 'Alert center' });
  await expect(
    alertCenter.getByText('Critical projected separation', { exact: true }),
  ).toBeVisible();
  await alertCenter.getByText('Why this result?').click();
  await expect(alertCenter.getByText(/10-minute constant-velocity CPA/i)).toBeVisible();
  await expect(alertCenter.getByText(/Educational simplification/i)).toBeVisible();
  await alertCenter.getByRole('button', { name: 'Acknowledge for review' }).click();
  await expect(
    alertCenter.getByRole('button', { name: 'Acknowledged in simulation' }),
  ).toBeDisabled();

  const humanReview = page.getByRole('region', { name: 'Human review' });
  await humanReview.getByRole('button', { name: 'Confirm simulation' }).click();
  await expect(humanReview.getByText('Confirmed in simulation')).toBeVisible();
  await humanReview.getByRole('button', { name: 'Reject simulation' }).click();
  await expect(humanReview.getByText('Rejected in simulation')).toBeVisible();

  await page.getByLabel('Scenario').selectOption('low-fuel');
  await expect(alertCenter.getByText('Critical simulated fuel', { exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Landing priority' })).toContainText(
    'Critical simulated fuel',
  );

  await page.getByLabel('Scenario').selectOption('emergency');
  const runwayPanel = page.getByRole('region', { name: 'Runway recommendation' });
  await expect(runwayPanel.getByText('Suggested runway SIM-27', { exact: true })).toBeVisible();
  await expect(runwayPanel.locator('.runway-score.is-unavailable')).toContainText(
    'SIM-09Unavailable',
  );
  await humanReview.getByRole('button', { name: 'Clear simulated emergency' }).click();
  await expect(humanReview.getByText('No simulated emergency is active.')).toBeVisible();
  await expect(page.getByText(/Clearance issued/i)).toHaveCount(0);
});

test('validates observed weather, attributes it, and recomputes runway wind', async ({ page }) => {
  await page.route('https://api.open-meteo.com/v1/forecast**', (route) =>
    route.fulfill({ json: createCurrentWeatherFixture() }),
  );
  await page.goto('.');

  const weather = page.getByRole('region', { name: 'Weather support' });
  await weather.getByRole('button', { name: 'Check observed weather' }).click();

  await expect(weather.getByText('Observed · Open-Meteo')).toBeVisible();
  await expect(weather.getByRole('link', { name: 'Weather data by Open-Meteo.com' })).toBeVisible();
  await expect(weather).toContainText('Aircraft: Simulated · Weather: Observed');
  await expect(page.getByText('Candidate wind 80° at 12 kt')).toBeAttached();
});

test('announces offline weather fallback and retains the complete simulator', async ({
  context,
  page,
}) => {
  await page.goto('.');
  await context.setOffline(true);

  const weather = page.getByRole('region', { name: 'Weather support' });
  await weather.getByRole('button', { name: 'Check observed weather' }).click();

  await expect(weather.getByText('Simulated fallback', { exact: true })).toBeVisible();
  await expect(weather.getByText(/Browser is offline. Simulated weather restored/i)).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();
});

test('activates one fresh external dataset with provenance and honest limitations', async ({
  page,
}) => {
  await page.route('**/data/aircraft-snapshot.json', (route) =>
    route.fulfill({ json: createCurrentAircraftSnapshot() }),
  );
  await page.goto('.');

  const aircraftTable = page.getByRole('table');
  await expect(aircraftTable.getByRole('button', { name: 'SIM-NOR01' })).toBeVisible();
  await page.getByRole('button', { name: 'Check aircraft snapshot' }).click();

  await expect(page.getByText('Near-live aircraft snapshot active.')).toBeVisible();
  await expect(aircraftTable.getByRole('button', { name: 'IGO123' })).toBeVisible();
  await expect(aircraftTable.getByRole('button', { name: 'SIM-NOR01' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Aircraft data by adsb.fi' })).toBeVisible();
  await expect(page.getByText('External · Fresh')).toBeVisible();
  await expect(page.locator('.detail-item').filter({ hasText: 'Fuel state' })).toContainText(
    'Unavailable',
  );
  await expect(page.getByRole('button', { name: 'Play' })).toBeDisabled();

  const alertCenter = page.getByRole('region', { name: 'Alert center' });
  await expect(
    alertCenter.getByText('Critical projected separation', { exact: true }),
  ).toBeVisible();
  await alertCenter.getByText('Why this result?').click();
  await expect(alertCenter.getByText(/cannot establish actual collision danger/i)).toBeVisible();

  await page.getByRole('button', { name: 'Use simulation aircraft' }).click();
  await expect(aircraftTable.getByRole('button', { name: 'SIM-NOR01' })).toBeVisible();
  await expect(aircraftTable.getByRole('button', { name: 'IGO123' })).toHaveCount(0);
});

test('handles a fresh empty aircraft snapshot and restores Simulation after expiry', async ({
  page,
}) => {
  await page.route('**/data/aircraft-snapshot.json', (route) =>
    route.fulfill({ json: createCurrentAircraftSnapshot({ empty: true }) }),
  );
  await page.goto('.');
  await page.getByRole('button', { name: 'Check aircraft snapshot' }).click();

  await expect(page.getByText(/valid regional snapshot is empty/i)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'No aircraft in snapshot' })).toBeVisible();
  await expect(page.getByRole('table').getByText(/no aircraft reported/i)).toBeVisible();

  await page.unroute('**/data/aircraft-snapshot.json');
  await page.route('**/data/aircraft-snapshot.json', (route) =>
    route.fulfill({
      json: createCurrentAircraftSnapshot({ fetchedAtOffsetMs: 29 * 60_000 + 59_000 }),
    }),
  );
  await page.getByRole('button', { name: 'Check aircraft snapshot' }).click();
  await expect(page.getByText('Near-live aircraft snapshot active.')).toBeVisible();
  await expect(page.getByText(/snapshot is stale. Simulation restored/i)).toBeVisible({
    timeout: 5_000,
  });
  await expect(page.getByRole('table').getByRole('button', { name: 'SIM-NOR01' })).toBeVisible();
});

for (const viewport of [
  { name: 'desktop', width: 1440, height: 1000 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 },
]) {
  test(`foundation reflows at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('.');

    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('region', { name: 'Runway recommendation' })).toBeVisible();
    const scoreOverflow = await page
      .locator('.runway-score')
      .evaluateAll((cards) => cards.some((card) => card.scrollWidth > card.clientWidth));
    expect(scoreOverflow).toBe(false);
    const weatherOverflow = await page
      .locator('.weather-panel, .forecast-strip article')
      .evaluateAll((items) => items.some((item) => item.scrollWidth > item.clientWidth));
    expect(weatherOverflow).toBe(false);
  });
}
