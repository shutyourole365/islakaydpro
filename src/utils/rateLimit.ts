/**
 * Server-side rate limiting utility for edge functions
 * Uses in-memory store (per-isolate) for Deno Deploy edge functions
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 60_000);

export interface RateLimitConfig {
  /** Max requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check if a request is within rate limits.
 * @param identifier - Unique key (e.g., IP address, user ID, API key)
 * @param config - Rate limit configuration
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || now > entry.resetAt) {
    // First request or window expired
    store.set(identifier, {
      count: 1,
      resetAt: now + config.windowMs,
    });
    return { allowed: true, remaining: config.maxRequests - 1, resetAt: now + config.windowMs };
  }

  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: config.maxRequests - entry.count, resetAt: entry.resetAt };
}

/**
 * Create a rate-limited response with appropriate headers
 */
export function rateLimitResponse(
  result: RateLimitResult,
  corsHeaders: Record<string, string>
): Response | null {
  if (!result.allowed) {
    return new Response(
      JSON.stringify({
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000),
      }),
      {
        status: 429,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          'X-RateLimit-Remaining': String(result.remaining),
          'X-RateLimit-Reset': String(result.resetAt),
        },
      }
    );
  }
  return null;
}

/**
 * Pre-configured rate limit configs for different endpoints
 */
export const RATE_LIMITS = {
  /** AI chat: 20 requests per minute */
  aiChat: { maxRequests: 20, windowMs: 60_000 },
  /** Checkout: 5 requests per minute */
  checkout: { maxRequests: 5, windowMs: 60_000 },
  /** Email sending: 10 requests per minute */
  email: { maxRequests: 10, windowMs: 60_000 },
  /** Webhooks: 100 requests per minute */
  webhook: { maxRequests: 100, windowMs: 60_000 },
  /** General API: 60 requests per minute */
  general: { maxRequests: 60, windowMs: 60_000 },
} as const;
