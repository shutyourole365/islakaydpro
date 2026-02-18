import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PWAEnhancedFeatures from '../components/pwa/PWAEnhancedFeatures';

describe('PWAEnhancedFeatures', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock navigator.storage.estimate
    // @ts-ignore - augment navigator for tests
    navigator.storage = {
      estimate: vi.fn().mockResolvedValue({ usage: 10 * 1024 * 1024, quota: 100 * 1024 * 1024 }),
    };

    // Mock localStorage offline items
    localStorage.setItem('offline_equipment', JSON.stringify(new Array(3)));
    localStorage.setItem('offline_favorites', JSON.stringify(new Array(2)));
    localStorage.setItem('offline_messages', JSON.stringify(new Array(5)));

    // Mock caches API
    // @ts-ignore
    global.caches = {
      keys: vi.fn().mockResolvedValue(['cache-v1']),
      delete: vi.fn().mockResolvedValue(true),
    };
  });

  it('renders online state, shows offline data counts and cache size', async () => {
    // Ensure navigator.onLine true
    Object.defineProperty(window.navigator, 'onLine', { value: true, configurable: true });

    render(<PWAEnhancedFeatures onClose={mockOnClose} />);

    expect(screen.getByText(/PWA Features/i)).toBeInTheDocument();

    // Online mode should be visible
    expect(screen.getByText(/Online Mode/i)).toBeInTheDocument();

    // Wait for storage estimate to be read and UI updated
    await waitFor(() => expect(screen.getByText(/3/i)).toBeInTheDocument());

    // Offline data counts (equipment, favorites, messages)
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();

    // Cache size displayed (10 MB -> "10.00 MB cached locally")
    await waitFor(() => expect(screen.getByText(/10\.00 MB cached locally/i)).toBeInTheDocument());
  });

  it('clears cache when Clear Cache is clicked', async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(<PWAEnhancedFeatures onClose={mockOnClose} />);

    // Wait for clear cache button to appear
    const clearBtn = await screen.findByRole('button', { name: /Clear Cache/i });
    await user.click(clearBtn);

    // caches.keys and delete should have been called
    // @ts-ignore
    await waitFor(() => expect(global.caches.keys).toHaveBeenCalled());
    // @ts-ignore
    expect(global.caches.delete).toHaveBeenCalledWith('cache-v1');

    expect(alertSpy).toHaveBeenCalledWith('Cache cleared successfully!');

    alertSpy.mockRestore();
  });

  it('downloads content for offline use (shows alerts)', async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    vi.useFakeTimers();

    render(<PWAEnhancedFeatures onClose={mockOnClose} />);

    const downloadBtn = await screen.findByRole('button', { name: /Download Content/i });
    await user.click(downloadBtn);

    expect(alertSpy).toHaveBeenCalledWith('Downloading content for offline use...');

    // Fast-forward the simulated download timeout
    vi.advanceTimersByTime(2000);

    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('✅ Content downloaded! You can now use Islakayd offline.'));

    vi.useRealTimers();
    alertSpy.mockRestore();
  });

  it('shows offline UI when browser goes offline', async () => {
    render(<PWAEnhancedFeatures onClose={mockOnClose} />);

    // Dispatch offline event
    Object.defineProperty(window.navigator, 'onLine', { value: false, configurable: true });
    window.dispatchEvent(new Event('offline'));

    await waitFor(() => expect(screen.getByText(/Offline Mode/i)).toBeInTheDocument());
  });
});
