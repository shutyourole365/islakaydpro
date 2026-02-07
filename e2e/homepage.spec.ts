import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check main heading
    await expect(page.getByRole('heading', { name: /rent equipment/i })).toBeVisible();
    
    // Check navigation elements
    await expect(page.getByRole('link', { name: /browse/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should display equipment categories', async ({ page }) => {
    await page.goto('/');
    
    // Categories section should be visible
    await expect(page.getByText(/find equipment by category/i)).toBeVisible();
  });

  test('should display featured equipment', async ({ page }) => {
    await page.goto('/');
    
    // Featured listings section
    await expect(page.getByText(/top-rated equipment near you/i)).toBeVisible();
  });

  test('should have working search button', async ({ page }) => {
    await page.goto('/');
    
    // Click search to open modal
    const searchButton = page.getByRole('button', { name: /search/i });
    await searchButton.click();
    
    // Search modal should open
    await expect(page.getByPlaceholder(/search for equipment/i)).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate to browse page', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('link', { name: /browse/i }).click();
    
    // Should show equipment listings
    await expect(page.getByText(/equipment/i)).toBeVisible();
  });

  test('should open auth modal on sign in click', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Auth modal should appear
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });
});

test.describe('Theme', () => {
  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/');
    
    // Find and click theme toggle
    const themeButton = page.locator('button[aria-label*="theme"], button:has(svg)').first();
    
    // Get initial state
    const htmlElement = page.locator('html');
    const initialClass = await htmlElement.getAttribute('class');
    
    // Toggle theme
    await themeButton.click();
    
    // Class should change
    const newClass = await htmlElement.getAttribute('class');
    expect(newClass).not.toBe(initialClass);
  });
});
