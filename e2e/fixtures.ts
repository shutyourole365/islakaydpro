import { test as base, expect } from '@playwright/test';

// Minimal 1x1 transparent PNG for intercepted image requests
const TRANSPARENT_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64'
);

const MOCK_EQUIPMENT = [
  {
    id: 'test-eq-1',
    owner_id: 'test-owner-1',
    category_id: 'cat-construction',
    title: 'Test Excavator',
    description: 'A test excavator for E2E tests',
    brand: 'TestBrand',
    model: 'TX-100',
    condition: 'excellent',
    daily_rate: 450,
    weekly_rate: 2800,
    monthly_rate: 9500,
    deposit_amount: 2000,
    location: 'Perth, WA',
    latitude: -31.9505,
    longitude: 115.8605,
    images: [],
    features: ['GPS', 'Climate control'],
    specifications: {},
    availability_status: 'available',
    min_rental_days: 1,
    max_rental_days: 30,
    rating: 4.8,
    total_reviews: 12,
    total_bookings: 24,
    is_featured: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'test-eq-2',
    owner_id: 'test-owner-1',
    category_id: 'cat-cameras',
    title: 'Test Camera Kit',
    description: 'A test camera kit for E2E tests',
    brand: 'TestCam',
    model: 'TC-50',
    condition: 'good',
    daily_rate: 120,
    weekly_rate: 700,
    monthly_rate: 2400,
    deposit_amount: 500,
    location: 'Sydney, NSW',
    latitude: -33.8688,
    longitude: 151.2093,
    images: [],
    features: ['4K video', 'Image stabilization'],
    specifications: {},
    availability_status: 'available',
    min_rental_days: 1,
    max_rental_days: 14,
    rating: 4.5,
    total_reviews: 8,
    total_bookings: 15,
    is_featured: true,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

/**
 * Custom test fixture that intercepts external requests so tests don't
 * depend on network connectivity or slow external services:
 *  - Supabase equipment calls → mock equipment data
 *  - Other Supabase REST calls → empty array
 *  - Google Fonts/Analytics, Pexels images → minimal stub responses
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    // Intercept Supabase REST API — return mock equipment for equipment queries,
    // empty array for everything else
    await page.route(/^https?:\/\/[a-z0-9-]+\.supabase\.co\/rest\//, (route) => {
      const url = route.request().url();
      if (url.includes('/equipment')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: { 'Content-Range': `*/${MOCK_EQUIPMENT.length}` },
          body: JSON.stringify(MOCK_EQUIPMENT),
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: { 'Content-Range': '*/0' },
          body: '[]',
        });
      }
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
