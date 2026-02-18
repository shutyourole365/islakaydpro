import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MultiPaymentSystem from '../components/payments/MultiPaymentSystem';

describe('MultiPaymentSystem', () => {
  const mockOnPaymentComplete = vi.fn(async (_: any) => Promise.resolve());
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders payment summary and pays with default card', async () => {
    const user = userEvent.setup();

    render(
      <MultiPaymentSystem
        bookingId="bk-1"
        totalAmount={600}
        depositAmount={100}
        onPaymentComplete={mockOnPaymentComplete}
        onClose={mockOnClose}
      />
    );

    // Summary shows rental total (total - deposit) and deposit
    expect(screen.getByText('$500.00')).toBeInTheDocument(); // rental total
    expect(screen.getByText('$100.00')).toBeInTheDocument(); // deposit

    // Pay with default card (selected by default)
    const payButton = screen.getByRole('button', { name: /Pay \$/i });
    await user.click(payButton);

    await waitFor(() => expect(mockOnPaymentComplete).toHaveBeenCalled());
    const payload = mockOnPaymentComplete.mock.calls[0][0];
    expect(payload.method).toBe('card');
    expect(payload.amount).toBe(600);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('applies PayPal fee when PayPal is selected', async () => {
    const user = userEvent.setup();

    render(
      <MultiPaymentSystem
        bookingId="bk-2"
        totalAmount={200}
        depositAmount={0}
        onPaymentComplete={mockOnPaymentComplete}
        onClose={mockOnClose}
      />
    );

    // Select PayPal option
    const paypalBtn = screen.getByText(/PayPal/i).closest('button');
    expect(paypalBtn).toBeTruthy();
    await user.click(paypalBtn as HTMLElement);

    // PayPal fee row appears
    expect(screen.getByText(/PayPal Fee \(2.5%\)/i)).toBeInTheDocument();

    // Total should include fee (200 * 1.025 = 205.00)
    expect(screen.getByText('$205.00')).toBeInTheDocument();

    // Click pay
    const payButton = screen.getByRole('button', { name: /Pay \$/i });
    await user.click(payButton);

    await waitFor(() => expect(mockOnPaymentComplete).toHaveBeenCalled());
    const payload = mockOnPaymentComplete.mock.calls[0][0];
    expect(payload.method).toBe('paypal');
    expect(payload.amount).toBe(200);
  });

  it('shows installment configuration and sends correct payload', async () => {
    const user = userEvent.setup();

    render(
      <MultiPaymentSystem
        bookingId="bk-3"
        totalAmount={1200}
        depositAmount={0}
        onPaymentComplete={mockOnPaymentComplete}
        onClose={mockOnClose}
      />
    );

    // Select 'Pay in Installments' (available since totalAmount >= 500)
    const installmentBtn = screen.getByText(/Pay in Installments/i).closest('button');
    expect(installmentBtn).toBeTruthy();
    await user.click(installmentBtn as HTMLElement);

    // Installment UI should appear
    expect(screen.getByText(/Configure Payment Plan/i)).toBeInTheDocument();

    // Change number of payments slider to 6
    const range = screen.getByRole('slider') as HTMLInputElement;
    fireEvent.change(range, { target: { value: '6' } });

    // Amount per payment should update (1200 / 6 = 200)
    expect(screen.getByText(/\$200\.00/)).toBeInTheDocument();

    // Click Pay
    const payButton = screen.getByRole('button', { name: /Pay \$/i });
    await user.click(payButton);

    await waitFor(() => expect(mockOnPaymentComplete).toHaveBeenCalled());
    const payload = mockOnPaymentComplete.mock.calls[0][0];
    expect(payload.method).toBe('installments');
    expect(payload.installmentPlan).toBeTruthy();
    expect(payload.installmentPlan.payments).toBe(6);
    expect(Number(payload.installmentPlan.amountPerPayment.toFixed(2))).toBeCloseTo(200);
  });
});
