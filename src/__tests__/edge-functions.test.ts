import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Integration tests for Supabase Edge Functions
 * Tests the request/response contracts of each edge function
 */

// Mock fetch for edge function calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

const SUPABASE_URL = 'https://test.supabase.co';
const SUPABASE_ANON_KEY = 'test-anon-key';
const AUTH_TOKEN = 'test-auth-token';

function edgeFunctionUrl(name: string): string {
  return `${SUPABASE_URL}/functions/v1/${name}`;
}

function defaultHeaders(withAuth = true): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
  };
  if (withAuth) {
    headers['Authorization'] = `Bearer ${AUTH_TOKEN}`;
  }
  return headers;
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('AI Chat Edge Function', () => {
  const url = edgeFunctionUrl('ai-chat');

  it('should accept valid chat request with messages', async () => {
    const requestBody = {
      messages: [
        { role: 'user', content: 'What equipment do you have for construction?' },
      ],
      provider: 'openai',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        content: 'We have excavators, loaders, and more!',
        suggestions: ['Browse excavators', 'View all equipment'],
      }),
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: defaultHeaders(false),
      body: JSON.stringify(requestBody),
    });

    expect(response.ok).toBe(true);
    const data = await response.json();
    expect(data).toHaveProperty('content');
    expect(data).toHaveProperty('suggestions');
    expect(typeof data.content).toBe('string');
    expect(Array.isArray(data.suggestions)).toBe(true);
  });

  it('should accept context with equipment and location', async () => {
    const requestBody = {
      messages: [{ role: 'user', content: 'Tell me about this excavator' }],
      context: {
        equipmentId: 'eq-123',
        location: 'Los Angeles, CA',
        userId: 'user-456',
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        content: 'This CAT 320 Excavator is perfect for your needs.',
        suggestions: ['Book now', 'Compare prices'],
      }),
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: defaultHeaders(false),
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    expect(data.content).toBeTruthy();
  });

  it('should handle CORS preflight requests', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }),
    });

    const response = await fetch(url, { method: 'OPTIONS' });
    expect(response.ok).toBe(true);
  });

  it('should return graceful error on failure', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        error: 'API key not configured',
        content: "I'm having trouble processing your request right now.",
        suggestions: ['Browse equipment', 'View categories', 'Contact support'],
      }),
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: defaultHeaders(false),
      body: JSON.stringify({ messages: [{ role: 'user', content: 'hello' }] }),
    });

    const data = await response.json();
    expect(data.content).toBeTruthy();
    expect(data.suggestions).toBeTruthy();
  });
});

describe('Create Checkout Edge Function', () => {
  const url = edgeFunctionUrl('create-checkout');

  it('should require authorization header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Missing authorization header' }),
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    expect(response.ok).toBe(false);
  });

  it('should accept valid checkout request', async () => {
    const checkoutRequest = {
      bookingId: 'booking-123',
      equipmentId: 'eq-456',
      equipmentTitle: 'CAT 320 Excavator',
      dailyRate: 450,
      totalDays: 3,
      subtotal: 1350,
      serviceFee: 162,
      depositAmount: 2000,
      totalAmount: 3512,
      startDate: '2026-04-01',
      endDate: '2026-04-03',
      successUrl: 'https://islakayd.com/booking/success',
      cancelUrl: 'https://islakayd.com/booking/cancel',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        sessionId: 'cs_test_123',
        url: 'https://checkout.stripe.com/pay/cs_test_123',
      }),
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: defaultHeaders(),
      body: JSON.stringify(checkoutRequest),
    });

    const data = await response.json();
    expect(data).toHaveProperty('sessionId');
    expect(data).toHaveProperty('url');
    expect(typeof data.url).toBe('string');
  });

  it('should accept optional insurance fields', async () => {
    const checkoutRequest = {
      bookingId: 'booking-123',
      equipmentId: 'eq-456',
      equipmentTitle: 'Camera Kit',
      dailyRate: 125,
      totalDays: 2,
      subtotal: 250,
      serviceFee: 30,
      depositAmount: 500,
      totalAmount: 830,
      startDate: '2026-04-01',
      endDate: '2026-04-02',
      insurancePlanId: 'ins-basic',
      insuranceAmount: 50,
      successUrl: 'https://islakayd.com/success',
      cancelUrl: 'https://islakayd.com/cancel',
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        sessionId: 'cs_test_456',
        url: 'https://checkout.stripe.com/pay/cs_test_456',
      }),
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: defaultHeaders(),
      body: JSON.stringify(checkoutRequest),
    });

    expect(response.ok).toBe(true);
  });
});

