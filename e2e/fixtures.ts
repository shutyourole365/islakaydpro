import { test as base, expect } from '@playwright/test';

// Minimal 1x1 transparent PNG for intercepted image requests
const TRANSPARENT_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

/**
 * Custom test fixture that intercepts external requests so tests don't
 * depend on network connectivity or slow external services:
 *  - Supabase REST calls → empty array (triggers sampleEquipment fallback)
 *  - Google Fonts/Analytics, Pexels images → minimal stub responses
 *    (prevents page.goto from waiting on slow/blocked external resources)
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    // Intercept Supabase REST API — return empty array so app falls back to sampleEquipment
    await page.route(/^https?:\/\/[a-z0-9-]+\.supabase\.co\/rest\//, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Content-Range': '*/0' },
        body: '[]',
      });
    });

    // Intercept Supabase Auth — return unauthenticated state
    await page.route(/^https?:\/\/[a-z0-9-]+\.supabase\.co\/auth\//, (route) => {
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    // Stub Google Fonts CSS to avoid blocking page load
    await page.route(/^https?:\/\/fonts\.googleapis\.com\//, (route) => {
      route.fulfill({ status: 200, contentType: 'text/css', body: '' });
    });

    // Stub Google Font files
    await page.route(/^https?:\/\/fonts\.gstatic\.com\//, (route) => {
      route.abort();
    });

    // Stub Google Analytics / Tag Manager
    await page.route(/^https?:\/\/(www\.)?googletagmanager\.com\/|^https?:\/\/(www\.)?google-analytics\.com\//, (route) => {
      route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
    });

    // Stub Pexels images with a tiny transparent PNG
    await page.route(/^https?:\/\/[a-z0-9-]+\.pexels\.com\/|^https?:\/\/pexels\.com\//, (route) => {
      route.fulfill({
        status: 200,
        contentType: 'image/png',
        body: TRANSPARENT_PNG,
      });
    });

    await use(page);
  },
});

export { expect };
