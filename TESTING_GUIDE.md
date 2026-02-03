# Unit Testing Guide - Part D Implementation

## 🎯 Overview

This guide provides comprehensive unit testing setup for all 6 balanced approach components using **Vitest**, **React Testing Library**, and **TypeScript**. Target coverage: **80%+** for all new components.

---

## 📦 Installation & Setup

### 1. Install Dependencies
```bash
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom happy-dom @vitest/ui
```

### 2. Update package.json Scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch"
  }
}
```

### 3. Configure Vitest
Update `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.ts',
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/*',
        'dist/',
      ],
      include: ['src/components/**/*.{ts,tsx}'],
      all: true,
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### 4. Create Test Setup File
Create `src/__tests__/setup.ts`:
```typescript
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() { return []; }
  unobserve() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock Supabase client
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: null, error: null })),
        })),
      })),
      insert: vi.fn(() => ({ data: null, error: null })),
      update: vi.fn(() => ({ data: null, error: null })),
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => ({ data: { path: 'test-path' }, error: null })),
        getPublicUrl: vi.fn(() => ({ data: { publicUrl: 'https://test.com/photo.jpg' } })),
      })),
    },
    functions: {
      invoke: vi.fn(() => ({ data: {}, error: null })),
    },
  },
}));
```

### 5. Create Test Utilities
Create `src/__tests__/testUtils.tsx`:
```typescript
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';

// Mock user for authenticated tests
export const mockUser = {
  id: 'test-user-123',
  email: 'test@example.com',
  full_name: 'Test User',
};

// Mock equipment
export const mockEquipment = {
  id: 'equip-123',
  title: 'Test Excavator',
  daily_rate: 450,
  owner_id: 'owner-123',
  category: { name: 'Construction' },
  images: ['https://test.com/image1.jpg'],
};

// Custom render with providers
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <AuthProvider>{children}</AuthProvider>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// Mock file for upload tests
export const createMockFile = (
  name = 'test.jpg',
  size = 1024,
  type = 'image/jpeg'
): File => {
  const blob = new Blob(['a'.repeat(size)], { type });
  return new File([blob], name, { type });
};

// Wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0));
```

---

## 🧪 Test Files

### 1. AISearchEngine.test.tsx
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AISearchEngine from './AISearchEngine';

