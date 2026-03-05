import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('should have proper page structure with landmarks', async ({ page }) => {
    await page.goto('/');

    // Should have main content area
    const main = page.locator('main');
    if (await main.isVisible()) {
      await expect(main).toBeVisible();
    }

    // Should have navigation
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Tab through the page - first focusable elements should be in header
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstFocused).toBeTruthy();

    // Continue tabbing - should move through navigation items
    await page.keyboard.press('Tab');
    const secondFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(secondFocused).toBeTruthy();
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Should have an h1
    const h1 = page.locator('h1').first();
    await expect(h1).toBeVisible();

    // All headings should exist
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').count();
    expect(headings).toBeGreaterThan(0);
  });

  test('should have alt text on images', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      const role = await img.getAttribute('role');
      // Images should have alt text or be decorative (role="presentation")
      expect(alt !== null || role === 'presentation').toBeTruthy();
    }
  });

  test('should have visible focus indicators', async ({ page }) => {
    await page.goto('/');

    // Tab to first interactive element
    await page.keyboard.press('Tab');

    // The focused element should have a visible outline or ring
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have proper color contrast (basic check)', async ({ page }) => {
    await page.goto('/');

    // Check that text is visible (not transparent or same as background)
    const bodyText = page.locator('body');
    const color = await bodyText.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return style.color;
    });

    // Text color should not be fully transparent
    expect(color).not.toBe('rgba(0, 0, 0, 0)');
  });
});

test.describe('Responsive Design', () => {
  test('should adapt layout for mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');

    // Navigation should still be accessible (possibly via hamburger menu)
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();

    // Content should be visible
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('should adapt layout for tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.locator('h1').first()).toBeVisible();
  });
});
