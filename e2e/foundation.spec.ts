import { expect, test } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

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
  });
}