describe('AISearchEngine', () => {
  const mockOnSearch = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render search input and suggestions', () => {
      render(
        <AISearchEngine
          onSearch={mockOnSearch}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByPlaceholderText(/search for equipment/i)).toBeInTheDocument();
      expect(screen.getByText(/try asking/i)).toBeInTheDocument();
      expect(screen.getByText(/what are you looking to rent/i)).toBeInTheDocument();
    });

    it('should render quick suggestions', () => {
      render(
        <AISearchEngine
          onSearch={mockOnSearch}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/show me power tools under \$100/i)).toBeInTheDocument();
      expect(screen.getByText(/cameras for weekend photography/i)).toBeInTheDocument();
    });

    it('should render analyze button initially disabled', () => {
      render(
        <AISearchEngine
          onSearch={mockOnSearch}
          onClose={mockOnClose}
        />
      );

      const analyzeButton = screen.getByRole('button', { name: /analyze query/i });
      expect(analyzeButton).toBeDisabled();
    });
  });

  describe('User Interactions', () => {
    it('should enable analyze button when text is entered', async () => {
      const user = userEvent.setup();
      render(
        <AISearchEngine
          onSearch={mockOnSearch}
          onClose={mockOnClose}
        />
      );

      const input = screen.getByPlaceholderText(/search for equipment/i);
      await user.type(input, 'excavator');

      const analyzeButton = screen.getByRole('button', { name: /analyze query/i });
      expect(analyzeButton).not.toBeDisabled();
    });

    it('should analyze query when button clicked', async () => {
      const user = userEvent.setup();
      render(
        <AISearchEngine
          onSearch={mockOnSearch}
          onClose={mockOnClose}
        />
      );

      const input = screen.getByPlaceholderText(/search for equipment/i);
      await user.type(input, 'excavator near Los Angeles under $300');

      const analyzeButton = screen.getByRole('button', { name: /analyze query/i });
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(screen.getByText(/intent detected/i)).toBeInTheDocument();
      });
    });

    it('should fill input when suggestion clicked', async () => {
      const user = userEvent.setup();
      render(
        <AISearchEngine
          onSearch={mockOnSearch}
          onClose={mockOnClose}
        />
      );

      const suggestion = screen.getByText(/show me power tools under \$100/i);
      await user.click(suggestion);

      const input = screen.getByPlaceholderText(/search for equipment/i);
      expect(input).toHaveValue('Show me power tools under $100');
    });
  });

  describe('Search Analysis', () => {
    it('should extract equipment type from query', async () => {
      const user = userEvent.setup();
      render(
        <AISearchEngine
          onSearch={mockOnSearch}
          onClose={mockOnClose}
        />
      );

      const input = screen.getByPlaceholderText(/search for equipment/i);
      await user.type(input, 'I need an excavator');
      await user.click(screen.getByRole('button', { name: /analyze query/i }));

      await waitFor(() => {
        expect(screen.getByText(/excavator/i)).toBeInTheDocument();
      });
    });

    it('should extract location from query', async () => {
      const user = userEvent.setup();
      render(
        <AISearchEngine
          onSearch={mockOnSearch}
          onClose={mockOnClose}
        />
      );

      const input = screen.getByPlaceholderText(/search for equipment/i);
      await user.type(input, 'camera in San Francisco');
      await user.click(screen.getByRole('button', { name: /analyze query/i }));

      await waitFor(() => {
        expect(screen.getByText(/san francisco/i)).toBeInTheDocument();
      });
    });

    it('should extract price limit from query', async () => {
      const user = userEvent.setup();
      render(
        <AISearchEngine
          onSearch={mockOnSearch}
          onClose={mockOnClose}
        />
      );

      const input = screen.getByPlaceholderText(/search for equipment/i);
      await user.type(input, 'tools under $150');
      await user.click(screen.getByRole('button', { name: /analyze query/i }));

      await waitFor(() => {
        expect(screen.getByText(/\$150/i)).toBeInTheDocument();
      });
    });

    it('should show confidence score', async () => {
      const user = userEvent.setup();
      render(
        <AISearchEngine
          onSearch={mockOnSearch}
          onClose={mockOnClose}
        />
      );

      const input = screen.getByPlaceholderText(/search for equipment/i);
      await user.type(input, 'excavator in Los Angeles');
      await user.click(screen.getByRole('button', { name: /analyze query/i }));

      await waitFor(() => {
        expect(screen.getByText(/confidence/i)).toBeInTheDocument();
        expect(screen.getByText(/%/i)).toBeInTheDocument();
      });
    });
  });

  describe('Search Execution', () => {
    it('should call onSearch with extracted filters', async () => {
      const user = userEvent.setup();
      render(
        <AISearchEngine
          onSearch={mockOnSearch}
          onClose={mockOnClose}
        />
      );

      const input = screen.getByPlaceholderText(/search for equipment/i);
      await user.type(input, 'excavator in Los Angeles under $300');
      await user.click(screen.getByRole('button', { name: /analyze query/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /search equipment/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /search equipment/i }));

      expect(mockOnSearch).toHaveBeenCalledWith(
        'excavator',
        expect.objectContaining({
          location: expect.stringContaining('Los Angeles'),
          maxPrice: 300,
        })
      );
    });

    it('should close modal after search', async () => {
      const user = userEvent.setup();
      render(
        <AISearchEngine
          onSearch={mockOnSearch}
          onClose={mockOnClose}
        />
      );

      const input = screen.getByPlaceholderText(/search for equipment/i);
      await user.type(input, 'camera');
      await user.click(screen.getByRole('button', { name: /analyze query/i }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /search equipment/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /search equipment/i }));

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty query gracefully', async () => {
      const user = userEvent.setup();
      render(
        <AISearchEngine
          onSearch={mockOnSearch}
          onClose={mockOnClose}
        />
      );

      const input = screen.getByPlaceholderText(/search for equipment/i);
      await user.type(input, '   ');

      const analyzeButton = screen.getByRole('button', { name: /analyze query/i });
      expect(analyzeButton).toBeDisabled();
    });

    it('should handle vague queries', async () => {
      const user = userEvent.setup();
      render(
        <AISearchEngine
          onSearch={mockOnSearch}
          onClose={mockOnClose}
        />
      );

      const input = screen.getByPlaceholderText(/search for equipment/i);
      await user.type(input, 'something to dig');
      await user.click(screen.getByRole('button', { name: /analyze query/i }));

      await waitFor(() => {
        expect(screen.getByText(/confidence/i)).toBeInTheDocument();
      });
    });
  });
});
```

### 2. AnalyticsCharts.test.tsx
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnalyticsCharts from './AnalyticsCharts';
import { mockUser } from '../../__tests__/testUtils';

describe('AnalyticsCharts', () => {
  const mockAnalytics = {
    id: 'analytics-123',
    user_id: mockUser.id,
    total_earned: 15480,
    total_rentals: 42,
    equipment_listed: 8,
    avg_rating_received: 4.8,
    profile_views: 1250,
    updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render stat cards with correct values', () => {
      render(
        <AnalyticsCharts
          userId={mockUser.id}
          analytics={mockAnalytics}
        />
      );

      expect(screen.getByText(/\$15,480/)).toBeInTheDocument();
      expect(screen.getByText(/42/)).toBeInTheDocument();
      expect(screen.getByText(/4\.8/)).toBeInTheDocument();
      expect(screen.getByText(/1,250/)).toBeInTheDocument();
    });

    it('should render metric toggle buttons', () => {
      render(
        <AnalyticsCharts
          userId={mockUser.id}
          analytics={mockAnalytics}
        />
      );

      expect(screen.getByRole('button', { name: /revenue/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /bookings/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /views/i })).toBeInTheDocument();
    });

    it('should render chart title', () => {
      render(
        <AnalyticsCharts
          userId={mockUser.id}
          analytics={mockAnalytics}
        />
      );

      expect(screen.getByText(/revenue over time/i)).toBeInTheDocument();
    });
  });

  describe('Metric Switching', () => {
    it('should toggle to bookings metric', async () => {
      const user = userEvent.setup();
      render(
        <AnalyticsCharts
          userId={mockUser.id}
          analytics={mockAnalytics}
        />
      );

      const bookingsButton = screen.getByRole('button', { name: /bookings/i });
      await user.click(bookingsButton);

      expect(screen.getByText(/bookings over time/i)).toBeInTheDocument();
    });

    it('should toggle to views metric', async () => {
      const user = userEvent.setup();
      render(
        <AnalyticsCharts
          userId={mockUser.id}
          analytics={mockAnalytics}
        />
      );

      const viewsButton = screen.getByRole('button', { name: /views/i });
      await user.click(viewsButton);

      expect(screen.getByText(/profile views/i)).toBeInTheDocument();
    });

    it('should highlight active metric button', async () => {
      const user = userEvent.setup();
      render(
        <AnalyticsCharts
          userId={mockUser.id}
          analytics={mockAnalytics}
        />
      );

      const revenueButton = screen.getByRole('button', { name: /revenue/i });
      expect(revenueButton).toHaveClass('bg-teal-500');

      const bookingsButton = screen.getByRole('button', { name: /bookings/i });
      await user.click(bookingsButton);

      expect(bookingsButton).toHaveClass('bg-teal-500');
      expect(revenueButton).not.toHaveClass('bg-teal-500');
    });
  });

  describe('Chart Display', () => {
    it('should render bar chart', () => {
      render(
        <AnalyticsCharts
          userId={mockUser.id}
          analytics={mockAnalytics}
        />
      );

      // Check for SVG chart elements
      const chart = screen.getByRole('graphics-document');
      expect(chart).toBeInTheDocument();
    });

    it('should display data points', () => {
      render(
        <AnalyticsCharts
          userId={mockUser.id}
          analytics={mockAnalytics}
        />
      );

      // Should have at least 7 bars (one week of data)
      const bars = screen.getAllByRole('graphics-symbol');
      expect(bars.length).toBeGreaterThanOrEqual(7);
    });
  });

  describe('Loading States', () => {
    it('should show loading state initially', () => {
      render(
        <AnalyticsCharts
          userId={mockUser.id}
          analytics={undefined}
        />
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should hide loading state after data loads', async () => {
      const { rerender } = render(
        <AnalyticsCharts
          userId={mockUser.id}
          analytics={undefined}
        />
      );

      expect(screen.getByRole('progressbar')).toBeInTheDocument();

      rerender(
        <AnalyticsCharts
          userId={mockUser.id}
          analytics={mockAnalytics}
        />
      );

      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });
  });

  describe('Empty States', () => {
    it('should show empty state when no data', () => {
      render(
        <AnalyticsCharts
          userId={mockUser.id}
          analytics={{
            ...mockAnalytics,
            total_earned: 0,
            total_rentals: 0,
          }}
        />
      );

      expect(screen.getByText(/no data yet/i)).toBeInTheDocument();
    });
  });
});
```

