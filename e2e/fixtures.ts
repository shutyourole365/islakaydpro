import { test as base, expect } from '@playwright/test';

/**
 * Custom test fixture that intercepts Supabase REST API requests so tests
 * don't depend on real network connectivity. Empty responses cause the app
 * to fall back to its built-in sampleEquipment data immediately.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route('**supabase.co/rest/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Content-Range': '*/0' },
        body: '[]',
      });
    });
    await use(page);
  },
});

export { expect };
