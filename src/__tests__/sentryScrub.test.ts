import { describe, it, expect } from 'vitest';
import { scrubPiiFromEvent, scrubString, type MinimalSentryEvent } from '../services/sentryScrub';

const SAMPLE_JWT =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NSIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

describe('scrubString', () => {
  it('redacts JWT-shaped tokens', () => {
    const out = scrubString(`Failed with token=${SAMPLE_JWT} response=...`);
    expect(out).not.toContain('eyJ');
    expect(out).toContain('[REDACTED_JWT]');
  });

  it('redacts email-shaped substrings', () => {
    const out = scrubString('Renter alice@example.com booked equipment');
    expect(out).not.toContain('alice@example.com');
    expect(out).toContain('[REDACTED_EMAIL]');
  });

  it('leaves benign strings untouched', () => {
    const s = 'Failed to fetch /api/equipment for owner abc';
    expect(scrubString(s)).toBe(s);
  });

  it('redacts multiple matches in one string', () => {
    const s = `Mail alice@x.com cc bob@y.io with token ${SAMPLE_JWT}`;
    const out = scrubString(s);
    expect(out.match(/\[REDACTED_EMAIL\]/g)?.length).toBe(2);
    expect(out).toContain('[REDACTED_JWT]');
    expect(out).not.toContain('alice@');
    expect(out).not.toContain('bob@');
  });
});

