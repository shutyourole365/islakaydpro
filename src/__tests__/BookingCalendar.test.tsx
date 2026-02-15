import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookingCalendar from '../components/booking/BookingCalendar';

describe('BookingCalendar', () => {
  const mockOnDateSelect = vi.fn();
  const defaultProps = {
    selectedStart: null,
    selectedEnd: null,
    onDateSelect: mockOnDateSelect,
    dailyRate: 100,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock current date to a fixed date for consistent tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-05'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render calendar with month and year', () => {
    render(<BookingCalendar {...defaultProps} />);
    
    expect(screen.getByText('February 2026')).toBeInTheDocument();
  });

  it('should render day names header', () => {
    render(<BookingCalendar {...defaultProps} />);
    
    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
  });

  it('should navigate to next month', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<BookingCalendar {...defaultProps} />);
    
    expect(screen.getByText('February 2026')).toBeInTheDocument();
    
    const nextButton = screen.getAllByRole('button').find(btn => 
      btn.querySelector('svg.lucide-chevron-right')
    );
    
    if (nextButton) {
      await user.click(nextButton);
    }
    
    expect(screen.getByText('March 2026')).toBeInTheDocument();
  });

  it('should select a start date when clicking a future date', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<BookingCalendar {...defaultProps} />);
    
    // Click on the 15th of the month
    const day15 = screen.getByRole('button', { name: '15' });
    await user.click(day15);
    
    expect(mockOnDateSelect).toHaveBeenCalledWith(
      expect.any(Date),
      null
    );
    
    const calledDate = mockOnDateSelect.mock.calls[0][0];
    expect(calledDate.getDate()).toBe(15);
  });

  it('should display selected start date', () => {
    const startDate = new Date('2026-02-15');
    render(
      <BookingCalendar 
        {...defaultProps} 
        selectedStart={startDate}
      />
    );
    
    expect(screen.getByText('Feb 15')).toBeInTheDocument();
  });

  it('should display date range when both dates selected', () => {
    const startDate = new Date('2026-02-15');
    const endDate = new Date('2026-02-20');
    render(
      <BookingCalendar 
        {...defaultProps} 
        selectedStart={startDate}
        selectedEnd={endDate}
      />
    );
    
    expect(screen.getByText('Feb 15')).toBeInTheDocument();
    expect(screen.getByText('Feb 20')).toBeInTheDocument();
  });

  it('should calculate total price correctly', () => {
    const startDate = new Date('2026-02-15');
    const endDate = new Date('2026-02-20');
    render(
      <BookingCalendar 
        {...defaultProps} 
        selectedStart={startDate}
        selectedEnd={endDate}
        dailyRate={50}
      />
    );
    
    // 6 days (Feb 15-20 inclusive) x $50 = $300
    expect(screen.getByText('$50 x 6 days')).toBeInTheDocument();
    expect(screen.getByText('$300')).toBeInTheDocument();
  });

  it('should clear dates when X button is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const startDate = new Date('2026-02-15');
    render(
      <BookingCalendar 
        {...defaultProps} 
        selectedStart={startDate}
      />
    );
    
    // Find the clear button (has X icon)
    const clearButton = screen.getAllByRole('button').find(btn =>
      btn.querySelector('svg.lucide-x')
    );
    
    if (clearButton) {
      await user.click(clearButton);
    }
    
    expect(mockOnDateSelect).toHaveBeenCalledWith(null, null);
  });

  it('should disable past dates', () => {
    render(<BookingCalendar {...defaultProps} />);
    
    // Day 1-4 of February 2026 are in the past (today is Feb 5)
    const pastDays = ['1', '2', '3', '4'];
    pastDays.forEach(day => {
      const dayButton = screen.getByRole('button', { name: day });
      expect(dayButton).toBeDisabled();
    });
  });

  it('should disable unavailable dates', () => {
    const unavailableDates = [
      new Date('2026-02-15'),
      new Date('2026-02-16'),
    ];
    
    render(
      <BookingCalendar 
        {...defaultProps} 
        unavailableDates={unavailableDates}
      />
    );
    
    const day15 = screen.getByRole('button', { name: '15' });
    const day16 = screen.getByRole('button', { name: '16' });
    
    expect(day15).toBeDisabled();
    expect(day16).toBeDisabled();
  });

  it('should enforce minimum rental days', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const startDate = new Date('2026-02-15');
    
    render(
      <BookingCalendar 
        {...defaultProps} 
        selectedStart={startDate}
        minRentalDays={3}
      />
    );
    
    // Try to select Feb 16 (only 2 days from start)
    const day16 = screen.getByRole('button', { name: '16' });
    await user.click(day16);
    
    // Should not complete selection (less than 3 days)
    expect(mockOnDateSelect).not.toHaveBeenCalledWith(startDate, expect.any(Date));
  });

  it('should enforce maximum rental days', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const startDate = new Date('2026-02-10');
    
    render(
      <BookingCalendar 
        {...defaultProps} 
        selectedStart={startDate}
        maxRentalDays={5}
      />
    );
    
    // Try to select Feb 20 (11 days from start)
    const day20 = screen.getByRole('button', { name: '20' });
    await user.click(day20);
    
    // Should not complete selection (exceeds 5 days)
    expect(mockOnDateSelect).not.toHaveBeenCalledWith(startDate, expect.any(Date));
  });

  it('should show legend items', () => {
    render(<BookingCalendar {...defaultProps} />);
    
    expect(screen.getByText('Selected')).toBeInTheDocument();
    expect(screen.getByText('In range')).toBeInTheDocument();
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });

  it('should reset selection when clicking date before current start', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const startDate = new Date('2026-02-20');
    
    render(
      <BookingCalendar 
        {...defaultProps} 
        selectedStart={startDate}
      />
    );
    
    // Click on a date before the start date
    const day10 = screen.getByRole('button', { name: '10' });
    await user.click(day10);
    
    // Should start new selection from the clicked date
    expect(mockOnDateSelect).toHaveBeenCalledWith(
      expect.any(Date),
      null
    );
    const calledDate = mockOnDateSelect.mock.calls[0][0];
    expect(calledDate.getDate()).toBe(10);
  });

  it('should render with custom className', () => {
    const { container } = render(
      <BookingCalendar {...defaultProps} className="custom-class" />
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should display single day text correctly', () => {
    const startDate = new Date('2026-02-15');
    const endDate = new Date('2026-02-15');
    render(
      <BookingCalendar 
        {...defaultProps} 
        selectedStart={startDate}
        selectedEnd={endDate}
        dailyRate={100}
      />
    );
    
    expect(screen.getByText('$100 x 1 day')).toBeInTheDocument();
  });

  it('should apply custom daily rate', () => {
    const startDate = new Date('2026-02-15');
    const endDate = new Date('2026-02-17');
    render(
      <BookingCalendar 
        {...defaultProps} 
        selectedStart={startDate}
        selectedEnd={endDate}
        dailyRate={75}
      />
    );
    
    // 3 days x $75 = $225
    expect(screen.getByText('$75 x 3 days')).toBeInTheDocument();
    expect(screen.getByText('$225')).toBeInTheDocument();
  });
});
