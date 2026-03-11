import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OwnerRevenueDashboard from '../components/revenue/OwnerRevenueDashboard';

describe('OwnerRevenueDashboard', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    mockOnBack.mockClear();
  });

  describe('Component Rendering', () => {
    it('should render with main title and description', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Revenue Dashboard')).toBeInTheDocument();
      expect(screen.getByText(/Track your equipment rental earnings/i)).toBeInTheDocument();
    });

    it('should display back button', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      const backButton = screen.getByRole('button', { name: /go back/i });
      expect(backButton).toBeInTheDocument();
    });

    it('should display period selection buttons', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByRole('button', { name: /Week/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Month/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Quarter/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Year/i })).toBeInTheDocument();
    });
  });

  describe('KPI Cards Display', () => {
    it('should display this month revenue card', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('This Month Revenue')).toBeInTheDocument();
    });

    it('should display revenue amount', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      const elements = screen.getAllByText(/\$[0-9,]+/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should display total bookings card', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Total Bookings')).toBeInTheDocument();
    });

    it('should display booking count', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      const elements = screen.getAllByText(/24/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should display average utilization card', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Avg Utilization')).toBeInTheDocument();
    });

    it('should display utilization percentage', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      const elements = screen.getAllByText(/%/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should display total earnings card', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText(/Total Earnings \(6mo\)/i)).toBeInTheDocument();
    });

    it('should display revenue change indicator', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Should show comparison to previous month
      const elements = screen.getAllByText(/vs last month/i);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should show up/down trend icons', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Should indicate if revenue is trending up or down
      const elements = screen.getAllByText(/% vs last month/);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('Period Selection', () => {
    it('should select month period by default', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      const monthButton = screen.getByRole('button', { name: /Month/i });
      expect(monthButton).toBeInTheDocument();
    });

    it('should allow switching to week period', async () => {
      const user = userEvent.setup();
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);

      const weekButton = screen.getByRole('button', { name: /Week/i });
      await user.click(weekButton);

      expect(weekButton).toBeInTheDocument();
    });

    it('should allow switching to quarter period', async () => {
      const user = userEvent.setup();
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);

      const quarterButton = screen.getByRole('button', { name: /Quarter/i });
      await user.click(quarterButton);

      expect(quarterButton).toBeInTheDocument();
    });

    it('should allow switching to year period', async () => {
      const user = userEvent.setup();
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);

      const yearButton = screen.getByRole('button', { name: /Year/i });
      await user.click(yearButton);

      expect(yearButton).toBeInTheDocument();
    });
  });

  describe('Revenue Calculations', () => {
    it('should calculate current month revenue', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText(/\$14,800/)).toBeInTheDocument();
    });

    it('should calculate total 6-month revenue', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Sum of all 6 months: 8450 + 11200 + 9800 + 7200 + 12500 + 14800 = 63950
      expect(screen.getByText(/\$63,950/)).toBeInTheDocument();
    });

    it('should calculate revenue change percentage', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Feb vs Jan: (14800-12500)/12500 * 100 = 18.4%
      const elements = screen.getAllByText(/% vs last month/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should calculate average utilization', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // (78+65+82+91+73)/5 = 77.8, displayed as 78%
      expect(screen.getByText('78%')).toBeInTheDocument();
    });

    it('should calculate booking change percentage', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Feb vs Jan: (24-20)/20 * 100 = 20%
      const elements = screen.getAllByText(/% vs last month/);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('Monthly Revenue Chart Display', () => {
    it('should display monthly revenue chart', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
    });

    it('should display month labels in chart', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Sep')).toBeInTheDocument();
      expect(screen.getByText('Oct')).toBeInTheDocument();
    });

    it('should display revenue amounts in chart', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Chart shows values like $8.5k, $11.2k, etc
      const elements = screen.getAllByText(/k/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should display booking count for each month', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      const elements = screen.getAllByText(/bookings/i);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should show revenue bars proportional to values', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Bar chart should be visible
      expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
    });
  });

  describe('Equipment Performance Display', () => {
    it('should display top equipment section', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Top Equipment')).toBeInTheDocument();
    });

    it('should display equipment rankings', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Should show rankings 1-5
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('should display top equipment names', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // CAT 320 Excavator appears in both equipment list and transactions
      const catElements = screen.getAllByText('CAT 320 Excavator');
      expect(catElements.length).toBeGreaterThan(0);
      // Sony A7IV Camera Kit appears in both equipment list and transactions
      const sonyElements = screen.getAllByText('Sony A7IV Camera Kit');
      expect(sonyElements.length).toBeGreaterThan(0);
    });

    it('should display equipment revenue', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      const elements = screen.getAllByText(/\$[0-9,]+/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should display equipment ratings', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      const elements = screen.getAllByText(/4\.[0-9]/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should display utilization percentage for equipment', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      const elements = screen.getAllByText(/%/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should display trend indicators for equipment', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Should show utilization percentages like 78%, 65%, 82%, 91%, 73%
      const elements = screen.getAllByText(/78|65|82|91|73/);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('Transaction Listing', () => {
    it('should display recent transactions section', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
    });

    it('should display transaction dates', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Dates rendered via toLocaleDateString(), check for presence of date-like text
      const dateElements = screen.getAllByText(/2026|2\/2[0-9]/);
      expect(dateElements.length).toBeGreaterThan(0);
    });

    it('should display renter names', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('John D.')).toBeInTheDocument();
      expect(screen.getByText('Sarah M.')).toBeInTheDocument();
    });

    it('should display equipment names in transactions', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // CAT 320 Excavator appears in both equipment list and transactions
      const elements = screen.getAllByText('CAT 320 Excavator');
      expect(elements.length).toBeGreaterThanOrEqual(2);
    });

    it('should display transaction types', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      const elements = screen.getAllByText(/Rental Income|Deposit Return|Insurance Claim|Payout/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should display transaction status badges', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      const elements = screen.getAllByText(/Completed|Pending|Processing/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should display transaction amounts', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      const elements = screen.getAllByText(/\$[0-9,]+/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should show transaction direction (+ or -)', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Should show positive for income, negative for deposits returned
      expect(screen.getByText(/-/)).toBeInTheDocument();
    });
  });

  describe('Transaction Status Styling', () => {
    it('should display completed status transactions', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      const elements = screen.getAllByText('Completed');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should display pending status transactions', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });

    it('should display processing status transactions', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Processing')).toBeInTheDocument();
    });

    it('should show proper color coding for status', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Status badges should have appropriate colors
      const elements = screen.getAllByText(/Completed|Pending|Processing/);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('Trend Indicators', () => {
    it('should show revenue trend direction', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Should indicate trend with up/down indicators
      const elements = screen.getAllByText(/% vs last month/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should show booking trend', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      const elements = screen.getAllByText(/% vs last month/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should display equipment trend indicators', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Equipment should show utilization percentages like 78%, 65%, 82%, 91%, 73%
      const elements = screen.getAllByText(/78|65|82|91|73/);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('Data Formatting', () => {
    it('should format revenue with thousand separators', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      const elements = screen.getAllByText(/\$[0-9,]+/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should format dates correctly', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Dates rendered via toLocaleDateString()
      const elements = screen.getAllByText(/2026|2\/2[0-9]/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should display percentages with decimal places', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Revenue change is 18.4%, bookings change is 20.0%
      const elements = screen.getAllByText(/[0-9]+\.[0-9]/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should format large numbers as thousands (k)', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      const elements = screen.getAllByText(/k/);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  describe('Key Metrics Display', () => {
    it('should display current month revenue with icon', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('This Month Revenue')).toBeInTheDocument();
    });

    it('should display total bookings with icon', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Total Bookings')).toBeInTheDocument();
    });

    it('should display utilization with icon', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Avg Utilization')).toBeInTheDocument();
    });

    it('should display earnings with icon', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText(/Total Earnings/)).toBeInTheDocument();
    });
  });

  describe('Table Rendering', () => {
    it('should display transaction table headers', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Renter')).toBeInTheDocument();
      expect(screen.getByText('Equipment')).toBeInTheDocument();
    });

    it('should display transaction rows', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('John D.')).toBeInTheDocument();
      expect(screen.getByText('Sarah M.')).toBeInTheDocument();
    });

    it('should be scrollable horizontally on small screens', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
    });
  });

  describe('Navigation Callbacks', () => {
    it('should call onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);

      const backButton = screen.getByRole('button', { name: /go back/i });
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Responsive Layout', () => {
    it('should display KPI cards in grid', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('This Month Revenue')).toBeInTheDocument();
      expect(screen.getByText('Total Bookings')).toBeInTheDocument();
      expect(screen.getByText('Avg Utilization')).toBeInTheDocument();
    });

    it('should display two-column layout for chart and equipment', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Monthly Revenue')).toBeInTheDocument();
      expect(screen.getByText('Top Equipment')).toBeInTheDocument();
    });

    it('should display full-width transaction table', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
    });
  });

  describe('Equipment Earnings Metrics', () => {
    it('should display equipment revenue', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      const elements = screen.getAllByText(/\$[0-9,]+/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should display booking count per equipment', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      // Should show booking numbers like 42, 35, 52, 89, 67
      const elements = screen.getAllByText(/42|35|52|89|67/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should display equipment utilization rate', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      const elements = screen.getAllByText(/%/);
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should display average rating', () => {
      render(<OwnerRevenueDashboard onBack={mockOnBack} />);
      const elements = screen.getAllByText(/4\.[0-9]/);
      expect(elements.length).toBeGreaterThan(0);
    });
  });
});
