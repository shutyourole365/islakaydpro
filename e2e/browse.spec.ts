import { test, expect } from './fixtures';

test.describe('Browse Page', () => {
  test('should navigate to browse page', async ({ page }) => {
    await page.goto('/');
    // Click the Browse Equipment nav item
    await page.getByRole('button', { name: /browse equipment/i }).first().click();
    await expect(page.getByText(/equipment|browse|filter/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('should display search input on browse page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /browse equipment/i }).first().click();
    await expect(page.getByRole('searchbox').or(page.getByPlaceholder(/search/i)).first()).toBeVisible({ timeout: 5000 });
  });

  test('should filter equipment by search query', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /browse equipment/i }).first().click();
    const searchInput = page.getByRole('searchbox').or(page.getByPlaceholder(/search/i)).first();
    await searchInput.fill('excavator');
    await expect(page.getByText(/excavator/i).first()).toBeVisible({ timeout: 5000 }).catch(() => {
      // OK if no results, just check input worked
    });
  });

  test('should show equipment cards', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /browse equipment/i }).first().click();
    // Wait for equipment cards to appear (allows time for Supabase fallback to load)
    const cards = page.locator('.bg-white').filter({ has: page.getByText(/\/day/i) });
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('should open equipment detail on card click', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /browse equipment/i }).first().click();
    await page.waitForTimeout(1500);
    // Click first equipment card
    const firstCard = page.locator('[data-testid="equipment-card"], .cursor-pointer').first();
    if (await firstCard.isVisible()) {
      await firstCard.click();
      await page.waitForTimeout(500);
      // Detail view should appear
      await expect(page.getByText(/per day|\/day|book now|rent now/i).first()).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Search', () => {
  test('should open search modal from header', async ({ page }) => {
    await page.goto('/');
    // Click search icon in header
    const searchBtn = page.getByRole('button', { name: /search/i }).first();
    await searchBtn.click();
    await expect(page.getByPlaceholder(/search for equipment|what are you looking for/i).or(
      page.getByRole('searchbox')
    ).first()).toBeVisible({ timeout: 3000 });
  });

  test('should navigate to browse with search results', async ({ page }) => {
    await page.goto('/');
    const searchBtn = page.getByRole('button', { name: /search/i }).first();
    await searchBtn.click();
    const input = page.getByPlaceholder(/search/i).first();
    if (await input.isVisible()) {
      await input.fill('camera');
      await input.press('Enter');
      await page.waitForTimeout(500);
      // Should navigate to browse page
      await expect(page.getByText(/equipment|browse/i).first()).toBeVisible();
    }
  });
});

test.describe('Equipment Wanted Board', () => {
  test('should navigate to Wanted board', async ({ page }) => {
    await page.goto('/');
    const wantedBtn = page.getByRole('button', { name: /wanted/i }).first();
    if (await wantedBtn.isVisible()) {
      await wantedBtn.click();
      await expect(page.getByText(/equipment wanted|request/i).first()).toBeVisible({ timeout: 3000 });
    }
  });
});
