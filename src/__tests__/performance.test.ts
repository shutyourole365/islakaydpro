import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Regression coverage for prod-readiness audit #7: performance.ts
// web-vital observations and slow-operation warnings used to go to
// console.log only — production triage couldn't see them. Now they
// forward to errorMonitoring.captureMessage when they cross Google's
// "poor" thresholds.

const { captureMessageMock } = vi.hoisted(() => ({
  captureMessageMock: vi.fn(),
}));

vi.mock('../services/errorMonitoring', () => ({
  errorMonitoring: {
    captureMessage: captureMessageMock,
    captureException: vi.fn(),
    initialize: vi.fn(),
    setUser: vi.fn(),
    clearUser: vi.fn(),
  },
}));

import { PerformanceMonitor } from '../utils/performance';

// A controllable clock for mark()/measure(). Using mockImplementation
// (not mockReturnValueOnce) keeps the spy active across multiple calls,
// which mark + measure require.
let currentTime = 0;
function setNow(t: number) {
  currentTime = t;
}

describe('PerformanceMonitor → errorMonitoring wiring', () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;
  let logSpy: ReturnType<typeof vi.spyOn>;
  let nowSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    captureMessageMock.mockClear();
    currentTime = 0;
    nowSpy = vi.spyOn(performance, 'now').mockImplementation(() => currentTime);
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    nowSpy.mockRestore();
    warnSpy.mockRestore();
    logSpy.mockRestore();
  });

  describe('measure() slow-operation reporting', () => {
    it('forwards slow (>1000ms) operations to errorMonitoring as warning', () => {
      const monitor = PerformanceMonitor.getInstance();
      // Mark must be > 0 — the pre-existing `if (!startTime)` falsy
      // check in measure() treats 0 as "no mark found". Test against
      // realistic page-uptime values (post-boot).
      setNow(100);
      monitor.mark('slow-op');
      setNow(1600);
      const duration = monitor.measure('slow-op');

      expect(duration).toBe(1500);
      expect(captureMessageMock).toHaveBeenCalledTimes(1);
      const [message, level] = captureMessageMock.mock.calls[0];
      expect(message).toBe('Slow operation: slow-op took 1500.00ms');
      expect(level).toBe('warning');
    });

    it('does NOT forward fast (<=1000ms) operations', () => {
      const monitor = PerformanceMonitor.getInstance();
      setNow(100);
      monitor.mark('fast-op');
      setNow(200);
      const duration = monitor.measure('fast-op');

      expect(duration).toBe(100);
      expect(captureMessageMock).not.toHaveBeenCalled();
    });

    it('handles missing mark without crashing or forwarding', () => {
      const monitor = PerformanceMonitor.getInstance();
      const duration = monitor.measure('never-marked');
      expect(duration).toBe(0);
      expect(captureMessageMock).not.toHaveBeenCalled();
    });

    it('uses exactly 1000ms as the inclusive boundary (no false positive)', () => {
      // Strict > threshold per implementation — equal to 1000 must NOT fire.
      const monitor = PerformanceMonitor.getInstance();
      setNow(50);
      monitor.mark('boundary');
      setNow(1050);
      monitor.measure('boundary');

      expect(captureMessageMock).not.toHaveBeenCalled();
    });

    it('removes the mark after measuring so a second measure() is a no-op', () => {
      const monitor = PerformanceMonitor.getInstance();
      setNow(10);
      monitor.mark('once');
      setNow(2010);
      monitor.measure('once');
      captureMessageMock.mockClear();

      // Second call without re-marking: now treated as missing-mark.
      setNow(3000);
      const second = monitor.measure('once');
      expect(second).toBe(0);
      expect(captureMessageMock).not.toHaveBeenCalled();
    });
  });
});