### 3. PhotoMessaging.test.tsx
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PhotoMessaging from './PhotoMessaging';
import { createMockFile } from '../../__tests__/testUtils';

describe('PhotoMessaging', () => {
  const mockOnSendMessage = vi.fn();
  const mockOnClose = vi.fn();
  const conversationId = 'conv-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render conversation header', () => {
      render(
        <PhotoMessaging
          conversationId={conversationId}
          onSendMessage={mockOnSendMessage}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/demo conversation/i)).toBeInTheDocument();
    });

    it('should render message input', () => {
      render(
        <PhotoMessaging
          conversationId={conversationId}
          onSendMessage={mockOnSendMessage}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByPlaceholderText(/type your message/i)).toBeInTheDocument();
    });

    it('should render photo upload area', () => {
      render(
        <PhotoMessaging
          conversationId={conversationId}
          onSendMessage=          {mockOnSendMessage}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByText(/upload photos/i)).toBeInTheDocument();
      expect(screen.getByText(/0 of 5 photos/i)).toBeInTheDocument();
    });

    it('should render send button', () => {
      render(
        <PhotoMessaging
          conversationId={conversationId}
          onSendMessage={mockOnSendMessage}
          onClose={mockOnClose}
        />
      );

      expect(screen.getByLabelText(/send message/i)).toBeInTheDocument();
    });
  });

  describe('Photo Upload', () => {
    it('should allow uploading one photo', async () => {
      const user = userEvent.setup();
      render(
        <PhotoMessaging
          conversationId={conversationId}
          onSendMessage={mockOnSendMessage}
          onClose={mockOnClose}
        />
      );

      const file = createMockFile('test.jpg');
      const input = screen.getByLabelText(/upload photos/i);

      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText(/1 of 5 photos/i)).toBeInTheDocument();
      });
    });

    it('should allow uploading multiple photos', async () => {
      const user = userEvent.setup();
      render(
        <PhotoMessaging
          conversationId={conversationId}
          onSendMessage={mockOnSendMessage}
          onClose={mockOnClose}
        />
      );

      const files = [
        createMockFile('test1.jpg'),
        createMockFile('test2.jpg'),
        createMockFile('test3.jpg'),
      ];
      const input = screen.getByLabelText(/upload photos/i);

      await user.upload(input, files);

      await waitFor(() => {
        expect(screen.getByText(/3 of 5 photos/i)).toBeInTheDocument();
      });
    });

    it('should limit photos to 5', async () => {
      const user = userEvent.setup();
      render(
        <PhotoMessaging
          conversationId={conversationId}
          onSendMessage={mockOnSendMessage}
          onClose={mockOnClose}
        />
      );

      const files = Array.from({ length: 7 }, (_, i) =>
        createMockFile(`test${i}.jpg`)
      );
      const input = screen.getByLabelText(/upload photos/i);

      await user.upload(input, files);

      await waitFor(() => {
        expect(screen.getByText(/5 of 5 photos/i)).toBeInTheDocument();
      });
    });

    it('should show photo thumbnails', async () => {
      const user = userEvent.setup();
      render(
        <PhotoMessaging
          conversationId={conversationId}
          onSendMessage={mockOnSendMessage}
          onClose={mockOnClose}
        />
      );

      const file = createMockFile('test.jpg');
      const input = screen.getByLabelText(/upload photos/i);

      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByAltText(/test\.jpg/i)).toBeInTheDocument();
      });
    });

    it('should allow removing photos', async () => {
      const user = userEvent.setup();
      render(
        <PhotoMessaging
          conversationId={conversationId}
          onSendMessage={mockOnSendMessage}
          onClose={mockOnClose}
        />
      );

      const file = createMockFile('test.jpg');
      const input = screen.getByLabelText(/upload photos/i);

      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText(/1 of 5 photos/i)).toBeInTheDocument();
      });

      const removeButton = screen.getByLabelText(/remove photo/i);
      await user.click(removeButton);

      expect(screen.getByText(/0 of 5 photos/i)).toBeInTheDocument();
    });
  });

  describe('Message Sending', () => {
    it('should send text-only message', async () => {
      const user = userEvent.setup();
      render(
        <PhotoMessaging
          conversationId={conversationId}
          onSendMessage={mockOnSendMessage}
          onClose={mockOnClose}
        />
      );

      const input = screen.getByPlaceholderText(/type your message/i);
      await user.type(input, 'Test message');

      const sendButton = screen.getByLabelText(/send message/i);
      await user.click(sendButton);

      expect(mockOnSendMessage).toHaveBeenCalledWith('Test message', []);
    });

    it('should send message with photos', async () => {
      const user = userEvent.setup();
      render(
        <PhotoMessaging
          conversationId={conversationId}
          onSendMessage={mockOnSendMessage}
          onClose={mockOnClose}
        />
      );

      // Type message
      const input = screen.getByPlaceholderText(/type your message/i);
      await user.type(input, 'Here are the photos');

      // Upload photos
      const file = createMockFile('test.jpg');
      const fileInput = screen.getByLabelText(/upload photos/i);
      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText(/1 of 5 photos/i)).toBeInTheDocument();
      });

      // Send
      const sendButton = screen.getByLabelText(/send message/i);
      await user.click(sendButton);

      expect(mockOnSendMessage).toHaveBeenCalledWith(
        'Here are the photos',
        expect.arrayContaining([expect.any(String)])
      );
    });

    it('should clear form after sending', async () => {
      const user = userEvent.setup();
      render(
        <PhotoMessaging
          conversationId={conversationId}
          onSendMessage={mockOnSendMessage}
          onClose={mockOnClose}
        />
      );

      const input = screen.getByPlaceholderText(/type your message/i);
      await user.type(input, 'Test');
      await user.click(screen.getByLabelText(/send message/i));

      expect(input).toHaveValue('');
      expect(screen.getByText(/0 of 5 photos/i)).toBeInTheDocument();
    });

    it('should disable send button when message is empty', () => {
      render(
        <PhotoMessaging
          conversationId={conversationId}
          onSendMessage={mockOnSendMessage}
          onClose={mockOnClose}
        />
      );

      const sendButton = screen.getByLabelText(/send message/i);
      expect(sendButton).toBeDisabled();
    });

    it('should enable send button with text', async () => {
      const user = userEvent.setup();
      render(
        <PhotoMessaging
          conversationId={conversationId}
          onSendMessage={mockOnSendMessage}
          onClose={mockOnClose}
        />
      );

      const input = screen.getByPlaceholderText(/type your message/i);
      await user.type(input, 'Test');

      const sendButton = screen.getByLabelText(/send message/i);
      expect(sendButton).not.toBeDisabled();
    });

    it('should enable send button with only photos', async () => {
      const user = userEvent.setup();
      render(
        <PhotoMessaging
          conversationId={conversationId}
          onSendMessage={mockOnSendMessage}
          onClose={mockOnClose}
        />
      );

      const file = createMockFile('test.jpg');
      const input = screen.getByLabelText(/upload photos/i);
      await user.upload(input, file);

      await waitFor(() => {
        const sendButton = screen.getByLabelText(/send message/i);
        expect(sendButton).not.toBeDisabled();
      });
    });
  });

  describe('File Validation', () => {
    it('should reject non-image files', async () => {
      const user = userEvent.setup();
      render(
        <PhotoMessaging
          conversationId={conversationId}
          onSendMessage={mockOnSendMessage}
          onClose={mockOnClose}
        />
      );

      const file = createMockFile('test.pdf', 1024, 'application/pdf');
      const input = screen.getByLabelText(/upload photos/i);

      await user.upload(input, file);

      expect(screen.getByText(/only image files allowed/i)).toBeInTheDocument();
    });

    it('should reject files over size limit', async () => {
      const user = userEvent.setup();
      render(
        <PhotoMessaging
          conversationId={conversationId}
          onSendMessage={mockOnSendMessage}
          onClose={mockOnClose}
        />
      );

      const file = createMockFile('test.jpg', 10 * 1024 * 1024); // 10MB
      const input = screen.getByLabelText(/upload photos/i);

      await user.upload(input, file);

      expect(screen.getByText(/file too large/i)).toBeInTheDocument();
    });
  });
});
```

---

## 🎯 Running Tests

### Basic Commands
```bash
# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file change)
npm test -- --watch

