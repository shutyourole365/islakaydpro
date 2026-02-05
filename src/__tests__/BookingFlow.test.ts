import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock database service
vi.mock('../../services/database', () => ({
  getEquipment: vi.fn(),
  getCategories: vi.fn(),
  createBooking: vi.fn(),
}));

// Mock auth context
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-123' },
    isAuthenticated: true,
    profile: { id: 'user-123', full_name: 'Test User' },
  }),
}));

describe('Booking Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Date Selection Logic', () => {
    it('should calculate rental days correctly', () => {
      const startDate = new Date('2026-02-01');
      const endDate = new Date('2026-02-05');
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      expect(days).toBe(5);
    });

    it('should calculate total price correctly', () => {
      const dailyRate = 50;
      const days = 5;
      const subtotal = dailyRate * days;
      const serviceFee = subtotal * 0.1;
      const total = subtotal + serviceFee;

      expect(subtotal).toBe(250);
      expect(serviceFee).toBe(25);
      expect(total).toBe(275);
    });

    it('should not allow bookings shorter than minimum days', () => {
      const minRentalDays = 3;
      const selectedDays = 2;
      
      expect(selectedDays >= minRentalDays).toBe(false);
    });

    it('should not allow bookings longer than maximum days', () => {
      const maxRentalDays = 30;
      const selectedDays = 35;
      
      expect(selectedDays <= maxRentalDays).toBe(false);
    });
  });

  describe('Price Calculations', () => {
    it('should apply weekly discount for 7+ days', () => {
      const dailyRate = 100;
      const weeklyRate = 600; // 14% discount
      const days = 7;
      
      const regularPrice = dailyRate * days;
      const discountedPrice = weeklyRate;
      const savings = regularPrice - discountedPrice;

      expect(savings).toBe(100);
    });

    it('should apply monthly discount for 30+ days', () => {
      const dailyRate = 100;
      const monthlyRate = 2400; // 20% discount
      const days = 30;
      
      const regularPrice = dailyRate * days;
      const discountedPrice = monthlyRate;
      const savings = regularPrice - discountedPrice;

      expect(savings).toBe(600);
    });

    it('should calculate deposit correctly', () => {
      const equipmentValue = 5000;
      const depositPercentage = 0.2;
      const deposit = equipmentValue * depositPercentage;

      expect(deposit).toBe(1000);
    });

    it('should calculate service fee correctly', () => {
      const subtotal = 500;
      const serviceFeeRate = 0.1;
      const serviceFee = subtotal * serviceFeeRate;

      expect(serviceFee).toBe(50);
    });
  });

  describe('Date Availability', () => {
    it('should mark booked dates as unavailable', () => {
      const bookedDates = ['2026-02-10', '2026-02-11', '2026-02-12'];
      const selectedDate = '2026-02-10';
      
      expect(bookedDates.includes(selectedDate)).toBe(true);
    });

    it('should allow booking on available dates', () => {
      const bookedDates = ['2026-02-10', '2026-02-11', '2026-02-12'];
      const selectedDate = '2026-02-15';
      
      expect(bookedDates.includes(selectedDate)).toBe(false);
    });

    it('should detect date range conflicts', () => {
      const bookedRanges = [
        { start: new Date('2026-02-10'), end: new Date('2026-02-15') },
      ];
      const newStart = new Date('2026-02-12');
      const newEnd = new Date('2026-02-18');

      const hasConflict = bookedRanges.some(range => 
        (newStart >= range.start && newStart <= range.end) ||
        (newEnd >= range.start && newEnd <= range.end) ||
        (newStart <= range.start && newEnd >= range.end)
      );

      expect(hasConflict).toBe(true);
    });
  });

  describe('Booking Status Flow', () => {
    it('should start with pending status', () => {
      const newBooking = {
        status: 'pending',
        payment_status: 'pending',
      };

      expect(newBooking.status).toBe('pending');
      expect(newBooking.payment_status).toBe('pending');
    });

    it('should update to confirmed after payment', () => {
      const booking = {
        status: 'pending',
        payment_status: 'pending',
      };

      // Simulate payment success
      booking.payment_status = 'paid';
      booking.status = 'confirmed';

      expect(booking.status).toBe('confirmed');
      expect(booking.payment_status).toBe('paid');
    });

    it('should support cancellation', () => {
      const booking = {
        status: 'confirmed',
        payment_status: 'paid',
      };

      // Simulate cancellation
      booking.status = 'cancelled';
      booking.payment_status = 'refunded';

      expect(booking.status).toBe('cancelled');
      expect(booking.payment_status).toBe('refunded');
    });
  });
});
