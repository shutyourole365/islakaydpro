import { test, expect } from '@playwright/test';

test.describe('Browse Equipment', () => {
  test('should navigate to browse page and show equipment', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: /browse/i }).click();

    // Should display equipment listings
    await expect(page.getByText(/equipment/i)).toBeVisible();
  });

  test('should display equipment cards with key details', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /browse/i }).click();

    // Wait for equipment cards to load (sample data or real)
    await page.waitForTimeout(1000);

    // Should show price information
    await expect(page.getByText(/\$.*\/day/i).first()).toBeVisible();
  });

  test('should click on equipment card to view details', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /browse/i }).click();

    await page.waitForTimeout(1000);

    // Click on first equipment card
    const firstCard = page.locator('[class*="card"], [class*="equipment"]').first();
    if (await firstCard.isVisible()) {
      await firstCard.click();

      // Should show equipment detail view
      await expect(
        page.getByText(/book|rent|reserve/i).first()
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show categories on homepage and filter by category', async ({ page }) => {
    await page.goto('/');

    // Click on a category
    const categoryLink = page.locator('[class*="category"]').first();
    if (await categoryLink.isVisible()) {
      await categoryLink.click();

      // Should navigate to browse with category filter
      await expect(page.getByText(/equipment/i)).toBeVisible();
    }
  });
});

test.describe('Equipment Search', () => {
  test('should open search and find equipment', async ({ page }) => {
    await page.goto('/');

    // Open search
    const searchButton = page.getByRole('button', { name: /search/i });
    await searchButton.click();

    // Type search query
    const searchInput = page.getByPlaceholder(/search for equipment/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('excavator');

    // Should show results or navigate to browse
    await searchInput.press('Enter');
    await expect(page.getByText(/equipment/i)).toBeVisible();
  });
});
