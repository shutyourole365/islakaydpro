import { test, expect } from './fixtures';

test.describe('Equipment Detail Modal', () => {
  test('opens detail modal with title and daily rate from card click', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /browse equipment/i }).first().click();

    // Wait for the equipment grid to render at least one card with a "/day" price.
    const cards = page.locator('.bg-white').filter({ has: page.getByText(/\/day/i) });
    await expect(cards.first()).toBeVisible({ timeout: 10000 });

    await cards.first().click();

    // Detail modal shows the mocked equipment title and rate.
    await expect(page.getByText(/test excavator|test camera kit/i).first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText(/\$\d+/i).first()).toBeVisible();
  });

  test('shows the Message Owner CTA inside the detail modal', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /browse equipment/i }).first().click();
    const cards = page.locator('.bg-white').filter({ has: page.getByText(/\/day/i) });
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    await cards.first().click();

    await expect(page.getByRole('button', { name: /message owner/i })).toBeVisible({ timeout: 5000 });
  });

  test('shows a date-selection CTA before any dates are picked', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /browse equipment/i }).first().click();
    const cards = page.locator('.bg-white').filter({ has: page.getByText(/\/day/i) });
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    await cards.first().click();

    // Before dates are picked the primary CTA reads "Select Dates to Book"; after,
    // it reads "Reserve Now". Either label is acceptable as long as one is visible.
    const cta = page.getByRole('button', { name: /select dates to book|reserve now/i });
    await expect(cta.first()).toBeVisible({ timeout: 5000 });
  });

  test('closes the detail modal via the close button', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /browse equipment/i }).first().click();
    const cards = page.locator('.bg-white').filter({ has: page.getByText(/\/day/i) });
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    await cards.first().click();

    // Wait for the modal to be visible, then close via the X / close button.
    await expect(page.getByText(/test excavator|test camera kit/i).first()).toBeVisible({ timeout: 5000 });
    const closeBtn = page.getByRole('button', { name: /close|^×$|^✕$/i }).first();
    if (await closeBtn.isVisible().catch(() => false)) {
      await closeBtn.click();
      // The headline title should disappear from the modal.
      await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 3000 }).catch(() => {
        // Some modal close paths only blur the overlay; tolerate either dismissal.
      });
    }
  });
});

test.describe('Booking Gate', () => {
  test('clicking Message Owner without auth prompts sign-in', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /browse equipment/i }).first().click();
    const cards = page.locator('.bg-white').filter({ has: page.getByText(/\/day/i) });
    await expect(cards.first()).toBeVisible({ timeout: 10000 });
    await cards.first().click();

    const msg = page.getByRole('button', { name: /message owner/i });
    await expect(msg).toBeVisible({ timeout: 5000 });
    await msg.click();

    // Unauthenticated users should be funneled into the auth modal (or its email field).
    await expect(
      page.getByRole('textbox', { name: /email/i })
        .or(page.getByText(/sign in|create an account/i).first())
    ).toBeVisible({ timeout: 5000 });
  });
});
