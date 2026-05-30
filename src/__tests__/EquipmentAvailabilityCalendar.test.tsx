import type { ReactElement } from 'react';
import type { Mock } from 'vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render as rtlRender, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EquipmentAvailabilityCalendar from '../components/availability/EquipmentAvailabilityCalendar';
import { ToastProvider } from '../components/ui/Toast';
import {
  getEquipment,
  getEquipmentAvailability,
  blockDates,
  unblockDates,
} from '../services/database';

// The component uses useToast — wrap every render in ToastProvider.
const render = (ui: ReactElement) =>
  rtlRender(<ToastProvider>{ui}</ToastProvider>);

// Reconfigurable auth state so individual tests can simulate
// logged-out / logged-in owners.
const authState: { user: { id: string } | null } = { user: { id: 'owner-1' } };
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('../services/database', () => ({
  getEquipment: vi.fn(),
  getEquipmentAvailability: vi.fn(),
  blockDates: vi.fn(),
  unblockDates: vi.fn(),
}));

const mockEquipment = [
  { id: 'eq-1', title: 'Test Excavator', location: 'Denver, CO', daily_rate: 200, images: ['https://example.com/a.jpg'] },
  { id: 'eq-2', title: 'Test Camera', location: 'Austin, TX', daily_rate: 90, images: ['https://example.com/b.jpg'] },
];

const getEquipmentMock = getEquipment as unknown as Mock;
const getAvailabilityMock = getEquipmentAvailability as unknown as Mock;
const blockDatesMock = blockDates as unknown as Mock;
const unblockDatesMock = unblockDates as unknown as Mock;

const mockOnBack = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  authState.user = { id: 'owner-1' };
  getEquipmentMock.mockResolvedValue({ data: mockEquipment, count: mockEquipment.length });
  getAvailabilityMock.mockResolvedValue([]);
  blockDatesMock.mockResolvedValue(undefined);
  unblockDatesMock.mockResolvedValue(undefined);
});

// Render and wait for the owner's equipment to load.
const renderLoaded = async () => {
  render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
  await screen.findAllByText('Test Excavator');
};

// Find a calendar day cell by its day number. Day buttons render the number
// (optionally followed by a "$price"), so anchor the match to avoid e.g. "1"
// matching "10".
const dayButton = (n: number) =>
  screen
    .getAllByRole('button')
    .find((b) => new RegExp(`^${n}(\\$|$)`).test((b.textContent || '').trim()));