describe('scrubPiiFromEvent', () => {
  it('drops user.email and user.username, keeps user.id', () => {
    const event: MinimalSentryEvent = {
      user: { id: 'usr_123', email: 'alice@example.com', username: 'alice' },
    };
    const cleaned = scrubPiiFromEvent(event);
    expect(cleaned.user).toEqual({ id: 'usr_123' });
    expect(cleaned.user?.email).toBeUndefined();
    expect(cleaned.user?.username).toBeUndefined();
  });

  it('drops the user object content but keeps it absent of pii when id is missing', () => {
    const event: MinimalSentryEvent = {
      user: { email: 'alice@example.com' },
    };
    const cleaned = scrubPiiFromEvent(event);
    expect(cleaned.user).toEqual({});
  });

  it('scrubs JWTs from exception values', () => {
    const event: MinimalSentryEvent = {
      exception: {
        values: [
          { value: `Request failed: Authorization=Bearer ${SAMPLE_JWT}` },
        ],
      },
    };
    const cleaned = scrubPiiFromEvent(event);
    const value = cleaned.exception?.values?.[0]?.value ?? '';
    expect(value).toContain('[REDACTED_JWT]');
    expect(value).not.toContain('eyJ');
  });

  it('redacts sensitive query params in request.url and breadcrumb urls', () => {
    const event: MinimalSentryEvent = {
      request: {
        url: 'https://api.example.com/auth/v1/token?access_token=abc123&foo=bar',
      },
      breadcrumbs: [
        {
          message: 'fetch',
          data: { url: 'https://api.example.com/rest/v1/equipment?apikey=secret&select=*' },
        },
      ],
    };
    const cleaned = scrubPiiFromEvent(event);
    expect(cleaned.request?.url).toContain('access_token=%5BREDACTED%5D');
    expect(cleaned.request?.url).not.toContain('abc123');
    // keeps non-sensitive params intact
    expect(cleaned.request?.url).toContain('foo=bar');
    const bcUrl = (cleaned.breadcrumbs?.[0]?.data as { url?: string } | undefined)?.url ?? '';
    expect(bcUrl).toContain('apikey=%5BREDACTED%5D');
    expect(bcUrl).not.toContain('secret');
  });

  it('drops Authorization and Cookie headers', () => {
    const event: MinimalSentryEvent = {
      request: {
        headers: {
          Authorization: `Bearer ${SAMPLE_JWT}`,
          Cookie: 'sb-access-token=xxx',
          'Content-Type': 'application/json',
        },
      },
    };
    const cleaned = scrubPiiFromEvent(event);
    const headers = cleaned.request?.headers ?? {};
    expect(headers.Authorization).toBe('[REDACTED]');
    expect(headers.Cookie).toBe('[REDACTED]');
    // non-sensitive header survives untouched
    expect(headers['Content-Type']).toBe('application/json');
  });

  it('drops request.cookies entirely', () => {
    const event: MinimalSentryEvent = {
      request: { cookies: { 'sb-access-token': 'xxx' } },
    };
    const cleaned = scrubPiiFromEvent(event);
    expect(cleaned.request?.cookies).toBeUndefined();
  });

  it('scrubs strings nested inside contexts and extra', () => {
    const event: MinimalSentryEvent = {
      contexts: {
        errorBoundary: {
          source: 'ErrorBoundary',
          note: `Failure for user alice@example.com via token ${SAMPLE_JWT}`,
        },
      },
      extra: { lastRequest: `GET /api?token=${SAMPLE_JWT}` },
    };
    const cleaned = scrubPiiFromEvent(event);
    const noteRaw = (cleaned.contexts?.errorBoundary as { note?: string } | undefined)?.note ?? '';
    expect(noteRaw).toContain('[REDACTED_EMAIL]');
    expect(noteRaw).toContain('[REDACTED_JWT]');
    expect(String(cleaned.extra?.lastRequest ?? '')).toContain('[REDACTED_JWT]');
  });

  it('scrubs strings inside breadcrumb messages and data', () => {
    const event: MinimalSentryEvent = {
      breadcrumbs: [
        { message: `Auth failed for ${SAMPLE_JWT}`, data: { email: 'alice@example.com' } },
      ],
    };
    const cleaned = scrubPiiFromEvent(event);
    const bc = cleaned.breadcrumbs?.[0];
    expect(bc?.message).toContain('[REDACTED_JWT]');
    expect((bc?.data as { email?: string } | undefined)?.email).toContain('[REDACTED_EMAIL]');
  });

  it('does NOT mangle stack frame metadata (file paths, function names)', () => {
    // Stack frames are typically inside event.exception.values[].stacktrace,
    // but for this test we just confirm a representative payload survives.
    const event: MinimalSentryEvent = {
      exception: {
        values: [
          {
            value: 'TypeError: cannot read x',
            stacktrace: {
              frames: [
                {
                  filename: 'src/components/Equipment/Card.tsx',
                  function: 'EquipmentCard.render',
                  lineno: 42,
                  colno: 12,
                },
              ],
            },
          },
        ],
      },
    };
    const cleaned = scrubPiiFromEvent(event) as MinimalSentryEvent;
    const frames = (cleaned.exception?.values?.[0]?.stacktrace as {
      frames: Array<{ filename: string; function: string; lineno: number; colno: number }>;
    }).frames;
    expect(frames[0].filename).toBe('src/components/Equipment/Card.tsx');
    expect(frames[0].function).toBe('EquipmentCard.render');
    expect(frames[0].lineno).toBe(42);
    expect(frames[0].colno).toBe(12);
  });

  it('returns a usable object even when given an empty event', () => {
    expect(scrubPiiFromEvent({} as MinimalSentryEvent)).toEqual({});
  });

  it('handles cyclic structures without leaking the unsanitized original', () => {
    // Build a context where an inner object both contains PII and points
    // back at itself, simulating something a caller might attach via
    // captureException(err, { context: <object-with-self-reference> }).
    type Cyclic = { note: string; self?: Cyclic };
    const inner: Cyclic = { note: 'reach me at alice@example.com' };
    inner.self = inner;
    const event: MinimalSentryEvent = {
      contexts: { weird: inner as unknown as Record<string, unknown> },
    };

    const cleaned = scrubPiiFromEvent(event);
    const out = cleaned.contexts?.weird as { note: string; self?: unknown };
    expect(out.note).toContain('[REDACTED_EMAIL]');
    expect(out.note).not.toContain('alice@example.com');
    // The cycle is preserved by pointing at the SAME cleaned output, not
    // the original (which still holds the PII string).
    expect(out.self).toBe(out);
    expect(out.self).not.toBe(inner);
  });

  it('preserves shared references as the same cleaned reference', () => {
    const shared = { email: 'alice@example.com' };
    const event: MinimalSentryEvent = {
      contexts: {
        a: { user: shared as unknown as Record<string, unknown> },
        b: { user: shared as unknown as Record<string, unknown> },
      },
    };
    const cleaned = scrubPiiFromEvent(event);
    const a = (cleaned.contexts?.a as { user: { email: string } }).user;
    const b = (cleaned.contexts?.b as { user: { email: string } }).user;
    expect(a).toBe(b);
    expect(a.email).toContain('[REDACTED_EMAIL]');
  });
});
