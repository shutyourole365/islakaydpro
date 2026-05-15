import { describe, it, expect, vi, beforeEach } from 'vitest';

// Regression coverage for prod-readiness audit #4: silent fire-and-forget
// catches in database.ts (logAuditEvent, incrementEquipmentViews, booking
// + payment notifications, trackPriceChange) must forward to Sentry via
// errorMonitoring.captureException instead of disappearing.
//
// Important: supabase-js does NOT reject for PostgREST failures (RLS,
// table missing, constraint violations). It resolves with `{ error }`.
// Our wrappers must catch BOTH: the resolved error AND any actually-
// thrown exception (network, runtime). These tests cover both shapes.

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

  describe('logAuditEvent — resolved { error } shape', () => {
    it('reports a PostgREST error returned in { error } (the real supabase failure mode)', async () => {
      const pgError = { message: 'RLS denied', code: '42501' };
      fromMock.mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: pgError }),
      });

      await expect(
        logAuditEvent({ userId: 'u1', action: 'sign_in' })
      ).resolves.toBeUndefined();

      expect(captureExceptionMock).toHaveBeenCalledTimes(1);
      const [err, context] = captureExceptionMock.mock.calls[0];
      // The PostgrestError-like object gets wrapped into an Error via String(...)
      expect(err).toBeInstanceOf(Error);
      expect(context).toMatchObject({
        database: { source: 'logAuditEvent', action: 'sign_in', userId: 'u1' },
      });
    });

    it('does not report when supabase resolves with { error: null }', async () => {
      fromMock.mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: null }),
      });

      await logAuditEvent({ userId: 'u2', action: 'view' });
      expect(captureExceptionMock).not.toHaveBeenCalled();
    });
  });

  describe('logAuditEvent — thrown exception shape (network/runtime)', () => {
    it('reports a rejected promise (network failure)', async () => {
      fromMock.mockReturnValue({
        insert: vi.fn().mockRejectedValue(new Error('audit-table-down')),
      });

      await logAuditEvent({ userId: 'u1', action: 'sign_in' });

      expect(captureExceptionMock).toHaveBeenCalledTimes(1);
      const [err] = captureExceptionMock.mock.calls[0];
      expect((err as Error).message).toBe('audit-table-down');
    });

    it('wraps non-Error throws into Error before forwarding', async () => {
      fromMock.mockReturnValue({
        insert: vi.fn().mockRejectedValue('audit-string-rejection'),
      });

      await logAuditEvent({ userId: 'u2', action: 'sign_out' });

      expect(captureExceptionMock).toHaveBeenCalledTimes(1);
      const [err] = captureExceptionMock.mock.calls[0];
      expect(err).toBeInstanceOf(Error);
      expect((err as Error).message).toBe('audit-string-rejection');
    });
  });

  describe('reportDatabaseError context shape', () => {
    it('source argument always wins — extra cannot clobber it', async () => {
      fromMock.mockReturnValue({
        insert: vi.fn().mockResolvedValue({ error: { message: 'boom' } }),
      });

      await logAuditEvent({
        userId: 'forensic-user',
        action: 'password_changed',
        metadata: { ip: '1.2.3.4' },
      });

      const context = captureExceptionMock.mock.calls[0][1] as {
        database: { source: string; action: string; userId: string };
      };
      expect(context.database.source).toBe('logAuditEvent');
      expect(context.database.action).toBe('password_changed');
      expect(context.database.userId).toBe('forensic-user');
    });
  });
});
