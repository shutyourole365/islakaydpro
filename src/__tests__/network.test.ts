import { describe, it, expect, vi } from 'vitest';
import {
  withRetry,
  RateLimiter,
  RequestDeduplicator,
  CircuitBreaker,
  CacheWithTTL,
} from '../utils/network';

describe('Network Utilities', () => {
  describe('withRetry', () => {
    it('should return result on success', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const result = await withRetry(fn);
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      const fn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValue('success');

      const result = await withRetry(fn, { 
        maxRetries: 3, 
        baseDelay: 10, // Use small delay for tests
        retryOn: () => true 
      });
      
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should throw after max retries', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('persistent error'));

      await expect(withRetry(fn, { 
        maxRetries: 2, 
        baseDelay: 10,
        retryOn: () => true 
      })).rejects.toThrow('persistent error');
      
      expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
    });

    it('should not retry if retryOn returns false', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('do not retry'));

      await expect(withRetry(fn, { 
        maxRetries: 2, 
        retryOn: () => false 
      })).rejects.toThrow('do not retry');
      
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('RateLimiter', () => {
    it('should allow requests within limit', async () => {
      const limiter = new RateLimiter({ maxRequests: 3, windowMs: 1000 });
      
      await limiter.acquire();
      await limiter.acquire();
      await limiter.acquire();
      
      // All should succeed immediately
      expect(true).toBe(true);
    });

    it('should wrap functions with rate limiting', async () => {
      const limiter = new RateLimiter({ maxRequests: 2, windowMs: 1000 });
      const fn = vi.fn().mockResolvedValue('result');
      const wrapped = limiter.wrap(fn);

      await wrapped();
      await wrapped();

      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('RequestDeduplicator', () => {
    it('should deduplicate concurrent requests', async () => {
      const deduplicator = new RequestDeduplicator();
      const fn = vi.fn().mockResolvedValue('result');

      const promise1 = deduplicator.dedupe('key1', fn);
      const promise2 = deduplicator.dedupe('key1', fn);

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toBe('result');
      expect(result2).toBe('result');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should not deduplicate different keys', async () => {
      const deduplicator = new RequestDeduplicator();
      const fn = vi.fn().mockResolvedValue('result');

      await deduplicator.dedupe('key1', fn);
      await deduplicator.dedupe('key2', fn);

      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('CircuitBreaker', () => {
    it('should be closed initially', () => {
      const breaker = new CircuitBreaker();
      expect(breaker.getState()).toBe('closed');
    });

    it('should open after threshold failures', async () => {
      const breaker = new CircuitBreaker(3, 1000);
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      for (let i = 0; i < 3; i++) {
        await breaker.execute(fn).catch(() => {});
      }

      expect(breaker.getState()).toBe('open');
    });

    it('should reject immediately when open', async () => {
      const breaker = new CircuitBreaker(1, 1000);
      const fn = vi.fn().mockRejectedValue(new Error('fail'));

      await breaker.execute(fn).catch(() => {});
      expect(breaker.getState()).toBe('open');

      await expect(breaker.execute(fn)).rejects.toThrow('Circuit breaker is open');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should reset on success', async () => {
      const breaker = new CircuitBreaker(2, 1000);
      const failFn = vi.fn().mockRejectedValue(new Error('fail'));
      const successFn = vi.fn().mockResolvedValue('success');

      await breaker.execute(failFn).catch(() => {});
      await breaker.execute(successFn);

      expect(breaker.getState()).toBe('closed');
    });
  });

  describe('CacheWithTTL', () => {
    it('should store and retrieve values', () => {
      const cache = new CacheWithTTL();
      cache.set('key', 'value');
      expect(cache.get('key')).toBe('value');
    });

    it('should expire values after TTL', async () => {
      const cache = new CacheWithTTL(50); // 50ms TTL
      cache.set('key', 'value');

      expect(cache.get('key')).toBe('value');

      // Wait for expiry
      await new Promise(resolve => setTimeout(resolve, 60));

      expect(cache.get('key')).toBeUndefined();
    });

    it('should use getOrSet for lazy loading', async () => {
      const cache = new CacheWithTTL();
      const factory = vi.fn().mockResolvedValue('computed');

      const result1 = await cache.getOrSet('key', factory);
      const result2 = await cache.getOrSet('key', factory);

      expect(result1).toBe('computed');
      expect(result2).toBe('computed');
      expect(factory).toHaveBeenCalledTimes(1);
    });

    it('should clear cache', () => {
      const cache = new CacheWithTTL();
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      cache.clear();

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
    });

    it('should delete specific keys', () => {
      const cache = new CacheWithTTL();
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      cache.delete('key1');

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBe('value2');
    });
  });
});