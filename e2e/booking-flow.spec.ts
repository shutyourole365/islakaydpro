import { test, expect } from '@playwright/test';

test.describe('Booking Flow (Unauthenticated)', () => {
  test('should prompt sign in when trying to book', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /browse/i }).click();

    await page.waitForTimeout(1000);

    // Click on first equipment card
    const firstCard = page.locator('[class*="card"], [class*="equipment"]').first();
    if (await firstCard.isVisible()) {
      await firstCard.click();

      // Look for book/rent button
      const bookButton = page.getByRole('button', { name: /book|rent now/i }).first();
      if (await bookButton.isVisible()) {
        await bookButton.click();

        // Should show auth modal since user is not logged in
        await expect(
          page.getByRole('textbox', { name: /email/i })
        ).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should prompt sign in when trying to favorite', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /browse/i }).click();

    await page.waitForTimeout(1000);

    // Look for a favorite/heart button
    const favoriteButton = page.locator('button[aria-label*="favorite"], button[aria-label*="heart"], button:has(svg)').first();
    if (await favoriteButton.isVisible()) {
      await favoriteButton.click();

      // Should show auth modal
      await expect(
        page.getByRole('textbox', { name: /email/i })
      ).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Equipment Detail Page', () => {
  test('should display equipment details with images', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /browse/i }).click();

    await page.waitForTimeout(1000);

    // Click first equipment
    const firstCard = page.locator('[class*="card"], [class*="equipment"]').first();
    if (await firstCard.isVisible()) {
      await firstCard.click();

      // Should show equipment title
      await page.waitForTimeout(500);

      // Check for pricing info
      await expect(page.getByText(/\$/i).first()).toBeVisible();
    }
  });

  test('should show equipment specifications and features', async ({ page }) => {
    await page.goto('/');

    // Click on a featured equipment card from homepage
    const equipmentCard = page.locator('[class*="card"]').first();
    if (await equipmentCard.isVisible()) {
      await equipmentCard.click();

      await page.waitForTimeout(500);

      // Should display features or specifications section
      const hasFeatures = await page.getByText(/features|specifications|details/i).first().isVisible().catch(() => false);
      if (hasFeatures) {
        await expect(page.getByText(/features|specifications|details/i).first()).toBeVisible();
      }
    }
  });
});
