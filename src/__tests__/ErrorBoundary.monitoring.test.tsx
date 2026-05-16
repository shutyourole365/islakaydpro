import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';

// Regression coverage for the wiring fix: ErrorBoundary.componentDidCatch
// must forward caught errors to errorMonitoring.captureException so that
// production errors reach Sentry. Previously the integration was a dead
// commented-out window.Sentry reference, meaning React render errors
// vanished into console.error and never made it to alerting.
//
// If anyone removes the errorMonitoring.captureException call (or renames
// the method/source key), this test fails immediately.

const { captureExceptionMock } = vi.hoisted(() => ({
  captureExceptionMock: vi.fn(),
}));

vi.mock('../services/errorMonitoring', () => ({
  errorMonitoring: {
    captureException: captureExceptionMock,
    setUser: vi.fn(),
    clearUser: vi.fn(),
    initialize: vi.fn(),
    captureMessage: vi.fn(),
  },
}));

// Import AFTER the mock so the ErrorBoundary picks up the mocked module.
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

function Bomb(): never {
  throw new Error('boundary-regression');
}

describe('ErrorBoundary -> errorMonitoring wiring', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    captureExceptionMock.mockClear();
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('forwards caught errors to errorMonitoring.captureException', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );

    expect(captureExceptionMock).toHaveBeenCalledTimes(1);
    const [err, context] = captureExceptionMock.mock.calls[0];
    expect(err).toBeInstanceOf(Error);
    expect((err as Error).message).toBe('boundary-regression');
    // Context must be nested under a single key so Sentry.setContext(key, value)
    // receives an object value — the API rejects primitive values.
    expect(context).toEqual(
      expect.objectContaining({
        errorBoundary: expect.objectContaining({
          source: 'ErrorBoundary',
          componentStack: expect.any(String),
        }),
      })
    );
  });

  it('does not call errorMonitoring when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <div>ok</div>
      </ErrorBoundary>
    );
    expect(captureExceptionMock).not.toHaveBeenCalled();
  });
});
