import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createCheckoutSession, createConnectAccount } from '../services/payments';
import type { Booking, Equipment } from '../types';

// Regression coverage for the Stripe URL contracts fixed in:
//   - 2e7a8a5 (booking success/cancel URLs must match App.tsx query handler)
//   - f266f7c (Connect return URL must include ?tab=payments&connect=success)
//
// The defaults below MUST stay in sync with the query-param handler in
// src/App.tsx (the useEffect that reads booking= / connect= / tab=).
// If a future change drops the session_id placeholder, swaps `cancelled`
// for `cancel`, or renames `tab=payments`, these assertions break.

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { access_token: 'test-token' } },
      }),
    },
  },
}));

function makeBooking(overrides: Partial<Booking> = {}): Booking {
  return {
    id: 'b1' as Booking['id'],
    equipment_id: 'e1' as Booking['equipment_id'],
    renter_id: 'r1' as Booking['renter_id'],
    owner_id: 'o1' as Booking['owner_id'],
    start_date: '2026-06-01',
    end_date: '2026-06-03',
    total_days: 2,
    daily_rate: 100,
    subtotal: 200,
    service_fee: 20,
    deposit_amount: 50,
    total_amount: 270,
    status: 'pending',
    payment_status: 'pending',
    notes: null,
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-01T00:00:00Z',
    ...overrides,
  };
}

function makeEquipment(overrides: Partial<Equipment> = {}): Equipment {
  return {
    id: 'e1' as Equipment['id'],
    owner_id: 'o1' as Equipment['owner_id'],
    category_id: null,
    title: 'Test Excavator',
    description: null,
    brand: null,
    model: null,
    condition: 'good',
    daily_rate: 100,
    weekly_rate: null,
    monthly_rate: null,
    deposit_amount: 50,
    location: null,
    latitude: null,
    longitude: null,
    images: [],
    features: [],
    specifications: {},
    availability_status: 'available',
    min_rental_days: 1,
    max_rental_days: 30,
    rating: 0,
    total_reviews: 0,
    total_bookings: 0,
    is_featured: false,
    is_active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function mockFetch(jsonResponse: Record<string, unknown> = { sessionId: 'cs_test', url: 'https://stripe/' }) {
  const fetchSpy = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => jsonResponse,
  });
  vi.stubGlobal('fetch', fetchSpy);
  return fetchSpy;
}

function getLastBody(fetchSpy: ReturnType<typeof vi.fn>): Record<string, unknown> {
  const lastCall = fetchSpy.mock.calls[fetchSpy.mock.calls.length - 1];
  const init = lastCall?.[1] as RequestInit | undefined;
  return JSON.parse(init?.body as string);
}

describe('payments.ts URL regression', () => {
  const origLocation = window.location;

  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { ...origLocation, origin: 'https://islakayd.test' },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    Object.defineProperty(window, 'location', { writable: true, value: origLocation });
  });

  describe('createCheckoutSession default URLs', () => {
    it('builds a successUrl that matches the App.tsx ?booking=success handler', async () => {
      const fetchSpy = mockFetch();
      await createCheckoutSession({ booking: makeBooking(), equipment: makeEquipment() });

      const body = getLastBody(fetchSpy);
      expect(body.successUrl).toBe(
        'https://islakayd.test/?booking=success&session_id={CHECKOUT_SESSION_ID}'
      );
    });

    it('builds a cancelUrl that matches the App.tsx ?booking=cancelled handler', async () => {
      const fetchSpy = mockFetch();
      await createCheckoutSession({ booking: makeBooking(), equipment: makeEquipment() });

      const body = getLastBody(fetchSpy);
      expect(body.cancelUrl).toBe('https://islakayd.test/?booking=cancelled');
    });

    it('keeps the {CHECKOUT_SESSION_ID} placeholder verbatim (Stripe replaces server-side)', async () => {
      const fetchSpy = mockFetch();
      await createCheckoutSession({ booking: makeBooking(), equipment: makeEquipment() });

      const body = getLastBody(fetchSpy);
      expect(String(body.successUrl)).toContain('{CHECKOUT_SESSION_ID}');
      // App.tsx reads ?session_id=… verbatim and feeds it to verifyCheckoutSession,
      // so the param name must stay as `session_id`.
      expect(String(body.successUrl)).toContain('session_id=');
    });

    it('allows caller to override successUrl and cancelUrl', async () => {
      const fetchSpy = mockFetch();
      await createCheckoutSession({
        booking: makeBooking(),
        equipment: makeEquipment(),
        successUrl: 'https://custom.example/done',
        cancelUrl: 'https://custom.example/back',
      });

      const body = getLastBody(fetchSpy);
      expect(body.successUrl).toBe('https://custom.example/done');
      expect(body.cancelUrl).toBe('https://custom.example/back');
    });

    it('posts to the create-checkout edge function with a bearer token', async () => {
      const fetchSpy = mockFetch();
      await createCheckoutSession({ booking: makeBooking(), equipment: makeEquipment() });

      const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/functions/v1/create-checkout');
      const headers = init.headers as Record<string, string>;
      expect(headers.Authorization).toBe('Bearer test-token');
    });
  });

  describe('createConnectAccount default URLs', () => {
    it('builds a returnUrl that matches the App.tsx ?tab=payments&connect=success handler', async () => {
      const fetchSpy = mockFetch({ accountId: 'acct_test', url: 'https://stripe/connect' });
      await createConnectAccount();

      const body = getLastBody(fetchSpy);
      expect(body.returnUrl).toBe('https://islakayd.test/?tab=payments&connect=success');
    });

    it('builds a refreshUrl that matches the App.tsx ?tab=payments&connect=refresh handler', async () => {
      const fetchSpy = mockFetch({ accountId: 'acct_test', url: 'https://stripe/connect' });
      await createConnectAccount();

      const body = getLastBody(fetchSpy);
      expect(body.refreshUrl).toBe('https://islakayd.test/?tab=payments&connect=refresh');
    });

    it('allows caller to override returnUrl and refreshUrl', async () => {
      const fetchSpy = mockFetch({ accountId: 'acct_test', url: 'https://stripe/connect' });
      await createConnectAccount({
        returnUrl: 'https://custom.example/connect/done',
        refreshUrl: 'https://custom.example/connect/retry',
      });

      const body = getLastBody(fetchSpy);
      expect(body.returnUrl).toBe('https://custom.example/connect/done');
      expect(body.refreshUrl).toBe('https://custom.example/connect/retry');
    });

    it('posts to the payouts/create-connect-account edge function', async () => {
      const fetchSpy = mockFetch({ accountId: 'acct_test', url: 'https://stripe/connect' });
      await createConnectAccount();

      const [url] = fetchSpy.mock.calls[0] as [string, RequestInit];
      expect(url).toContain('/functions/v1/payouts/create-connect-account');
    });
  });
});