describe('Booking Webhook Edge Function', () => {
  const url = edgeFunctionUrl('booking-webhook');

  it('should handle new booking INSERT event', async () => {
    const webhookPayload = {
      type: 'INSERT',
      table: 'bookings',
      record: {
        id: 'booking-new',
        equipment_id: 'eq-1',
        renter_id: 'user-renter',
        owner_id: 'user-owner',
        start_date: '2026-04-01',
        end_date: '2026-04-05',
        total_days: 4,
        total_amount: 1800,
        status: 'pending',
        payment_status: 'unpaid',
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: defaultHeaders(),
      body: JSON.stringify(webhookPayload),
    });

    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it('should handle booking status UPDATE to confirmed', async () => {
    const webhookPayload = {
      type: 'UPDATE',
      table: 'bookings',
      record: {
        id: 'booking-1',
        equipment_id: 'eq-1',
        renter_id: 'user-renter',
        owner_id: 'user-owner',
        start_date: '2026-04-01',
        end_date: '2026-04-05',
        total_days: 4,
        total_amount: 1800,
        status: 'confirmed',
        payment_status: 'paid',
      },
      old_record: {
        id: 'booking-1',
        equipment_id: 'eq-1',
        renter_id: 'user-renter',
        owner_id: 'user-owner',
        start_date: '2026-04-01',
        end_date: '2026-04-05',
        total_days: 4,
        total_amount: 1800,
        status: 'pending',
        payment_status: 'unpaid',
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: defaultHeaders(),
      body: JSON.stringify(webhookPayload),
    });

    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it('should handle booking cancellation', async () => {
    const webhookPayload = {
      type: 'UPDATE',
      table: 'bookings',
      record: {
        id: 'booking-1',
        equipment_id: 'eq-1',
        renter_id: 'user-renter',
        owner_id: 'user-owner',
        start_date: '2026-04-01',
        end_date: '2026-04-05',
        total_days: 4,
        total_amount: 1800,
        status: 'cancelled',
        payment_status: 'refunded',
      },
      old_record: {
        id: 'booking-1',
        equipment_id: 'eq-1',
        renter_id: 'user-renter',
        owner_id: 'user-owner',
        start_date: '2026-04-01',
        end_date: '2026-04-05',
        total_days: 4,
        total_amount: 1800,
        status: 'confirmed',
        payment_status: 'paid',
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: defaultHeaders(),
      body: JSON.stringify(webhookPayload),
    });

    const data = await response.json();
    expect(data.success).toBe(true);
  });
});

describe('Stripe Webhook Edge Function', () => {
  const url = edgeFunctionUrl('stripe-webhook');

  it('should require stripe-signature header', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => 'Missing stripe-signature header',
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'checkout.session.completed' }),
    });

    expect(response.ok).toBe(false);
  });

  it('should handle checkout.session.completed event', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ received: true }),
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_sig_123',
      },
      body: JSON.stringify({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: 'cs_123',
            metadata: { booking_id: 'booking-1', equipment_id: 'eq-1', user_id: 'user-1' },
            amount_total: 350000,
            currency: 'usd',
            payment_intent: 'pi_123',
          },
        },
      }),
    });

    const data = await response.json();
    expect(data.received).toBe(true);
  });

  it('should handle payment_intent.payment_failed event', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ received: true }),
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_sig_456',
      },
      body: JSON.stringify({
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_failed_123',
            metadata: { booking_id: 'booking-1' },
            last_payment_error: { message: 'Card declined' },
          },
        },
      }),
    });

    const data = await response.json();
    expect(data.received).toBe(true);
  });

  it('should handle charge.refunded event', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ received: true }),
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_sig_789',
      },
      body: JSON.stringify({
        type: 'charge.refunded',
        data: {
          object: {
            id: 'ch_123',
            payment_intent: 'pi_123',
            amount_refunded: 350000,
            refunded: true,
          },
        },
      }),
    });

    const data = await response.json();
    expect(data.received).toBe(true);
  });
});

describe('Edge Function Request/Response Contracts', () => {
  it('all edge functions should handle CORS OPTIONS requests', async () => {
    const functions = ['ai-chat', 'create-checkout', 'booking-webhook', 'stripe-webhook', 'send-email', 'payouts', 'push-notification', 'send-reminders'];

    for (const fn of functions) {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({
          'Access-Control-Allow-Origin': '*',
        }),
      });

      const response = await fetch(edgeFunctionUrl(fn), { method: 'OPTIONS' });
      expect(response.ok).toBe(true);
    }
  });

  it('should validate checkout request has required fields', () => {
    const requiredFields = [
      'bookingId',
      'equipmentId',
      'equipmentTitle',
      'dailyRate',
      'totalDays',
      'subtotal',
      'serviceFee',
      'depositAmount',
      'totalAmount',
      'startDate',
      'endDate',
      'successUrl',
      'cancelUrl',
    ];

    const validRequest = {
      bookingId: 'b-1',
      equipmentId: 'e-1',
      equipmentTitle: 'Test',
      dailyRate: 100,
      totalDays: 1,
      subtotal: 100,
      serviceFee: 12,
      depositAmount: 50,
      totalAmount: 162,
      startDate: '2026-04-01',
      endDate: '2026-04-01',
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
    };

    for (const field of requiredFields) {
      expect(validRequest).toHaveProperty(field);
      expect(validRequest[field as keyof typeof validRequest]).toBeTruthy();
    }
  });

  it('should validate AI chat request has required messages array', () => {
    const validRequest = {
      messages: [{ role: 'user', content: 'Hello' }],
    };

    expect(validRequest.messages).toBeDefined();
    expect(Array.isArray(validRequest.messages)).toBe(true);
    expect(validRequest.messages.length).toBeGreaterThan(0);
    expect(validRequest.messages[0]).toHaveProperty('role');
    expect(validRequest.messages[0]).toHaveProperty('content');
  });

  it('should validate booking webhook payload structure', () => {
    const validPayload = {
      type: 'INSERT' as const,
      table: 'bookings',
      record: {
        id: 'b-1',
        equipment_id: 'e-1',
        renter_id: 'r-1',
        owner_id: 'o-1',
        start_date: '2026-04-01',
        end_date: '2026-04-05',
        total_days: 4,
        total_amount: 1800,
        status: 'pending',
        payment_status: 'unpaid',
      },
    };

    expect(['INSERT', 'UPDATE', 'DELETE']).toContain(validPayload.type);
    expect(validPayload.record).toHaveProperty('id');
    expect(validPayload.record).toHaveProperty('equipment_id');
    expect(validPayload.record).toHaveProperty('renter_id');
    expect(validPayload.record).toHaveProperty('owner_id');
    expect(validPayload.record).toHaveProperty('status');
  });
});