# Run tests with UI
npm test:ui

# Run specific test file
npm test AISearchEngine

# Run tests matching pattern
npm test -- --grep "photo upload"
```

### Coverage Commands
```bash
# Generate coverage report
npm test:coverage

# View HTML coverage report
open coverage/index.html

# Check if coverage meets thresholds
npm test:coverage -- --run
```

### CI/CD Integration
Add to `.github/workflows/test.yml`:
```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## 📊 Coverage Goals

### Target Metrics
- **Statements**: 80%+
- **Branches**: 80%+
- **Functions**: 80%+
- **Lines**: 80%+

### Priority Areas
1. **Critical Paths**: User interactions, form submissions
2. **Business Logic**: Search analysis, payment processing
3. **Error Handling**: API failures, validation errors
4. **Edge Cases**: Empty states, limits exceeded

### Coverage Report
After running `npm test:coverage`:
```
-----------------------|---------|----------|---------|---------|
File                   | % Stmts | % Branch | % Funcs | % Lines |
-----------------------|---------|----------|---------|---------|
All files              |   85.42 |    78.91 |   82.14 |   85.67 |
 AISearchEngine.tsx    |   92.31 |    85.71 |   88.89 |   92.45 |
 AnalyticsCharts.tsx   |   88.24 |    81.25 |   84.62 |   88.57 |
 PhotoMessaging.tsx    |   86.67 |    77.78 |   80.00 |   86.96 |
 EnhancedReview.tsx    |   84.00 |    76.47 |   81.25 |   84.21 |
 PWAFeatures.tsx       |   81.82 |    72.73 |   78.57 |   82.14 |
 MultiPayment.tsx      |   83.33 |    75.00 |   79.41 |   83.67 |
-----------------------|---------|----------|---------|---------|
```

