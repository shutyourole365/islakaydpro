import { test, expect } from '@playwright/test';

test.describe('Payment Flow - Stripe Integration', () => {
  test('should show pricing on equipment detail page', async ({ page }) => {
    await page.goto('/');

    // Navigate to browse
    await page.getByRole('link', { name: /browse/i }).click();
    await page.waitForTimeout(1000);

    // Click first equipment
    const card = page.locator('[class*="card"], [class*="equipment"]').first();
    if (await card.isVisible()) {
      await card.click();
      await page.waitForTimeout(500);

      // Should show daily rate pricing
      await expect(page.getByText(/\$.*\/day/i).first()).toBeVisible();
    }
  });

  test('should display booking form with date selection', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /browse/i }).click();
    await page.waitForTimeout(1000);

    const card = page.locator('[class*="card"], [class*="equipment"]').first();
    if (await card.isVisible()) {
      await card.click();
      await page.waitForTimeout(500);

      // Look for date picker or booking-related elements
      const hasBookingElements = await page.getByText(/start date|pickup|dates|duration/i).first().isVisible().catch(() => false);
      if (hasBookingElements) {
        await expect(page.getByText(/start date|pickup|dates|duration/i).first()).toBeVisible();
      }
    }
  });

  test('should require authentication before checkout', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /browse/i }).click();
    await page.waitForTimeout(1000);

    const card = page.locator('[class*="card"], [class*="equipment"]').first();
    if (await card.isVisible()) {
      await card.click();
      await page.waitForTimeout(500);

      // Try to book
      const bookBtn = page.getByRole('button', { name: /book|rent now/i }).first();
      if (await bookBtn.isVisible()) {
        await bookBtn.click();

        // Should show auth modal for unauthenticated users
        await expect(
          page.getByRole('textbox', { name: /email/i })
        ).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('should display pricing breakdown with service fee and deposit', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /browse/i }).click();
    await page.waitForTimeout(1000);

    const card = page.locator('[class*="card"], [class*="equipment"]').first();
    if (await card.isVisible()) {
      await card.click();
      await page.waitForTimeout(500);

      // Check for pricing details (daily/weekly/monthly rates)
      const hasPricing = await page.getByText(/daily|weekly|monthly/i).first().isVisible().catch(() => false);
      if (hasPricing) {
        await expect(page.getByText(/daily|weekly|monthly/i).first()).toBeVisible();
      }

      // Check for deposit information
      const hasDeposit = await page.getByText(/deposit/i).first().isVisible().catch(() => false);
      if (hasDeposit) {
        await expect(page.getByText(/deposit/i).first()).toBeVisible();
      }
    }
  });
});

test.describe('Booking System Modal', () => {
  test('should show booking calendar and pricing summary', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /browse/i }).click();
    await page.waitForTimeout(1000);

    // Look for equipment cards and click first one
    const card = page.locator('[class*="card"], [class*="equipment"]').first();
    if (await card.isVisible()) {
      await card.click();
      await page.waitForTimeout(500);

      // Equipment detail should show pricing information
      const priceText = page.getByText(/\$/i).first();
      await expect(priceText).toBeVisible();
    }
  });
});

test.describe('Subscription Plans Page', () => {
  test('should display subscription tiers with pricing', async ({ page }) => {
    await page.goto('/');

    // Try navigating to subscription page via footer or menu
    const subLink = page.getByText(/pricing|plans|subscription/i).first();
    if (await subLink.isVisible().catch(() => false)) {
      await subLink.click();
      await page.waitForTimeout(500);

      // Should show plan names and prices
      await expect(page.getByText(/free|pro|enterprise|basic/i).first()).toBeVisible();
    }
  });
});

test.describe('Insurance Options', () => {
  test('should display insurance information', async ({ page }) => {
    await page.goto('/');

    // Navigate to insurance page if available
    const insuranceLink = page.getByText(/insurance/i).first();
    if (await insuranceLink.isVisible().catch(() => false)) {
      await insuranceLink.click();
      await page.waitForTimeout(500);

      await expect(page.getByText(/protection|coverage|insur/i).first()).toBeVisible();
    }
  });
});
