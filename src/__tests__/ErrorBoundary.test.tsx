import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

function Bomb({ message = 'boom' }: { message?: string }): never {
  throw new Error(message);
}

function Safe() {
  return <div data-testid="safe">all good</div>;
}

describe('ErrorBoundary', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('renders children when no error is thrown', () => {
    render(
      <ErrorBoundary>
        <Safe />
      </ErrorBoundary>
    );
    expect(screen.getByTestId('safe')).toBeInTheDocument();
  });

  it('renders default fallback UI on error', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go to homepage/i })).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div data-testid="custom-fallback">custom</div>}>
        <Bomb />
      </ErrorBoundary>
    );
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
  });

  it('logs the caught error to console.error', () => {
    render(
      <ErrorBoundary>
        <Bomb message="testing-error" />
      </ErrorBoundary>
    );
    expect(errorSpy).toHaveBeenCalled();
    const calls = errorSpy.mock.calls.flat().map(String).join(' ');
    expect(calls).toContain('testing-error');
  });

  it('invokes onReset and clears error when Try Again is clicked', () => {
    const onReset = vi.fn();
    render(
      <ErrorBoundary onReset={onReset}>
        <Bomb />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('navigates to homepage when Go to Homepage is clicked', () => {
    // Capture the full original descriptor (incl. configurability/getters)
    // so we can restore it exactly — preserves window.location semantics
    // for subsequent tests under vitest singleFork.
    const originalDescriptor = Object.getOwnPropertyDescriptor(window, 'location');
    const originalLocation = window.location;
    const setHrefMock = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: {
        ...originalLocation,
        get href() {
          return originalLocation.href;
        },
        set href(value: string) {
          setHrefMock(value);
        },
      },
    });

    try {
      render(
        <ErrorBoundary>
          <Bomb />
        </ErrorBoundary>
      );

      fireEvent.click(screen.getByRole('button', { name: /go to homepage/i }));
      expect(setHrefMock).toHaveBeenCalledWith('/');
    } finally {
      if (originalDescriptor) {
        Object.defineProperty(window, 'location', originalDescriptor);
      } else {
        // Fallback: at least put the original object back.
        Object.defineProperty(window, 'location', {
          configurable: true,
          writable: true,
          value: originalLocation,
        });
      }
    }
  });

  it('exposes a contact support mailto link', () => {
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    );
    const link = screen.getByRole('link', { name: /contact support/i });
    expect(link).toHaveAttribute('href', 'mailto:support@islakayd.com');
  });
});
