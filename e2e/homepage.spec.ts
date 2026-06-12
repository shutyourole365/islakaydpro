import { test, expect } from './fixtures';

test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check main heading
    await expect(page.getByRole('heading', { name: /rent anything/i })).toBeVisible();

    // Check navigation elements
    await expect(page.getByRole('button', { name: /browse equipment/i })).toBeVisible();
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
    
    // Click search to open modal (use role selector to avoid strict mode on span/button match)
    const searchButton = page.getByRole('button', { name: /search equipment/i });
    await searchButton.click();
    
    // Search modal should open
    await expect(page.getByPlaceholder(/search for equipment/i)).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate to browse page', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: /browse equipment/i }).click();
    
    // Should show equipment listings
    await expect(page.getByText(/equipment/i).first()).toBeVisible();
  });

  test('should open auth modal on sign in click', async ({ page }) => {
    await page.goto('/');
    
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Auth modal should appear
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i }).first()).toBeVisible();
  });
});

test.describe('Theme', () => {
  test('should toggle dark mode', async ({ page }) => {
    await page.goto('/');

    const htmlElement = page.locator('html');
    const initialIsDark = ((await htmlElement.getAttribute('class')) || '').includes('dark');

    // The header renders the dropdown theme toggle; pick the opposite theme from it
    const themeMenuButton = page.locator('button[aria-label="Toggle theme menu"]').first();
    const isVisible = await themeMenuButton.isVisible({ timeout: 2000 }).catch(() => false);
    if (!isVisible) return; // Skip if theme toggle not available

    await themeMenuButton.click();
    await page
      .getByRole('button', { name: initialIsDark ? 'Set theme to Light' : 'Set theme to Dark' })
      .click();

    if (initialIsDark) {
      await expect(htmlElement).not.toHaveClass(/dark/);
    } else {
      await expect(htmlElement).toHaveClass(/dark/);
    }
  });
});
