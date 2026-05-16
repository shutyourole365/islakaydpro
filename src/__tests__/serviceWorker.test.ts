import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Regression coverage for prod-readiness audit #2: serviceWorker.ts
// catch blocks must forward errors to errorMonitoring.captureException
// instead of silently dropping them on console.error.

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

import {
  registerServiceWorker,
  unregisterServiceWorker,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from '../lib/serviceWorker';

describe('serviceWorker → errorMonitoring wiring', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    captureExceptionMock.mockClear();
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
    vi.restoreAllMocks();
  });

  it('registerServiceWorker forwards register failures to errorMonitoring', async () => {
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        register: vi.fn().mockRejectedValue(new Error('reg-fail')),
      },
    });

    const result = await registerServiceWorker();

    expect(result).toBeNull();
    expect(captureExceptionMock).toHaveBeenCalledTimes(1);
    const [err, context] = captureExceptionMock.mock.calls[0];
    expect((err as Error).message).toBe('reg-fail');
    expect(context).toEqual({ serviceWorker: { scope: 'register' } });
  });

  it('unregisterServiceWorker forwards unregister failures to errorMonitoring', async () => {
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        get ready() {
          return Promise.reject(new Error('unreg-fail'));
        },
      },
    });

    const result = await unregisterServiceWorker();

    expect(result).toBe(false);
    expect(captureExceptionMock).toHaveBeenCalledTimes(1);
    const [err, context] = captureExceptionMock.mock.calls[0];
    expect((err as Error).message).toBe('unreg-fail');
    expect(context).toEqual({ serviceWorker: { scope: 'unregister' } });
  });

  it('subscribeToPushNotifications forwards subscribe failures to errorMonitoring', async () => {
    const fakeRegistration = {
      pushManager: {
        subscribe: vi.fn().mockRejectedValue(new Error('sub-fail')),
      },
    } as unknown as ServiceWorkerRegistration;

    // Minimal VAPID key (length must be padding-friendly)
    const result = await subscribeToPushNotifications(fakeRegistration, 'BPq1234');

    expect(result).toBeNull();
    expect(captureExceptionMock).toHaveBeenCalledTimes(1);
    const [err, context] = captureExceptionMock.mock.calls[0];
    expect((err as Error).message).toBe('sub-fail');
    expect(context).toEqual({ serviceWorker: { scope: 'push_subscribe' } });
  });

  it('unsubscribeFromPushNotifications forwards unsubscribe failures to errorMonitoring', async () => {
    const fakeRegistration = {
      pushManager: {
        getSubscription: vi.fn().mockRejectedValue(new Error('unsub-fail')),
      },
    } as unknown as ServiceWorkerRegistration;

    const result = await unsubscribeFromPushNotifications(fakeRegistration);

    expect(result).toBe(false);
    expect(captureExceptionMock).toHaveBeenCalledTimes(1);
    const [err, context] = captureExceptionMock.mock.calls[0];
    expect((err as Error).message).toBe('unsub-fail');
    expect(context).toEqual({ serviceWorker: { scope: 'push_unsubscribe' } });
  });

  it('wraps non-Error throws into Error before forwarding', async () => {
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        register: vi.fn().mockRejectedValue('string-rejection'),
      },
    });

    await registerServiceWorker();

    expect(captureExceptionMock).toHaveBeenCalledTimes(1);
    const [err] = captureExceptionMock.mock.calls[0];
    expect(err).toBeInstanceOf(Error);
    expect((err as Error).message).toBe('string-rejection');
  });

  it('does NOT call errorMonitoring when there is no error', async () => {
    // Happy-path register sets a 1-hour setInterval inside the SDK to
    // poll for SW updates. Use fake timers so the interval doesn't leak
    // and keep Vitest's process alive between files.
    vi.useFakeTimers();
    try {
      Object.defineProperty(navigator, 'serviceWorker', {
        configurable: true,
        value: {
          register: vi.fn().mockResolvedValue({
            scope: '/',
            installing: null,
            addEventListener: vi.fn(),
            update: vi.fn(),
          }),
        },
      });

      await registerServiceWorker();
      expect(captureExceptionMock).not.toHaveBeenCalled();
    } finally {
      vi.clearAllTimers();
      vi.useRealTimers();
    }
  });
});
