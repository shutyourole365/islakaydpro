import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { ToastProvider } from './components/ui/Toast';
import { vi } from 'vitest';

// Mock Supabase client
vi.mock('./lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: () => {} } } })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => Promise.resolve({ data: [], error: null })),
      insert: vi.fn(() => Promise.resolve({ data: [], error: null })),
      update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ data: [], error: null })) })),
      delete: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
      upsert: vi.fn(() => Promise.resolve({ data: [], error: null })),
      on: vi.fn(() => ({ subscribe: vi.fn() })),
    })),
  },
}));

// Mock database services
vi.mock('./services/database', () => ({
  getProfile: vi.fn(() => Promise.resolve({
    id: 'test-user-id',
    full_name: 'Test User',
    email: 'test@example.com',
  })),
  createEquipment: vi.fn(),
  updateEquipment: vi.fn(),
  deleteEquipment: vi.fn(),
  getEquipment: vi.fn(),
  createBooking: vi.fn(),
  getBookings: vi.fn(),
}));

// Mock AI services
vi.mock('./services/ai', () => ({
  getPersonalizedRecommendations: vi.fn(() => Promise.resolve([])),
  getChatResponse: vi.fn(() => Promise.resolve({ content: 'Test response' })),
}));

// Mock payment services
vi.mock('./services/payments', () => ({
  createPaymentIntent: vi.fn(),
  verifyCheckoutSession: vi.fn(),
}));

interface AllTheProviders {
  children: React.ReactNode;
}

const AllTheProviders = ({ children }: AllTheProviders) => (
  <ThemeProvider>
    <AuthProvider>
      <ToastProvider>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </ToastProvider>
    </AuthProvider>
  </ThemeProvider>
);

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
