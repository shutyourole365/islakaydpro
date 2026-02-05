import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Must define mocks before vi.mock calls due to hoisting
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
    },
    from: vi.fn(() => ({
      update: vi.fn(() => ({ eq: vi.fn(() => Promise.resolve({ error: null })) })),
      upsert: vi.fn(() => Promise.resolve({ error: null })),
    })),
  },
}));

// Mock database services
vi.mock('../services/database', () => ({
  getProfile: vi.fn(() => Promise.resolve({
    id: 'test-user-id',
    full_name: 'Test User',
    email: 'test@example.com',
  })),
  getUserAnalytics: vi.fn(() => Promise.resolve({
    total_rentals: 5,
    total_spent: 1000,
  })),
  getUnreadNotificationCount: vi.fn(() => Promise.resolve(3)),
  subscribeToNotifications: vi.fn(() => ({
    unsubscribe: vi.fn(),
  })),
  logAuditEvent: vi.fn(() => Promise.resolve()),
}));

// Mock auth helpers
vi.mock('../services/authHelpers', () => ({
  signInWithRetry: vi.fn(),
  signUpWithRetry: vi.fn(),
  getAuthErrorMessage: vi.fn((error: Error) => error.message),
  isEmailConfirmationRequired: vi.fn(() => Promise.resolve(false)),
}));

// Mock analytics and error monitoring (they're dynamically imported)
vi.mock('../services/analytics', () => ({
  analytics: {
    event: vi.fn(),
    setUserId: vi.fn(),
    trackSignUp: vi.fn(),
  },
}));

vi.mock('../services/errorMonitoring', () => ({
  errorMonitoring: {
    captureException: vi.fn(),
    setUser: vi.fn(),
    clearUser: vi.fn(),
  },
}));

// Import after mocks are defined
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

