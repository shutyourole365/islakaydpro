import { describe, it, expect, vi, beforeEach } from 'vitest';

// Regression coverage for prod-readiness audit #4: silent fire-and-forget
// catches in database.ts (logAuditEvent, incrementEquipmentViews, booking
// + payment notifications, trackPriceChange) must forward to Sentry via
// errorMonitoring.captureException instead of disappearing.

const { captureExceptionMock } = vi.hoisted(() => ({
  captureExceptionMock: vi.fn(),
}));

vi.mock('../services/errorMonitoring', () => ({
  errorMonitoring: {
    captureException: captureExceptionMock,
    initialize: vi.fn(),
    setUser: vi.fn(),
    clearUser: vi.fn(),
    captureMessage: vi.fn(),
  },
}));

// supabase mock that lets each test set the rpc / from behavior.
const { rpcMock, fromMock } = vi.hoisted(() => ({
  rpcMock: vi.fn(),
  fromMock: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    rpc: rpcMock,
    from: fromMock,
  },
}));

import { logAuditEvent } from '../services/database';

describe('database → errorMonitoring wiring', () => {
  beforeEach(() => {
    captureExceptionMock.mockClear();
    rpcMock.mockReset();
    fromMock.mockReset();
  });

  it('logAuditEvent forwards a thrown insert failure to errorMonitoring', async () => {
    fromMock.mockReturnValue({
      insert: vi.fn().mockRejectedValue(new Error('audit-table-down')),
    });

    // Must not reject — audit-log writes are non-blocking by design.
    await expect(
      logAuditEvent({ userId: 'u1', action: 'sign_in' })
    ).resolves.toBeUndefined();

    expect(captureExceptionMock).toHaveBeenCalledTimes(1);
    const [err, context] = captureExceptionMock.mock.calls[0];
    expect((err as Error).message).toBe('audit-table-down');
    expect(context).toEqual({
      database: {
        source: 'logAuditEvent',
        action: 'sign_in',
        userId: 'u1',
      },
    });
  });

  it('logAuditEvent wraps non-Error throws into Error before forwarding', async () => {
    fromMock.mockReturnValue({
      insert: vi.fn().mockRejectedValue('audit-string-rejection'),
    });

    await logAuditEvent({ userId: 'u2', action: 'sign_out' });

    expect(captureExceptionMock).toHaveBeenCalledTimes(1);
    const [err] = captureExceptionMock.mock.calls[0];
    expect(err).toBeInstanceOf(Error);
    expect((err as Error).message).toBe('audit-string-rejection');
  });

  it('logAuditEvent does NOT call errorMonitoring on success', async () => {
    fromMock.mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: null }),
    });

    await logAuditEvent({ userId: 'u3', action: 'view' });
    expect(captureExceptionMock).not.toHaveBeenCalled();
  });

  it('logAuditEvent attaches the action and userId to context for triage', async () => {
    fromMock.mockReturnValue({
      insert: vi.fn().mockRejectedValue(new Error('boom')),
    });

    await logAuditEvent({
      userId: 'forensic-user',
      action: 'password_changed',
      metadata: { ip: '1.2.3.4' },
    });

    expect(captureExceptionMock).toHaveBeenCalledTimes(1);
    const context = captureExceptionMock.mock.calls[0][1] as {
      database: { source: string; action: string; userId: string };
    };
    expect(context.database.source).toBe('logAuditEvent');
    expect(context.database.action).toBe('password_changed');
    expect(context.database.userId).toBe('forensic-user');
  });
});
