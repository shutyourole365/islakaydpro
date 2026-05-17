import type { ReactElement } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render as rtlRender, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RentalAgreementGenerator from '../components/agreements/RentalAgreementGenerator';
import { ToastProvider } from '../components/ui/Toast';

// The component now uses useToast — wrap every render in ToastProvider.
const render = (ui: ReactElement) =>
  rtlRender(<ToastProvider>{ui}</ToastProvider>);

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1', email: 'test@test.com' } }),
}));

const { mockChain } = vi.hoisted(() => {
  const mockChain = {
    select: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
  };
  return { mockChain };
});

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue(mockChain),
  },
}));

const mockAgreements = [
  {
    id: 'agr-1',
    booking_id: 'booking-1',
    equipment_title: 'CAT 320 Excavator',
    start_date: '2026-03-01',
    end_date: '2026-03-05',
    total_amount: 1200,
    deposit_amount: 500,
    daily_rate: 300,
    insurance_plan: null,
    special_terms: null,
    status: 'pending' as const,
    owner_signed_at: null,
    renter_signed_at: null,
    owner_id: 'user-1',
    renter_id: 'user-2',
    created_at: '2026-02-01T00:00:00Z',
    owner: { full_name: 'Test Owner' },
    renter: { full_name: 'John Doe' },
  },
  {
    id: 'agr-2',
    booking_id: 'booking-2',
    equipment_title: 'Sony A7IV Camera Kit',
    start_date: '2026-04-01',
    end_date: '2026-04-03',
    total_amount: 450,
    deposit_amount: 200,
    daily_rate: 150,
    insurance_plan: 'basic',
    special_terms: null,
    status: 'fully_signed' as const,
    owner_signed_at: '2026-03-15T00:00:00Z',
    renter_signed_at: '2026-03-16T00:00:00Z',
    owner_id: 'user-1',
    renter_id: 'user-3',
    created_at: '2026-03-01T00:00:00Z',
    owner: { full_name: 'Test Owner' },
    renter: { full_name: 'Sarah Miller' },
  },
];

describe('RentalAgreementGenerator', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    mockOnBack.mockClear();
    vi.clearAllMocks();
    mockChain.select.mockReturnThis();
    mockChain.or.mockReturnThis();
    mockChain.order.mockResolvedValue({ data: mockAgreements, error: null });
  });

  describe('Component Rendering', () => {
    it('should render title after loading', async () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      await waitFor(() => expect(screen.getByText('Rental Agreements')).toBeInTheDocument());
    });

    it('should render description', async () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      await waitFor(() =>
        expect(screen.getByText('Digital contracts for your rentals')).toBeInTheDocument()
      );
    });

    it('should display back button', async () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      await waitFor(() => expect(screen.getByText('Rental Agreements')).toBeInTheDocument());
      // Back button is an ArrowLeft icon button (no text label)
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('should display generate agreement section', async () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      await waitFor(() =>
        expect(screen.getByText('Generate Agreement from Booking')).toBeInTheDocument()
      );
    });
  });

  describe('Booking ID Form', () => {
    it('should display booking ID input', async () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      await waitFor(() =>
        expect(screen.getByPlaceholderText('Paste your booking ID')).toBeInTheDocument()
      );
    });

    it('should display special terms textarea', async () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      await waitFor(() =>
        expect(
          screen.getByPlaceholderText('Any additional terms for this rental...')
        ).toBeInTheDocument()
      );
    });

    it('should display generate button disabled when input empty', async () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /Generate Agreement/i })).toBeDisabled()
      );
    });

    it('should enable generate button when booking ID is entered', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      const input = await screen.findByPlaceholderText('Paste your booking ID');
      await user.type(input, 'booking-123');
      expect(screen.getByRole('button', { name: /Generate Agreement/i })).not.toBeDisabled();
    });

    it('should accept booking ID input', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      const input = (await screen.findByPlaceholderText(
        'Paste your booking ID'
      )) as HTMLInputElement;
      await user.type(input, 'abc-123');
      expect(input.value).toBe('abc-123');
    });

    it('should accept special terms input', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      const textarea = (await screen.findByPlaceholderText(
        'Any additional terms for this rental...'
      )) as HTMLTextAreaElement;
      await user.type(textarea, 'Custom terms');
      expect(textarea.value).toBe('Custom terms');
    });
  });

  describe('Agreements List', () => {
    it('should list agreements after loading', async () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      await waitFor(() =>
        expect(screen.getByText('CAT 320 Excavator')).toBeInTheDocument()
      );
      expect(screen.getByText('Sony A7IV Camera Kit')).toBeInTheDocument();
    });

    it('should display status badges', async () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      await waitFor(() =>
        expect(screen.getByText('Awaiting Signatures')).toBeInTheDocument()
      );
      expect(screen.getByText('Fully Signed')).toBeInTheDocument();
    });

    it('should display date ranges on agreements', async () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      await waitFor(() => expect(screen.getByText('CAT 320 Excavator')).toBeInTheDocument());
      const dateElements = screen.queryAllByText(/2026/);
      expect(dateElements.length).toBeGreaterThan(0);
    });

    it('should display total cost on agreements', async () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      await waitFor(() => expect(screen.getByText('CAT 320 Excavator')).toBeInTheDocument());
      const costElements = screen.queryAllByText(/\$[0-9,.]+/);
      expect(costElements.length).toBeGreaterThan(0);
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no agreements', async () => {
      mockChain.order.mockResolvedValue({ data: [], error: null });
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      await waitFor(() =>
        expect(
          screen.getByText('No agreements yet. Generate one from a booking above.')
        ).toBeInTheDocument()
      );
    });
  });

  describe('Protection Note', () => {
    it('should display protection note', async () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      await waitFor(() =>
        expect(
          screen.getByText(/Signed agreements provide legal protection/i)
        ).toBeInTheDocument()
      );
    });
  });

  describe('Navigation Callbacks', () => {
    it('should call onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      await waitFor(() => expect(screen.getByText('Rental Agreements')).toBeInTheDocument());
      // The back button is the first button in the header area
      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Agreement Detail View', () => {
    it('should show agreement detail when clicking an agreement', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      await waitFor(() => expect(screen.getByText('CAT 320 Excavator')).toBeInTheDocument());
      const card = screen.getByText('CAT 320 Excavator').closest('button');
      if (card) await user.click(card);
      await waitFor(() =>
        expect(screen.getByText('Rental Agreement')).toBeInTheDocument()
      );
    });

    it('should show download button in detail view', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      await waitFor(() => expect(screen.getByText('CAT 320 Excavator')).toBeInTheDocument());
      const card = screen.getByText('CAT 320 Excavator').closest('button');
      if (card) await user.click(card);
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /Download/i })).toBeInTheDocument()
      );
    });

    it('should show back to agreements button in detail view', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      await waitFor(() => expect(screen.getByText('CAT 320 Excavator')).toBeInTheDocument());
      const card = screen.getByText('CAT 320 Excavator').closest('button');
      if (card) await user.click(card);
      await waitFor(() =>
        expect(screen.getByText('Back to Agreements')).toBeInTheDocument()
      );
    });

    it('should show sign button for unsigned pending agreement', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      await waitFor(() => expect(screen.getByText('CAT 320 Excavator')).toBeInTheDocument());
      const card = screen.getByText('CAT 320 Excavator').closest('button');
      if (card) await user.click(card);
      await waitFor(() =>
        expect(screen.getByRole('button', { name: /Sign as/i })).toBeInTheDocument()
      );
    });
  });
});
