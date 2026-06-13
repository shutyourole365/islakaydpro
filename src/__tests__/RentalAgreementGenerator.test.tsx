import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RentalAgreementGenerator from '../components/agreements/RentalAgreementGenerator';

const mocks = vi.hoisted(() => ({
  agreements: [] as unknown[],
}));

vi.mock('../contexts/AuthContext', () => {
  const mockUser = { id: 'test-user' };
  return {
    useAuth: () => ({ user: mockUser, profile: null, isAuthenticated: true, isLoading: false }),
  };
});

// Chainable supabase query-builder mock; queries resolve with the configured agreements
vi.mock('../lib/supabase', () => {
  const createQueryBuilder = () => {
    const builder: Record<string, unknown> = {};
    const chain = () => builder;
    for (const method of ['select', 'insert', 'update', 'delete', 'upsert', 'eq', 'or', 'order', 'limit', 'maybeSingle']) {
      builder[method] = chain;
    }
    builder.single = () => Promise.resolve({ data: null, error: null });
    builder.then = (resolve: (value: unknown) => unknown, reject?: (reason: unknown) => unknown) =>
      Promise.resolve({ data: mocks.agreements, error: null }).then(resolve, reject);
    return builder;
  };
  return { supabase: { from: () => createQueryBuilder() } };
});

const sampleAgreement = {
  id: 'agr-1',
  booking_id: 'book-1',
  equipment_title: 'CAT 320 Excavator',
  start_date: '2026-06-01T00:00:00Z',
  end_date: '2026-06-05T00:00:00Z',
  total_amount: 1800,
  deposit_amount: 500,
  daily_rate: 450,
  insurance_plan: null,
  special_terms: null,
  status: 'pending',
  owner_signed_at: null,
  renter_signed_at: null,
  owner_id: 'owner-1',
  renter_id: 'test-user',
  created_at: '2026-05-28T00:00:00Z',
  owner: { full_name: 'John D.' },
  renter: { full_name: 'Sarah M.' },
};

describe('RentalAgreementGenerator', () => {
  const mockOnBack = vi.fn();

  // Render and flush the component's initial async agreement load
  const renderComponent = async () => {
    const result = render(<RentalAgreementGenerator onBack={mockOnBack} />);
    await act(async () => {});
    return result;
  };

  beforeEach(() => {
    mockOnBack.mockClear();
    mocks.agreements = [];
  });

  describe('Component Rendering', () => {
    it('should render with main title and description', async () => {
      await renderComponent();
      expect(screen.getByText('Rental Agreements')).toBeInTheDocument();
      expect(screen.getByText(/Digital contracts for your rentals/i)).toBeInTheDocument();
    });

    it('should display back button', async () => {
      await renderComponent();
      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
    });

    it('should call onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      await renderComponent();
      await user.click(screen.getByRole('button', { name: /go back/i }));
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should display the protection note', async () => {
      await renderComponent();
      expect(screen.getByText(/legal protection for both parties/i)).toBeInTheDocument();
    });
  });

  describe('Generate Agreement Form', () => {
    it('should display the generate form with booking ID input', async () => {
      await renderComponent();
      expect(screen.getByText('Generate Agreement from Booking')).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/paste your booking id/i)).toBeInTheDocument();
    });

    it('should display the special terms textarea', async () => {
      await renderComponent();
      expect(screen.getByPlaceholderText(/any additional terms/i)).toBeInTheDocument();
    });

    it('should disable generate button when booking ID is empty', async () => {
      await renderComponent();
      expect(screen.getByRole('button', { name: /generate agreement/i })).toBeDisabled();
    });

    it('should enable generate button when booking ID is entered', async () => {
      const user = userEvent.setup();
      await renderComponent();
      await user.type(screen.getByPlaceholderText(/paste your booking id/i), 'book-123');
      expect(screen.getByRole('button', { name: /generate agreement/i })).toBeEnabled();
    });
  });

  describe('Agreements List', () => {
    it('should show empty state when there are no agreements', async () => {
      await renderComponent();
      expect(screen.getByText(/no agreements yet/i)).toBeInTheDocument();
    });

    it('should list agreements with equipment title', async () => {
      mocks.agreements = [sampleAgreement];
      await renderComponent();
      expect(screen.getByText('CAT 320 Excavator')).toBeInTheDocument();
    });

    it('should display agreement status badge', async () => {
      mocks.agreements = [sampleAgreement];
      await renderComponent();
      expect(screen.getByText('Awaiting Signatures')).toBeInTheDocument();
    });

    it('should display fully signed status', async () => {
      mocks.agreements = [
        {
          ...sampleAgreement,
          status: 'fully_signed',
          owner_signed_at: '2026-05-29T00:00:00Z',
          renter_signed_at: '2026-05-29T00:00:00Z',
        },
      ];
      await renderComponent();
      expect(screen.getByText('Fully Signed')).toBeInTheDocument();
    });
  });

  describe('Agreement Detail View', () => {
    it('should open agreement detail when an agreement is clicked', async () => {
      const user = userEvent.setup();
      mocks.agreements = [sampleAgreement];
      await renderComponent();
      await user.click(screen.getByText('CAT 320 Excavator'));
      expect(screen.getByText('Rental Agreement')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /download/i })).toBeInTheDocument();
    });

    it('should show signature status for both parties', async () => {
      const user = userEvent.setup();
      mocks.agreements = [sampleAgreement];
      await renderComponent();
      await user.click(screen.getByText('CAT 320 Excavator'));
      expect(screen.getByText(/Owner \(John D\.\)/)).toBeInTheDocument();
      expect(screen.getByText(/Renter \(Sarah M\.\)/)).toBeInTheDocument();
      expect(screen.getAllByText('Pending')).toHaveLength(2);
    });

    it('should offer signing for the current user when unsigned', async () => {
      const user = userEvent.setup();
      mocks.agreements = [sampleAgreement];
      await renderComponent();
      await user.click(screen.getByText('CAT 320 Excavator'));
      expect(screen.getByRole('button', { name: /sign as renter/i })).toBeInTheDocument();
    });

    it('should return to the list from the detail view', async () => {
      const user = userEvent.setup();
      mocks.agreements = [sampleAgreement];
      await renderComponent();
      await user.click(screen.getByText('CAT 320 Excavator'));
      await user.click(screen.getByText(/back to agreements/i));
      expect(screen.getByText('Rental Agreements')).toBeInTheDocument();
    });

    it('should not offer signing on voided agreements', async () => {
      const user = userEvent.setup();
      mocks.agreements = [{ ...sampleAgreement, status: 'voided' }];
      await renderComponent();
      await user.click(screen.getByText('CAT 320 Excavator'));
      expect(screen.queryByRole('button', { name: /sign as/i })).not.toBeInTheDocument();
    });
  });
});
