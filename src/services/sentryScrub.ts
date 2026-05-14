// PII scrubber for Sentry events. Kept Sentry-agnostic so it can be unit
// tested in isolation: takes a plain `event` object (Sentry-shaped) and
// returns a cleaned copy. Wired into errorMonitoring.initialize's beforeSend.
//
// What gets scrubbed:
//   - user.email and user.username are dropped (keeping user.id for triage)
//   - request.cookies is dropped entirely
//   - Authorization / Cookie / Set-Cookie / X-Api-Key request header VALUES
//     are redacted to "[REDACTED]" (header keys themselves are preserved)
//   - URL query-string values for sensitive param names are redacted
//   - All string values anywhere in the event are passed through a regex
//     replacer that masks JWT-shaped tokens and email-shaped substrings.

const JWT_RE = /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g;
const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

const SENSITIVE_QUERY_KEYS = new Set([
  'access_token',
  'refresh_token',
  'apikey',
  'api_key',
  'key',
  'token',
  'password',
  'auth',
  'authorization',
  'session',
  'jwt',
]);

const SENSITIVE_HEADER_KEYS = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'apikey',
]);

export function scrubString(input: string): string {
  if (!input) return input;
  return input.replace(JWT_RE, '[REDACTED_JWT]').replace(EMAIL_RE, '[REDACTED_EMAIL]');
}

function scrubUrl(url: string): string {
  // Strip query-string values for sensitive params, then run the standard
  // string scrub over the result (catches paths that embed tokens etc.).
  let next = url;
  try {
    // Use URL when possible — it gracefully handles relative vs absolute.
    const isAbsolute = /^[a-z][a-z0-9+.-]*:\/\//i.test(url);
    const parsed = new URL(url, isAbsolute ? undefined : 'http://placeholder.invalid/');
    let changed = false;
    parsed.searchParams.forEach((value, key) => {
      if (SENSITIVE_QUERY_KEYS.has(key.toLowerCase()) && value) {
        parsed.searchParams.set(key, '[REDACTED]');
        changed = true;
      }
    });
    if (changed) {
      next = isAbsolute
        ? parsed.toString()
        : `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    // Fall through and just run the string-level scrub.
  }
  return scrubString(next);
}

function scrubHeaders(
  headers: Record<string, string | string[] | undefined> | undefined
): Record<string, string | string[] | undefined> | undefined {
  if (!headers || typeof headers !== 'object') return headers;
  const out: Record<string, string | string[] | undefined> = {};
  for (const [k, v] of Object.entries(headers)) {
    if (SENSITIVE_HEADER_KEYS.has(k.toLowerCase())) {
      out[k] = '[REDACTED]';
      continue;
    }
    if (typeof v === 'string') out[k] = scrubString(v);
    else if (Array.isArray(v)) out[k] = v.map((s) => (typeof s === 'string' ? scrubString(s) : s));
    else out[k] = v;
  }
  return out;
}

// Recursively walks a value, scrubbing strings. URL-typed keys go through
// scrubUrl; headers-typed parents go through scrubHeaders. Caller must
// supply a fresh WeakMap so each input object resolves to the same cleaned
// output across the traversal — this preserves shared references and
// breaks cycles WITHOUT leaking the original (unsanitized) sub-object
// back into the returned event.
function scrubValue(
  value: unknown,
  keyHint: string | null,
  seen: WeakMap<object, unknown>
): unknown {
  if (value == null) return value;
  if (typeof value === 'string') {
    if (keyHint === 'url' || keyHint === 'request_url' || keyHint === 'href') {
      return scrubUrl(value);
    }
    return scrubString(value);
  }
  if (typeof value !== 'object') return value;

  const cached = seen.get(value as object);
  if (cached !== undefined) return cached;

  if (Array.isArray(value)) {
    const arrOut: unknown[] = [];
    seen.set(value, arrOut);
    for (const item of value) arrOut.push(scrubValue(item, keyHint, seen));
    return arrOut;
  }

  const obj = value as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  seen.set(obj, out);
  for (const [k, v] of Object.entries(obj)) {
    const lower = k.toLowerCase();
    if (lower === 'headers' && v && typeof v === 'object') {
      out[k] = scrubHeaders(v as Record<string, string | string[] | undefined>);
      continue;
    }
    out[k] = scrubValue(v, lower, seen);
  }
  return out;
}

export interface MinimalSentryEvent {
  user?: { id?: string; email?: string; username?: string; ip_address?: string };
  message?: string;
  request?: {
    url?: string;
    headers?: Record<string, string | string[] | undefined>;
    cookies?: Record<string, string> | string;
    data?: unknown;
  };
  breadcrumbs?: Array<{
    message?: string;
    data?: Record<string, unknown>;
    [k: string]: unknown;
  }>;
  contexts?: Record<string, unknown>;
  extra?: Record<string, unknown>;
  tags?: Record<string, unknown>;
  exception?: {
    values?: Array<{
      value?: string;
      stacktrace?: unknown;
      [k: string]: unknown;
    }>;
  };
  [k: string]: unknown;
}

export function scrubPiiFromEvent<T extends MinimalSentryEvent>(event: T): T {
  if (!event || typeof event !== 'object') return event;
  const seen = new WeakMap<object, unknown>();
  const cleaned = scrubValue(event, null, seen) as T;

  // Force-drop user identifiers Sentry doesn't need for triage.
  if (cleaned.user) {
    cleaned.user = {
      ...(cleaned.user.id ? { id: cleaned.user.id } : {}),
    };
  }

  // Drop request.cookies entirely — they're almost always session tokens.
  if (cleaned.request && cleaned.request.cookies !== undefined) {
    cleaned.request = { ...cleaned.request };
    delete cleaned.request.cookies;
  }

  return cleaned;
}
