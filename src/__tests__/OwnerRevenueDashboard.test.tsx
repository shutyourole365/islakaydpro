import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OwnerRevenueDashboard from '../components/revenue/OwnerRevenueDashboard';

// Stable resolved value — avoids infinite re-render from changing mock references
const EMPTY_RESULT = { data: [], error: null };

vi.mock('../lib/supabase', () => {
  const makeBuilder = () => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue(EMPTY_RESULT),
    in: vi.fn().mockResolvedValue(EMPTY_RESULT),
  });
  return {
    supabase: {
      from: vi.fn(() => makeBuilder()),
    },
  };
});

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'test-user-id' } }),
}));

describe('OwnerRevenueDashboard', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    mockOnBack.mockClear();
  });

  describe('Component Rendering', () => {
    it('should render with main title', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Revenue Dashboard')).toBeInTheDocument();
    });

    it('should display back button', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
    });

    it('should display period selection buttons', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByRole('button', { name: /Week/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Month/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Quarter/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Year/i })).toBeInTheDocument();
    });

    it('should call onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      await user.click(screen.getByRole('button', { name: /go back/i }));
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('KPI Cards Display', () => {
    it('should display KPI cards after data loads', async () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      await waitFor(() => {
        expect(screen.getByText('Period Revenue')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Period Selection', () => {
    it('should default to month period', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      const monthBtn = screen.getByRole('button', { name: /^Month$/i });
      expect(monthBtn.className).toContain('bg-white');
    });

    it('should switch to week period', async () => {
      const user = userEvent.setup();
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      await user.click(screen.getByRole('button', { name: /^Week$/i }));
      expect(screen.getByRole('button', { name: /^Week$/i }).className).toContain('bg-white');
    });

    it('should switch to quarter period', async () => {
      const user = userEvent.setup();
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      await user.click(screen.getByRole('button', { name: /^Quarter$/i }));
      expect(screen.getByRole('button', { name: /^Quarter$/i }).className).toContain('bg-white');
    });

    it('should switch to year period', async () => {
      const user = userEvent.setup();
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      await user.click(screen.getByRole('button', { name: /^Year$/i }));
      expect(screen.getByRole('button', { name: /^Year$/i }).className).toContain('bg-white');
    });
  });

  describe('Empty State', () => {
    it('should show empty state sections with no data', async () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      await waitFor(() => {
        const noData = screen.queryAllByText(/No revenue data|No bookings yet|No transactions/i);
        expect(noData.length).toBeGreaterThan(0);
      }, { timeout: 3000 });
    });
  });
});
