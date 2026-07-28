import { expect, test } from '@playwright/test';

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
  await expect(page.getByText(/simulated data/i)).toBeVisible();
  await expect(page.getByLabel(/academic safety notice/i)).toBeVisible();
  expect(errors).toEqual([]);
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
  });
}
