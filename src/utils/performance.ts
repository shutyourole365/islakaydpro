// Performance monitoring utilities.
//
// Forwards Web Vitals + slow-operation traces to Sentry via
// errorMonitoring.captureMessage so the observations actually reach
// triage. In DEV we keep the verbose console output that engineers
// expect during local work; in PROD we only emit a Sentry message
// when a metric crosses Google's "poor" threshold so we don't flood
// the project with every page-load observation.

import { errorMonitoring } from '../services/errorMonitoring';

// Type definitions for performance entries
interface PerformanceEntryWithProcessing extends PerformanceEntry {
  processingStart: number;
}

interface LayoutShiftEntry extends PerformanceEntry {
  hadRecentInput: boolean;
  value: number;
}

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

// Google's "poor" thresholds — anything worse fires a Sentry warning.
// Sources:
//   LCP > 4000ms  https://web.dev/lcp/
//   FID > 300ms   https://web.dev/fid/
//   CLS > 0.25    https://web.dev/cls/
const POOR = { LCP: 4000, FID: 300, CLS: 0.25 } as const;
const SLOW_OP_MS = 1000;

// CLS is a running total: once it crosses 0.25, every subsequent
// layout-shift would re-fire reportWebVital. Track per-vital reporting
// so each metric only emits ONE Sentry warning per page lifetime.
// Exposed for tests via __resetWebVitalReported.
const reportedVitals: Record<'LCP' | 'FID' | 'CLS', boolean> = {
  LCP: false,
  FID: false,
  CLS: false,
};

/** @internal — test-only helper to reset the per-page dedupe state. */
export function __resetWebVitalReported(): void {
  reportedVitals.LCP = false;
  reportedVitals.FID = false;
  reportedVitals.CLS = false;
}

export function reportWebVital(name: 'LCP' | 'FID' | 'CLS', value: number): void {
  if (import.meta.env.DEV) {
    console.log(`${name}:`, value);
  }
  if (value > POOR[name] && !reportedVitals[name]) {
    reportedVitals[name] = true;
    errorMonitoring.captureMessage(
      `Poor web vital ${name}=${value.toFixed(2)}`,
      'warning'
    );
  }
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private marks: Map<string, number> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Mark the start of an operation
  mark(name: string) {
    this.marks.set(name, performance.now());
  }

  // Measure time since mark. A missing mark is a programmer error, so
  // we still log it (DEV only). A slow operation in PROD gets forwarded
  // to Sentry as a warning so we see it without local repro.
  measure(name: string): number {
    const startTime = this.marks.get(name);
    if (!startTime) {
      if (import.meta.env.DEV) {
        console.warn(`No mark found for: ${name}`);
      }
      return 0;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(name);

    if (duration > SLOW_OP_MS) {
      if (import.meta.env.DEV) {
        console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
      }
      errorMonitoring.captureMessage(
        `Slow operation: ${name} took ${duration.toFixed(2)}ms`,
        'warning'
      );
    }

    return duration;
  }

  // Get Web Vitals
  static getWebVitals() {
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        reportWebVital('LCP', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEntryWithProcessing;
          const fid = fidEntry.processingStart - fidEntry.startTime;
          reportWebVital('FID', fid);
        });
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS) — running total.
      let clsScore = 0;
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          const clsEntry = entry as LayoutShiftEntry;
          if (!clsEntry.hadRecentInput) {
            clsScore += clsEntry.value;
          }
        });
        reportWebVital('CLS', clsScore);
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }

  // Report navigation timing. Returns the metrics so callers can ship
  // them somewhere; DEV gets a console.table for local visibility.
  static reportNavigationTiming() {
    if ('performance' in window && 'timing' in performance) {
      const timing = performance.timing;
      const navigationStart = timing.navigationStart;

      const metrics = {
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        tcp: timing.connectEnd - timing.connectStart,
        ttfb: timing.responseStart - navigationStart,
        download: timing.responseEnd - timing.responseStart,
        domInteractive: timing.domInteractive - navigationStart,
        domComplete: timing.domComplete - navigationStart,
        loadComplete: timing.loadEventEnd - navigationStart,
      };

      if (import.meta.env.DEV) {
        console.table(metrics);
      }
      return metrics;
    }
  }

  // Memory usage (Chrome only)
  static getMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as unknown as { memory: PerformanceMemory }).memory;
      return {
        usedJSHeapSize: (memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
        totalJSHeapSize: (memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
        jsHeapSizeLimit: (memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
      };
    }
    return null;
  }
}

// Export singleton
export const performanceMonitor = PerformanceMonitor.getInstance();

// Initialize Web Vitals monitoring in development
if (import.meta.env.DEV) {
  PerformanceMonitor.getWebVitals();
  window.addEventListener('load', () => {
    setTimeout(() => {
      PerformanceMonitor.reportNavigationTiming();
      console.log('Memory Usage:', PerformanceMonitor.getMemoryUsage());
    }, 0);
  });
}
