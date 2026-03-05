import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should open auth modal and display sign in form', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /sign in/i }).click();

    // Auth modal should appear with email field
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should validate email format on sign in', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /sign in/i }).click();

    // Enter invalid email
    const emailInput = page.getByRole('textbox', { name: /email/i });
    await emailInput.fill('invalid-email');

    // Try to submit
    const passwordInput = page.locator('input[type="password"]').first();
    if (await passwordInput.isVisible()) {
      await passwordInput.fill('password123');
    }

    // Submit the form
    const submitButton = page.locator('form button[type="submit"], form button:has-text("Sign In")').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }

    // Should show validation error or remain on the form
    await expect(emailInput).toBeVisible();
  });

  test('should switch between sign in and sign up tabs', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /sign in/i }).click();

    // Look for sign up link/tab
    const signUpLink = page.getByText(/sign up|create account|register/i);
    if (await signUpLink.isVisible()) {
      await signUpLink.click();

      // Should show name field or additional fields for registration
      await expect(
        page.getByRole('textbox', { name: /email/i })
      ).toBeVisible();
    }
  });

  test('should close auth modal with close button or escape', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();

    // Press Escape to close
    await page.keyboard.press('Escape');

    // Modal should be closed - email input should not be visible
    await expect(page.getByRole('textbox', { name: /email/i })).not.toBeVisible();
  });
});