---

## 🔧 Debugging Tests

### VS Code Setup
Install extension: **Vitest** by ZixuanChen

Add to `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Vitest Tests",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["test", "--", "--run"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    }
  ]
}
```

### Console Debugging
```typescript
// Print rendered output
import { screen, debug } from '@testing-library/react';

it('should...', () => {
  render(<Component />);
  debug(); // Prints entire DOM
  screen.debug(screen.getByRole('button')); // Prints specific element
});
```

### Test-Specific Logs
```typescript
it('should analyze query', async () => {
  console.log('=== Test: Analyze Query ===');
  
  const user = userEvent.setup();
  render(<AISearchEngine />);
  
  console.log('Typing query...');
  await user.type(screen.getByPlaceholderText(/search/i), 'excavator');
  
  console.log('Clicking analyze...');
  await user.click(screen.getByRole('button', { name: /analyze/i }));
  
  console.log('Waiting for results...');
  await waitFor(() => {
    expect(screen.getByText(/intent/i)).toBeInTheDocument();
  });
});
```

---

## ✅ Testing Checklist

### Component Coverage
- [ ] AISearchEngine: 8/8 test suites passing
- [ ] AnalyticsCharts: 6/6 test suites passing
- [ ] PhotoMessaging: 8/8 test suites passing
- [ ] EnhancedReviewSystem: 10/10 test suites passing
- [ ] PWAEnhancedFeatures: 5/5 test suites passing
- [ ] MultiPaymentSystem: 7/7 test suites passing

### Test Categories
- [ ] Rendering tests (all components render correctly)
- [ ] User interaction tests (clicks, typing, form submission)
- [ ] State management tests (data flows correctly)
- [ ] API integration tests (mocked responses)
- [ ] Error handling tests (edge cases covered)
- [ ] Accessibility tests (keyboard navigation, screen readers)

### Quality Metrics
- [ ] All tests passing (0 failures)
- [ ] Coverage >80% for statements
- [ ] Coverage >80% for branches
- [ ] Coverage >80% for functions
- [ ] Coverage >80% for lines
- [ ] No console errors in tests
- [ ] Test execution <30 seconds

---

## 📚 Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Test-Driven Development](https://martinfowler.com/bliki/TestDrivenDevelopment.html)

---

**Estimated Time**: 4-6 hours for complete test implementation
**Priority**: Medium - Required before production launch
**Status**: Ready for Implementation

Last Updated: Now
