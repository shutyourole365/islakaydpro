// Performance monitoring utilities

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

  // Measure time since mark
  measure(name: string): number {
    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`No mark found for: ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.marks.delete(name);
    
    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
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
        console.log('LCP:', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay (FID)
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEntryWithProcessing;
          const fid = fidEntry.processingStart - fidEntry.startTime;
          console.log('FID:', fid);
        });
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift (CLS)
      let clsScore = 0;
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          const clsEntry = entry as LayoutShiftEntry;
          if (!clsEntry.hadRecentInput) {
            clsScore += clsEntry.value;
          }
        });
        console.log('CLS:', clsScore);
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }

  // Report navigation timing
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

      console.table(metrics);
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
