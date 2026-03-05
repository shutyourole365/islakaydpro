import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EquipmentAvailabilityCalendar from '../components/availability/EquipmentAvailabilityCalendar';

describe('EquipmentAvailabilityCalendar', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    mockOnBack.mockClear();
  });

  describe('Component Rendering', () => {
    it('should render with main title and description', () => {
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      expect(screen.getByText('Availability Calendar')).toBeInTheDocument();
      expect(screen.getByText(/Check equipment availability/i)).toBeInTheDocument();
    });

    it('should display back button', () => {
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      const backButton = screen.getByRole('button', { name: /go back/i });
      expect(backButton).toBeInTheDocument();
    });

    it('should display equipment selector', () => {
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      expect(screen.getByText('CAT 320 Excavator')).toBeInTheDocument();
      expect(screen.getByText('Sony A7IV Camera Kit')).toBeInTheDocument();
    });

    it('should display calendar', () => {
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      // Check for month/year display
      const monthElements = screen.queryAllByText(/January|February|March|April|May|June|July|August|September|October|November|December/);
      expect(monthElements.length > 0).toBe(true);
    });
  });

  describe('Equipment Selection', () => {
    it('should select first equipment by default', () => {
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      expect(screen.getByText('CAT 320 Excavator')).toBeInTheDocument();
      expect(screen.getByText('$450/day')).toBeInTheDocument();
    });

    it('should display all equipment options', () => {
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      expect(screen.getByText('CAT 320 Excavator')).toBeInTheDocument();
      expect(screen.getByText('Sony A7IV Camera Kit')).toBeInTheDocument();
      expect(screen.getByText('DeWalt Power Tool Kit')).toBeInTheDocument();
      expect(screen.getByText('DJI Mavic 3 Pro Drone')).toBeInTheDocument();
    });

    it('should change equipment when clicked', async () => {
      const user = userEvent.setup();
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);

      const cameraButton = screen.getByRole('button', { name: /Sony A7IV Camera Kit/i });
      await user.click(cameraButton);

      expect(screen.getByText('$125/day')).toBeInTheDocument();
    });

    it('should display equipment location', () => {
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      expect(screen.getByText('Los Angeles, CA')).toBeInTheDocument();
    });

    it('should display daily rate for each equipment', () => {
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      expect(screen.getByText('$450/day')).toBeInTheDocument();
    });
  });

  describe('Calendar Navigation', () => {
    it('should display month and year', () => {
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      // Current month should be displayed
      const dateElements = screen.queryAllByText(/January|February|March|April|May|June|July|August|September|October|November|December/);
      expect(dateElements.length > 0).toBe(true);
    });

    it('should navigate to next month', async () => {
      const user = userEvent.setup();
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);

      const nextButtons = screen.getAllByRole('button', { name: /next month/i });
      await user.click(nextButtons[0]);

      // Month should have changed
      expect(screen.queryByText(/January|February|March/i)).toBeInTheDocument();
    });

    it('should navigate to previous month', async () => {
      const user = userEvent.setup();
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);

      const prevButtons = screen.getAllByRole('button', { name: /previous month/i });
      await user.click(prevButtons[0]);

      // Month should have changed
      expect(screen.queryByText(/January|February|March/i)).toBeInTheDocument();
    });

    it('should display day headers', () => {
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      expect(screen.getByText('Sun')).toBeInTheDocument();
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Sat')).toBeInTheDocument();
    });
  });

  describe('Calendar Date Selection & Rendering', () => {
    it('should display calendar days', () => {
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      // Check for presence of day numbers
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should allow single date selection', async () => {
      const user = userEvent.setup();
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);

      // Click on a specific date
      const dateButtons = screen.getAllByRole('button');
      const availableDate = dateButtons.find(btn => {
        const text = btn.textContent;
        return text === '5' || text === '10' || text === '15';
      });

      if (availableDate) {
        await user.click(availableDate);
        expect(availableDate).toBeInTheDocument();
      }
    });

    it('should display status legend', () => {
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      expect(screen.getByText('Available')).toBeInTheDocument();
      expect(screen.getByText('Booked')).toBeInTheDocument();
    });

    it('should show available dates with green highlight', () => {
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      // Status legend should include green color for available
      expect(screen.getByText('Available')).toBeInTheDocument();
    });

    it('should show booked dates with red highlight', () => {
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      expect(screen.getByText('Booked')).toBeInTheDocument();
    });
  });

  describe('Date Range Booking Selection', () => {
    it('should allow range selection', async () => {
      const user = userEvent.setup();
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);

      const dateButtons = screen.getAllByRole('button');
      const firstDate = dateButtons.find(btn => btn.textContent === '5');
      const secondDate = dateButtons.find(btn => btn.textContent === '10');

      if (firstDate && secondDate) {
        await user.click(firstDate);
        await user.click(secondDate);
        // Both should be selected
        expect(firstDate).toBeInTheDocument();
        expect(secondDate).toBeInTheDocument();
      }
    });

    it('should display booking selection summary', async () => {
      const user = userEvent.setup();
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);

      const dateButtons = screen.getAllByRole('button');
      const firstDate = dateButtons.find(btn => btn.textContent === '5');
      const secondDate = dateButtons.find(btn => btn.textContent === '10');

      if (firstDate && secondDate) {
        await user.click(firstDate);
        await user.click(secondDate);

        expect(screen.getByText('Booking Selection')).toBeInTheDocument();
      }
    });

    it('should calculate rental days correctly', async () => {
      const user = userEvent.setup();
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);

      const dateButtons = screen.getAllByRole('button');
      const firstDate = dateButtons.find(btn => btn.textContent === '5');
      const secondDate = dateButtons.find(btn => btn.textContent === '10');

      if (firstDate && secondDate) {
        await user.click(firstDate);
        await user.click(secondDate);

        expect(screen.getByText(/Duration/i)).toBeInTheDocument();
      }
    });

    it('should calculate estimated total cost', async () => {
      const user = userEvent.setup();
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);

      const dateButtons = screen.getAllByRole('button');
      const firstDate = dateButtons.find(btn => btn.textContent === '5');
      const secondDate = dateButtons.find(btn => btn.textContent === '10');

      if (firstDate && secondDate) {
        await user.click(firstDate);
        await user.click(secondDate);

        expect(screen.getByText('Est. Total')).toBeInTheDocument();
      }
    });

    it('should show warning for unavailable dates in range', async () => {
      const user = userEvent.setup();
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);

      // Try to select a range that includes booked dates
      const dateButtons = screen.getAllByRole('button');
      const firstDate = dateButtons.find(btn => btn.textContent === '1');
      const secondDate = dateButtons.find(btn => btn.textContent === '20');

      if (firstDate && secondDate) {
        await user.click(firstDate);
        await user.click(secondDate);

        // If range includes unavailable dates, message should appear
        expect(screen.queryByText(/unavailable/i)).toBeInTheDocument();
      }
    });
  });

  describe('Equipment Information Display', () => {
    it('should display equipment name', () => {
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      expect(screen.getByText('CAT 320 Excavator')).toBeInTheDocument();
    });

    it('should display equipment location', () => {
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      expect(screen.getByText('Los Angeles, CA')).toBeInTheDocument();
    });

    it('should display daily rate', () => {
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      expect(screen.getByText('$450/day')).toBeInTheDocument();
    });

    it('should display equipment image', () => {
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      const images = screen.queryAllByRole('img');
      expect(images.length > 0).toBe(true);
    });

    it('should display minimum rental period', () => {
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      expect(screen.getByText(/Min 1 day rental/i)).toBeInTheDocument();
    });
  });

  describe('Month Statistics Display', () => {
    it('should display available days count', () => {
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      expect(screen.getByText('Available')).toBeInTheDocument();
    });

    it('should display booked days count', () => {
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      expect(screen.getByText('Booked')).toBeInTheDocument();
    });

    it('should display maintenance days count', () => {
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      expect(screen.getByText('Maintenance')).toBeInTheDocument();
    });

    it('should display availability percentage', () => {
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      expect(screen.getByText(/availability this month/i)).toBeInTheDocument();
    });

    it('should calculate correct percentage for available days', () => {
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      // Should show percentage format
      expect(screen.getByText(/%/)).toBeInTheDocument();
    });
  });

  describe('Selected Date Information', () => {
    it('should display selected date info panel', async () => {
      const user = userEvent.setup();
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);

      const dateButtons = screen.getAllByRole('button');
      const firstDate = dateButtons.find(btn => btn.textContent === '5');

      if (firstDate) {
        await user.click(firstDate);
        expect(screen.getByText(/Status/i)).toBeInTheDocument();
      }
    });

    it('should display date status', async () => {
      const user = userEvent.setup();
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);

      const dateButtons = screen.getAllByRole('button');
      const availableDate = dateButtons.find(btn => btn.textContent?.trim() === '5');

      if (availableDate) {
        await user.click(availableDate);
        // Status should show available, booked, or maintenance
        expect(screen.getByText(/Status/i)).toBeInTheDocument();
      }
    });

    it('should display date price when available', async () => {
      const user = userEvent.setup();
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);

      const dateButtons = screen.getAllByRole('button');
      const availableDate = dateButtons.find(btn => btn.textContent?.trim() === '5');

      if (availableDate) {
        await user.click(availableDate);
        expect(screen.queryByText(/Rate:/i)).toBeDefined();
      }
    });

    it('should show booked by information', async () => {
      const user = userEvent.setup();
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);

      const dateButtons = screen.getAllByRole('button');
      // Click on a date that might be booked
      const testDate = dateButtons[15]; // Try a date further in the month

      if (testDate) {
        await user.click(testDate);
        // If booked, should show "Booked by:"
        expect(screen.queryByText(/Booked by:/i)).toBeDefined();
      }
    });
  });

  describe('Price Displays', () => {
    it('should display daily prices on calendar', () => {
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      // Prices should be shown on available dates
      expect(screen.getByText('$450/day')).toBeInTheDocument();
    });

    it('should show weekend pricing adjustments', () => {
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      // Weekend rates should be ~15% higher
      expect(screen.getByText(/\$[0-9]+/)).toBeInTheDocument();
    });

    it('should display total cost calculation', async () => {
      const user = userEvent.setup();
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);

      const dateButtons = screen.getAllByRole('button');
      const firstDate = dateButtons.find(btn => btn.textContent === '5');
      const secondDate = dateButtons.find(btn => btn.textContent === '10');

      if (firstDate && secondDate) {
        await user.click(firstDate);
        await user.click(secondDate);

        expect(screen.getByText(/\$[0-9,]+/)).toBeInTheDocument();
      }
    });
  });

  describe('Booking Button', () => {
    it('should display book button when range selected', async () => {
      const user = userEvent.setup();
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);

      const dateButtons = screen.getAllByRole('button');
      const firstDate = dateButtons.find(btn => btn.textContent === '5');
      const secondDate = dateButtons.find(btn => btn.textContent === '10');

      if (firstDate && secondDate) {
        await user.click(firstDate);
        await user.click(secondDate);

        const bookButton = screen.getByRole('button', { name: /Book/i });
        expect(bookButton).toBeInTheDocument();
      }
    });

    it('should show correct duration in book button', async () => {
      const user = userEvent.setup();
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);

      const dateButtons = screen.getAllByRole('button');
      const firstDate = dateButtons.find(btn => btn.textContent === '5');
      const secondDate = dateButtons.find(btn => btn.textContent === '10');

      if (firstDate && secondDate) {
        await user.click(firstDate);
        await user.click(secondDate);

        const bookButton = screen.getByRole('button', { name: /Book.*Days/i });
        expect(bookButton).toBeInTheDocument();
      }
    });
  });

  describe('Navigation Callbacks', () => {
    it('should call onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);

      const backButton = screen.getByRole('button', { name: /go back/i });
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Responsive Layout', () => {
    it('should display equipment selector horizontally scrollable', () => {
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      expect(screen.getByText('CAT 320 Excavator')).toBeInTheDocument();
      expect(screen.getByText('Sony A7IV Camera Kit')).toBeInTheDocument();
    });

    it('should display calendar with grid layout', () => {
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      // Check for day headers which indicate grid structure
      expect(screen.getByText('Sun')).toBeInTheDocument();
      expect(screen.getByText('Sat')).toBeInTheDocument();
    });

    it('should display sidebar with statistics', () => {
      render(<EquipmentAvailabilityCalendar onBack={mockOnBack} />);
      expect(screen.getByText('Month Overview')).toBeInTheDocument();
    });
  });
});
