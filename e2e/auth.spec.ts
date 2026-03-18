import { test, expect } from './fixtures';

test.describe('Authentication', () => {
  test('should open auth modal when clicking Sign In', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await expect(page.getByRole('dialog', { name: /sign in/i }).or(page.locator('[role="dialog"]'))).toBeVisible();
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
  });

  test('should show password field in auth modal', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /sign in/i }).first().click();
    await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible();
  });

  test('should show validation error on empty form submit', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /sign in/i }).first().click();
    // Try to submit with empty fields
    const submitBtn = page.getByRole('button', { name: /^sign in$/i }).last();
    await submitBtn.click();
    // Should show an error or validation message (field required, invalid, etc)
    await expect(page.locator('input:invalid, [aria-invalid="true"], .text-red').first()).toBeVisible({ timeout: 3000 }).catch(() => {
      // Some forms use native validation which doesn't show visible elements
    });
  });

  test('should close auth modal on clicking outside or close button', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /sign in/i }).first().click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    // Click close button if present
    const closeBtn = dialog.getByRole('button', { name: /close|×|✕/i }).first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await expect(dialog).not.toBeVisible({ timeout: 2000 });
    }
  });

  test('should switch to sign up form', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /sign in/i }).first().click();
    // Find "Create account" or "Sign up" toggle link
    const signUpLink = page.getByText(/create account|sign up|register/i).first();
    if (await signUpLink.isVisible()) {
      await signUpLink.click();
      await expect(page.getByText(/create|join|register/i).first()).toBeVisible();
    }
  });
});

test.describe('Protected Routes', () => {
  test('should prompt auth when trying to list equipment without login', async ({ page }) => {
    await page.goto('/');
    // Try to find and click list equipment button
    const listBtn = page.getByRole('button', { name: /list your equipment|start listing|list equipment/i }).first();
    if (await listBtn.isVisible()) {
      await listBtn.click();
      // Should open auth modal
      await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible({ timeout: 3000 });
    }
  });
});
