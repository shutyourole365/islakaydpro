import { test as base, expect } from '@playwright/test';

// Minimal 1x1 transparent PNG for intercepted image requests
const TRANSPARENT_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

// Minimal sample equipment returned for /rest/*/equipment* queries so
// BrowsePage has cards to render (no live Supabase in CI)
const SAMPLE_EQUIPMENT = JSON.stringify([
  {
    id: 'e1', owner_id: 'u1', category_id: null,
    title: 'CAT 320 Excavator', description: 'Heavy duty excavator', brand: 'CAT', model: '320',
    condition: 'excellent', daily_rate: 350, weekly_rate: 2100, monthly_rate: 7500,
    deposit_amount: 500, location: 'Miami, FL', latitude: 25.77, longitude: -80.19,
    images: [], features: [], specifications: {}, availability_status: 'available',
    min_rental_days: 1, max_rental_days: 30, rating: 4.8, total_reviews: 24,
    total_bookings: 48, is_featured: true, is_active: true,
    created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'e2', owner_id: 'u1', category_id: null,
    title: 'Power Drill Set', description: 'Professional power drill', brand: 'DeWalt', model: 'DCD996',
    condition: 'good', daily_rate: 45, weekly_rate: 250, monthly_rate: 800,
    deposit_amount: 100, location: 'Miami, FL', latitude: 25.77, longitude: -80.19,
    images: [], features: [], specifications: {}, availability_status: 'available',
    min_rental_days: 1, max_rental_days: 30, rating: 4.5, total_reviews: 12,
    total_bookings: 30, is_featured: false, is_active: true,
    created_at: '2024-01-01T00:00:00Z', updated_at: '2024-01-01T00:00:00Z',
  },
]);

/**
 * Custom test fixture that intercepts external requests so tests don't
 * depend on network connectivity or slow external services:
 *  - Supabase equipment REST calls → 2 sample items so BrowsePage renders cards
 *  - Other Supabase REST calls → empty array
 *  - Google Fonts/Analytics, Pexels images → minimal stub responses
 *    (prevents page.goto from waiting on slow/blocked external resources)
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    // Intercept Supabase REST API — return sample equipment for equipment queries,
    // empty array for everything else (categories, bookings, profiles, etc.)
    await page.route(/^https?:\/\/[a-z0-9-]+\.supabase\.co\/rest\//, (route) => {
      const url = route.request().url();
      const isEquipmentQuery = /\/equipment(\?|$)/.test(url);
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Content-Range': isEquipmentQuery ? '*/2' : '*/0' },
        body: isEquipmentQuery ? SAMPLE_EQUIPMENT : '[]',
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
