/**
 * Network utilities for API calls with retry logic, rate limiting, and request deduplication
 */

interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  retryOn?: (error: Error, attempt: number) => boolean;
}

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

/**
 * Retry a function with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    backoffFactor = 2,
    retryOn = (error) => {
      // Retry on network errors or 5xx server errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) return true;
      if ('status' in error && typeof (error as { status: number }).status === 'number') {
        const status = (error as { status: number }).status;
        return status >= 500 && status < 600;
      }
      return false;
    },
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries || !retryOn(lastError, attempt)) {
        throw lastError;
      }

      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt) + Math.random() * 1000,
        maxDelay
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Rate limiter using token bucket algorithm
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private readonly maxTokens: number;
  private readonly refillRate: number;
  private queue: Array<{
    resolve: () => void;
    reject: (error: Error) => void;
  }> = [];

  constructor(options: RateLimitOptions) {
    this.maxTokens = options.maxRequests;
    this.tokens = options.maxRequests;
    this.lastRefill = Date.now();
    this.refillRate = options.maxRequests / options.windowMs;
  }

  private refillTokens(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;
    const newTokens = elapsed * this.refillRate;
    this.tokens = Math.min(this.maxTokens, this.tokens + newTokens);
    this.lastRefill = now;
  }

  private processQueue(): void {
    while (this.queue.length > 0 && this.tokens >= 1) {
      const request = this.queue.shift();
      if (request) {
        this.tokens--;
        request.resolve();
      }
    }
  }

  async acquire(): Promise<void> {
    this.refillTokens();

    if (this.tokens >= 1) {
      this.tokens--;
      return;
    }

    return new Promise((resolve, reject) => {
      this.queue.push({ resolve, reject });
      
      // Set up periodic check to process queue
      const checkInterval = setInterval(() => {
        this.refillTokens();
        this.processQueue();
        
        if (!this.queue.find(q => q.resolve === resolve)) {
          clearInterval(checkInterval);
        }
      }, 100);

      // Timeout after 30 seconds
      setTimeout(() => {
        const index = this.queue.findIndex(q => q.resolve === resolve);
        if (index !== -1) {
          this.queue.splice(index, 1);
          clearInterval(checkInterval);
          reject(new Error('Rate limit timeout'));
        }
      }, 30000);
    });
  }

  /**
   * Wrap a function with rate limiting
   */
  wrap<T>(fn: () => Promise<T>): () => Promise<T> {
    return async () => {
      await this.acquire();
      return fn();
    };
  }
}

/**
 * Request deduplication - prevent duplicate concurrent requests
 */
export class RequestDeduplicator {
  private pendingRequests = new Map<string, Promise<unknown>>();

  async dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const existing = this.pendingRequests.get(key);
    if (existing) {
      return existing as Promise<T>;
    }

    const promise = fn().finally(() => {
      this.pendingRequests.delete(key);
    });

    this.pendingRequests.set(key, promise);
    return promise;
  }
}

/**
 * Circuit breaker pattern for failing services
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  constructor(
    private readonly failureThreshold = 5,
    private readonly resetTimeout = 30000
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
    }
  }

  getState(): 'closed' | 'open' | 'half-open' {
    return this.state;
  }
}

/**
 * Cache with TTL support
 */
export class CacheWithTTL<T> {
  private cache = new Map<string, { value: T; expiry: number }>();

  constructor(private readonly defaultTTL = 5 * 60 * 1000) {} // 5 minutes default

  set(key: string, value: T, ttl = this.defaultTTL): void {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl,
    });
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;
    
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return undefined;
    }
    
    return entry.value;
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  /**
   * Get or set with async factory function
   */
  async getOrSet(key: string, factory: () => Promise<T>, ttl = this.defaultTTL): Promise<T> {
    const cached = this.get(key);
    if (cached !== undefined) {
      return cached;
    }

    const value = await factory();
    this.set(key, value, ttl);
    return value;
  }
}

/**
 * Combine rate limiting, retry, and caching for API calls
 */
export function createApiClient(options: {
  rateLimit?: RateLimitOptions;
  retry?: RetryOptions;
  cache?: boolean;
  cacheTTL?: number;
}) {
  const rateLimiter = options.rateLimit ? new RateLimiter(options.rateLimit) : null;
  const cache = options.cache ? new CacheWithTTL(options.cacheTTL) : null;
  const deduplicator = new RequestDeduplicator();

  return {
    async request<T>(key: string, fn: () => Promise<T>): Promise<T> {
      // Check cache first
      if (cache) {
        const cached = cache.get(key);
        if (cached !== undefined) {
          return cached as T;
        }
      }

      // Deduplicate concurrent requests
      return deduplicator.dedupe(key, async () => {
        // Apply rate limiting
        if (rateLimiter) {
          await rateLimiter.acquire();
        }

        // Execute with retry
        const result = await withRetry(fn, options.retry);

        // Cache result
        if (cache) {
          cache.set(key, result);
        }

        return result;
      });
    },

    invalidateCache(key: string): void {
      cache?.delete(key);
    },

    clearCache(): void {
      cache?.clear();
    },
  };
}

// Default API client for the application
export const apiClient = createApiClient({
  rateLimit: { maxRequests: 100, windowMs: 60000 }, // 100 requests per minute
  retry: { maxRetries: 3, baseDelay: 1000 },
  cache: true,
  cacheTTL: 30000, // 30 second cache
});