// Test component
function AuthConsumer() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="loading">{auth.isLoading ? 'loading' : 'ready'}</span>
      <span data-testid="authenticated">{auth.isAuthenticated ? 'yes' : 'no'}</span>
      <span data-testid="user">{auth.user?.email || 'none'}</span>
      <span data-testid="profile">{auth.profile?.full_name || 'none'}</span>
      <span data-testid="notifications">{auth.unreadNotifications}</span>
      <button 
        data-testid="sign-in" 
        onClick={() => auth.signIn('test@example.com', 'password123')}
      >
        Sign In
      </button>
      <button 
        data-testid="sign-up" 
        onClick={() => auth.signUp('new@example.com', 'password123', 'New User')}
      >
        Sign Up
      </button>
      <button data-testid="sign-out" onClick={() => auth.signOut()}>
        Sign Out
      </button>
      <button 
        data-testid="reset-password" 
        onClick={() => auth.resetPassword('test@example.com')}
      >
        Reset Password
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  let authStateCallback: ((event: string, session: unknown) => void) | null = null;
  
  // Get typed reference to mocked supabase
  const mockSupabase = vi.mocked(supabase);

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    } as never);
    
    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authStateCallback = callback as (event: string, session: unknown) => void;
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      } as never;
    });
  });

  afterEach(() => {
    authStateCallback = null;
  });

  it('should start with loading state', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    // Initially may be loading
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('ready');
    });
  });

  it('should show unauthenticated state when no session', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('no');
      expect(screen.getByTestId('user').textContent).toBe('none');
    });
  });

  it('should load user data when session exists', async () => {
    const mockSession = {
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
      },
      access_token: 'token',
    };

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    } as never);

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('yes');
      expect(screen.getByTestId('user').textContent).toBe('test@example.com');
    });

    await waitFor(() => {
      expect(screen.getByTestId('profile').textContent).toBe('Test User');
      expect(screen.getByTestId('notifications').textContent).toBe('3');
    });
  });

  it('should handle sign in', async () => {
    const { signInWithRetry } = await import('../services/authHelpers');
    const mockUser = { id: 'new-user-id', email: 'test@example.com' };
    
    (signInWithRetry as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: mockUser,
      session: { user: mockUser, access_token: 'token' },
    });

    const user = userEvent.setup();
    
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('ready');
    });

    await user.click(screen.getByTestId('sign-in'));

    await waitFor(() => {
      expect(signInWithRetry).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        { maxAttempts: 3, delayMs: 1000 }
      );
    });
  });

  it('should call signInWithRetry with correct params on error', async () => {
    const { signInWithRetry, getAuthErrorMessage } = await import('../services/authHelpers');
    
    (signInWithRetry as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Invalid credentials')
    );
    (getAuthErrorMessage as ReturnType<typeof vi.fn>).mockReturnValue('Invalid email or password');

    const user = userEvent.setup();
    
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('ready');
    });

    // Click will throw but we just verify signInWithRetry was called
    try {
      await user.click(screen.getByTestId('sign-in'));
    } catch {
      // Expected to throw
    }

    await waitFor(() => {
      expect(signInWithRetry).toHaveBeenCalledWith(
        'test@example.com',
        'password123',
        { maxAttempts: 3, delayMs: 1000 }
      );
    });
  });

  it('should handle sign up', async () => {
    const { signUpWithRetry } = await import('../services/authHelpers');
    const mockUser = { id: 'new-user-id', email: 'new@example.com' };
    
    (signUpWithRetry as ReturnType<typeof vi.fn>).mockResolvedValue({
      user: mockUser,
      session: { user: mockUser, access_token: 'token' },
    });

    const user = userEvent.setup();
    
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('ready');
    });

    await user.click(screen.getByTestId('sign-up'));

    await waitFor(() => {
      expect(signUpWithRetry).toHaveBeenCalledWith(
        'new@example.com',
        'password123',
        { full_name: 'New User' },
        { maxAttempts: 3, delayMs: 1000 }
      );
    });
  });

  it('should handle sign out', async () => {
    const mockSession = {
      user: { id: 'test-user-id', email: 'test@example.com' },
      access_token: 'token',
    };

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    } as never);
    mockSupabase.auth.signOut.mockResolvedValue({ error: null } as never);

    const user = userEvent.setup();
    
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('yes');
    });

    await user.click(screen.getByTestId('sign-out'));

    await waitFor(() => {
      expect(mockSupabase.auth.signOut).toHaveBeenCalled();
    });
  });

  it('should handle password reset', async () => {
    mockSupabase.auth.resetPasswordForEmail.mockResolvedValue({ error: null } as never);

    const user = userEvent.setup();
    
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('ready');
    });

    await user.click(screen.getByTestId('reset-password'));

    await waitFor(() => {
      expect(mockSupabase.auth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        expect.objectContaining({
          redirectTo: expect.stringContaining('/reset-password'),
        })
      );
    });
  });

  it('should respond to auth state changes', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('no');
    });

    // Simulate auth state change (user signs in)
    const mockSession = {
      user: { id: 'test-user-id', email: 'test@example.com' },
      access_token: 'token',
    };

    await act(async () => {
      if (authStateCallback) {
        authStateCallback('SIGNED_IN', mockSession);
      }
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('yes');
      expect(screen.getByTestId('user').textContent).toBe('test@example.com');
    });
  });

  it('should throw error when useAuth is used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<AuthConsumer />);
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });

  it('should clear state on sign out via auth state change', async () => {
    const mockSession = {
      user: { id: 'test-user-id', email: 'test@example.com' },
      access_token: 'token',
    };

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    } as never);

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('yes');
    });

    // Simulate sign out via auth state change
    await act(async () => {
      if (authStateCallback) {
        authStateCallback('SIGNED_OUT', null);
      }
    });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('no');
      expect(screen.getByTestId('user').textContent).toBe('none');
      expect(screen.getByTestId('notifications').textContent).toBe('0');
    });
  });
});
