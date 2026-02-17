import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../contexts/ThemeContext';
import { useTheme } from '../hooks/useTheme';



describe('ThemeContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Remove dark class from document
    document.documentElement.classList.remove('dark');
    // Reset media query mock
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  it('should default to system theme', async () => {
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });

    await waitFor(() => {
      expect(result.current.theme).toBe('system');
    });
  });

  it('should set theme to dark when called', async () => {
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });

    act(() => result.current.setTheme('dark'));

    await waitFor(() => {
      expect(result.current.theme).toBe('dark');
      expect(result.current.resolvedTheme).toBe('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  it('should set theme to light when called', async () => {
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });

    act(() => result.current.setTheme('light'));

    await waitFor(() => {
      expect(result.current.theme).toBe('light');
      expect(result.current.resolvedTheme).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  it('should toggle theme between light and dark', async () => {
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });

    // Start with light
    act(() => result.current.setTheme('light'));
    await waitFor(() => {
      expect(result.current.resolvedTheme).toBe('light');
    });

    // Toggle to dark
    act(() => result.current.toggleTheme());
    await waitFor(() => {
      expect(result.current.resolvedTheme).toBe('dark');
    });

    // Toggle back to light
    act(() => result.current.toggleTheme());
    await waitFor(() => {
      expect(result.current.resolvedTheme).toBe('light');
    });
  });

  it('should persist theme to localStorage', async () => {
    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });

    act(() => result.current.setTheme('dark'));

    await waitFor(() => {
      expect(localStorage.getItem('islakayd-theme')).toBe('dark');
    });
  });

  it('should read theme from localStorage on mount', async () => {
    localStorage.setItem('islakayd-theme', 'dark');

    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });

    await waitFor(() => {
      expect(result.current.theme).toBe('dark');
    });
  });

  it('should respect system preference when set to system', async () => {
    // Mock system dark mode preference
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useTheme(), { wrapper: ThemeProvider });

    await waitFor(() => {
      expect(result.current.theme).toBe('system');
      expect(result.current.resolvedTheme).toBe('dark');
    });
  });

  it('should throw error when useTheme is used outside provider', () => {
    // Prevent jsdom from reporting React's internal error event as an uncaught exception
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const errorListener = (e: Event) => e.preventDefault();
    window.addEventListener('error', errorListener);

    try {
      expect(() => renderHook(() => useTheme())).toThrow('useTheme must be used within a ThemeProvider');
    } finally {
      window.removeEventListener('error', errorListener);
      consoleSpy.mockRestore();
    }
  });
});