describe('EquipmentAvailabilityCalendar', () => {
  describe('Empty states', () => {
    it('prompts logged-out users to sign in (no fabricated equipment)', async () => {
      authState.user = null;
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      expect(await screen.findByText(/Sign in to manage availability/i)).toBeInTheDocument();
      // None of the old hardcoded demo equipment should appear.
      expect(screen.queryByText('CAT 320 Excavator')).not.toBeInTheDocument();
    });

    it('shows an empty state for an owner with no listings', async () => {
      getEquipmentMock.mockResolvedValue({ data: [], count: 0 });
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      expect(await screen.findByText(/No equipment to manage yet/i)).toBeInTheDocument();
    });

    it('does not query availability when there is no equipment', async () => {
      getEquipmentMock.mockResolvedValue({ data: [], count: 0 });
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      await screen.findByText(/No equipment to manage yet/i);
      expect(getAvailabilityMock).not.toHaveBeenCalled();
    });
  });

  describe('Component rendering (owner with equipment)', () => {
    it('renders the title and description', async () => {
      await renderLoaded();
      expect(screen.getByText('Availability Calendar')).toBeInTheDocument();
      expect(screen.getByText(/Check equipment availability/i)).toBeInTheDocument();
    });

    it('renders the back button', async () => {
      await renderLoaded();
      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
    });

    it('renders the current month and year', async () => {
      await renderLoaded();
      const months = screen.queryAllByText(
        /January|February|March|April|May|June|July|August|September|October|November|December/
      );
      expect(months.length).toBeGreaterThan(0);
    });

    it('renders day-of-week headers', async () => {
      await renderLoaded();
      expect(screen.getByText('Sun')).toBeInTheDocument();
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Sat')).toBeInTheDocument();
    });
  });

  describe('Equipment selection', () => {
    it('lists the owner real equipment in the selector', async () => {
      await renderLoaded();
      expect(screen.getAllByText('Test Excavator').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Test Camera').length).toBeGreaterThan(0);
    });

    it('selects the first equipment by default and shows its rate', async () => {
      await renderLoaded();
      expect(screen.getAllByText('$200/day').length).toBeGreaterThan(0);
      expect(screen.getByText('Denver, CO')).toBeInTheDocument();
    });

    it('switches equipment when another option is clicked', async () => {
      const user = userEvent.setup();
      await renderLoaded();
      await user.click(screen.getByRole('button', { name: /Test Camera/i }));
      await waitFor(() => {
        expect(screen.getAllByText('$90/day').length).toBeGreaterThan(0);
      });
    });
  });

  describe('Calendar navigation', () => {
    it('navigates to the next month', async () => {
      const user = userEvent.setup();
      await renderLoaded();
      await user.click(screen.getByRole('button', { name: /next month/i }));
      expect(
        screen.queryByText(
          /January|February|March|April|May|June|July|August|September|October|November|December/i
        )
      ).toBeInTheDocument();
    });

    it('navigates to the previous month', async () => {
      const user = userEvent.setup();
      await renderLoaded();
      await user.click(screen.getByRole('button', { name: /previous month/i }));
      expect(
        screen.queryByText(
          /January|February|March|April|May|June|July|August|September|October|November|December/i
        )
      ).toBeInTheDocument();
    });

    it('renders day-number cells', async () => {
      await renderLoaded();
      expect(dayButton(1)).toBeTruthy();
      expect(dayButton(15)).toBeTruthy();
    });
  });

  describe('Date selection', () => {
    it('shows the selected-date info panel with an Available status', async () => {
      const user = userEvent.setup();
      await renderLoaded();
      const day = dayButton(12);
      expect(day).toBeTruthy();
      await user.click(day!);
      // The info panel renders the status badge text directly.
      await waitFor(() => {
        expect(screen.getAllByText(/Available/i).length).toBeGreaterThan(0);
      });
    });

    it('builds a booking selection summary for a date range', async () => {
      const user = userEvent.setup();
      await renderLoaded();
      await user.click(dayButton(10)!);
      await user.click(dayButton(13)!);
      await waitFor(() => {
        expect(screen.getByText('Booking Selection')).toBeInTheDocument();
        expect(screen.getByText('Est. Total')).toBeInTheDocument();
      });
    });
  });

  describe('Month statistics', () => {
    it('shows the month overview with status labels', async () => {
      await renderLoaded();
      expect(screen.getByText('Month Overview')).toBeInTheDocument();
      expect(screen.getAllByText('Available').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Booked').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Maintenance').length).toBeGreaterThan(0);
    });

    it('shows an availability percentage', async () => {
      await renderLoaded();
      expect(screen.getByText(/availability this month/i)).toBeInTheDocument();
      expect(screen.getByText(/%/)).toBeInTheDocument();
    });

    it('shows the status legend', async () => {
      await renderLoaded();
      expect(screen.getAllByText('Blocked').length).toBeGreaterThan(0);
    });
  });

  describe('Availability data wiring', () => {
    it('queries real availability for the selected equipment', async () => {
      await renderLoaded();
      await waitFor(() => {
        expect(getAvailabilityMock).toHaveBeenCalledWith(
          'eq-1',
          expect.any(String),
          expect.any(String)
        );
      });
    });

    it('merges real booked ranges instead of inventing them', async () => {
      // Build a booked range squarely inside the generated window (today±).
      const d = new Date();
      const iso = (offset: number) => {
        const x = new Date(d);
        x.setDate(x.getDate() + offset);
        return x.toISOString().split('T')[0];
      };
      getAvailabilityMock.mockResolvedValue([
        { start_date: iso(1), end_date: iso(2), reason: 'booked' },
      ]);
      await renderLoaded();
      // No fabricated renter names should ever appear.
      expect(screen.queryByText(/John D\.|Sarah M\.|Past Renter/)).not.toBeInTheDocument();
    });
  });

  describe('Blocking dates', () => {
    it('calls blockDates when an available range is blocked', async () => {
      const user = userEvent.setup();
      await renderLoaded();
      await user.click(dayButton(10)!);
      await user.click(dayButton(13)!);
      const blockBtn = await screen.findByRole('button', { name: /Block \d+ Days/i });
      await user.click(blockBtn);
      await waitFor(() => {
        expect(blockDatesMock).toHaveBeenCalled();
      });
    });
  });

  describe('Navigation callbacks', () => {
    it('calls onBack when the back button is clicked', async () => {
      const user = userEvent.setup();
      await renderLoaded();
      await user.click(screen.getByRole('button', { name: /go back/i }));
      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });
});
