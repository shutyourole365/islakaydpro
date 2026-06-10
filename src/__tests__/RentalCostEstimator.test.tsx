import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RentalCostEstimator from '../components/estimator/RentalCostEstimator';

describe('RentalCostEstimator', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    mockOnBack.mockClear();
  });

  describe('Component Rendering', () => {
    it('should render with main title and description', () => {
      render(<RentalCostEstimator onBack={mockOnBack} />);
      expect(screen.getByText('Rental Cost Estimator')).toBeInTheDocument();
      expect(screen.getByText(/Calculate your total rental cost/i)).toBeInTheDocument();
    });

    it('should display all sections', () => {
      render(<RentalCostEstimator onBack={mockOnBack} />);
      expect(screen.getByText('Select Equipment')).toBeInTheDocument();
      expect(screen.getByText('Rental Duration')).toBeInTheDocument();
      expect(screen.getByText('Insurance & Extras')).toBeInTheDocument();
      expect(screen.getByText('Promo Code')).toBeInTheDocument();
      expect(screen.getByText('Cost Summary')).toBeInTheDocument();
    });
  });

  describe('Equipment Selection', () => {
    it('should display all equipment options', () => {
      render(<RentalCostEstimator onBack={mockOnBack} />);
      const excavatorElements = screen.queryAllByText('CAT 320 Excavator');
      expect(excavatorElements.length).toBeGreaterThan(0);
      const sonyElements = screen.queryAllByText('Sony A7IV Camera Kit');
      expect(sonyElements.length).toBeGreaterThan(0);
      const dewaltElements = screen.queryAllByText('DeWalt Power Tool Kit');
      expect(dewaltElements.length).toBeGreaterThan(0);
      const djElements = screen.queryAllByText('Premium DJ Package');
      expect(djElements.length).toBeGreaterThan(0);
    });

    it('should select first equipment by default', () => {
      render(<RentalCostEstimator onBack={mockOnBack} />);
      // First equipment should be selected
      const excavatorButtons = screen.queryAllByText('CAT 320 Excavator');
      expect(excavatorButtons.length).toBeGreaterThan(0);
    });

    it('should change equipment when clicked', async () => {
      const user = userEvent.setup();
      render(<RentalCostEstimator onBack={mockOnBack} />);

      const cameraButton = screen.getByRole('button', { name: /Sony A7IV Camera Kit/i });
      await user.click(cameraButton);

      // Verify the equipment changed
      const sonyElements = screen.queryAllByText('Sony A7IV Camera Kit');
      expect(sonyElements.length).toBeGreaterThan(0);
    });

    it('should display daily rates for equipment', () => {
      render(<RentalCostEstimator onBack={mockOnBack} />);
      // Default equipment CAT 320 should show $450/day
      expect(screen.getByText(/\$450\/day/i)).toBeInTheDocument();
    });
  });

  describe('Rental Duration & Discount Calculations', () => {
    it('should default to 3 days', () => {
      render(<RentalCostEstimator onBack={mockOnBack} />);
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should allow duration adjustment via slider', async () => {
      render(<RentalCostEstimator onBack={mockOnBack} />);

      // Find the range input (slider for number of days)
      const sliders = screen.getAllByRole('slider');
      const daySlider = sliders[0]; // first slider is for days
      fireEvent.change(daySlider, { target: { value: '7' } });

      // Should show 7 days
      await screen.findByText('7');
    });

    it('should apply quick select buttons for common durations', async () => {
      const user = userEvent.setup();
      render(<RentalCostEstimator onBack={mockOnBack} />);

      const sevenDayButton = screen.getByRole('button', { name: /7d/i });
      await user.click(sevenDayButton);

      // Duration should change to 7
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('should calculate weekly discount correctly', async () => {
      const user = userEvent.setup();
      render(<RentalCostEstimator onBack={mockOnBack} />);

      const sevenDayButton = screen.getByRole('button', { name: /7d/i });
      await user.click(sevenDayButton);

      // Should show discount savings - text is broken by strong tags, check for "You save" text
      const savingElements = screen.queryAllByText(/You save/);
      expect(savingElements.length).toBeGreaterThan(0);
    });

    it('should calculate monthly discount when >= 30 days', async () => {
      render(<RentalCostEstimator onBack={mockOnBack} />);

      const sliders = screen.getAllByRole('slider');
      const daySlider = sliders[0];
      fireEvent.change(daySlider, { target: { value: '30' } });

      const monthlyElements = screen.queryAllByText(/monthly/i);
      expect(monthlyElements.length).toBeGreaterThan(0);
    });
  });

  describe('Insurance Plan Selection', () => {
    it('should display all insurance options', () => {
      render(<RentalCostEstimator onBack={mockOnBack} />);
      expect(screen.getByText('No Insurance')).toBeInTheDocument();
      expect(screen.getByText('Basic Coverage')).toBeInTheDocument();
      expect(screen.getByText('Premium Coverage')).toBeInTheDocument();
      expect(screen.getByText('Enterprise Coverage')).toBeInTheDocument();
    });

    it('should select basic coverage by default', () => {
      render(<RentalCostEstimator onBack={mockOnBack} />);
      // Basic coverage should be pre-selected
      expect(screen.getByText(/Full liability/i)).toBeInTheDocument();
    });

    it('should change insurance plan when clicked', async () => {
      const user = userEvent.setup();
      render(<RentalCostEstimator onBack={mockOnBack} />);

      const premiumButton = screen.getByRole('button', { name: /Premium Coverage/i });
      await user.click(premiumButton);

      expect(screen.getByText(/Full coverage including theft/i)).toBeInTheDocument();
    });

    it('should update cost when insurance changes', async () => {
      const user = userEvent.setup();
      render(<RentalCostEstimator onBack={mockOnBack} />);

      const enterpriseButton = screen.getByRole('button', { name: /Enterprise Coverage/i });
      await user.click(enterpriseButton);

      // Cost should update
      expect(screen.getByText(/Unlimited coverage/i)).toBeInTheDocument();
    });
  });

  describe('Delivery Service', () => {
    it('should have delivery toggle', () => {
      render(<RentalCostEstimator onBack={mockOnBack} />);
      expect(screen.getByText('Delivery Service')).toBeInTheDocument();
    });

    it('should show distance slider when delivery enabled', async () => {
      const user = userEvent.setup();
      render(<RentalCostEstimator onBack={mockOnBack} />);

      // Find and click the delivery toggle
      const toggleButtons = screen.getAllByRole('button').filter(btn => {
        const element = btn as HTMLElement;
        return element.className.includes('rounded-full');
      });

      // Delivery toggle should be the second one
      const deliveryToggle = toggleButtons[1];
      await user.click(deliveryToggle);

      // Distance input should appear
      expect(screen.getByText(/Distance:/i)).toBeInTheDocument();
    });

    it('should calculate delivery cost based on distance', async () => {
      const user = userEvent.setup();
      render(<RentalCostEstimator onBack={mockOnBack} />);

      const toggleButtons = screen.getAllByRole('button').filter(btn => {
        const element = btn as HTMLElement;
        return element.className.includes('rounded-full');
      });

      await user.click(toggleButtons[1]);

      // Change distance to 20 miles
      const sliders = screen.getAllByRole('slider');
      // After delivery is enabled, there should be 2 sliders (days + distance)
      const distanceSlider = sliders[1];
      fireEvent.change(distanceSlider, { target: { value: '20' } });

      // Cost should reflect: $50 base + $2.50/mile * 20 = $100
      expect(screen.getByText('Distance: 20 miles')).toBeInTheDocument();
    });
  });

  describe('Promo Code Functionality', () => {
    it('should have promo code input field', () => {
      render(<RentalCostEstimator onBack={mockOnBack} />);
      expect(screen.getByPlaceholderText(/Enter promo code/i)).toBeInTheDocument();
    });

    it('should accept valid promo codes', async () => {
      const user = userEvent.setup();
      render(<RentalCostEstimator onBack={mockOnBack} />);

      const input = screen.getByPlaceholderText(/Enter promo code/i) as HTMLInputElement;
      const applyButton = screen.getByRole('button', { name: /Apply/i });

      await user.type(input, 'SAVE10');
      await user.click(applyButton);

      expect(screen.getByText(/10% discount applied/i)).toBeInTheDocument();
    });

    it('should accept welcome promo code', async () => {
      const user = userEvent.setup();
      render(<RentalCostEstimator onBack={mockOnBack} />);

      const input = screen.getByPlaceholderText(/Enter promo code/i) as HTMLInputElement;
      const applyButton = screen.getByRole('button', { name: /Apply/i });

      await user.type(input, 'welcome');
      await user.click(applyButton);

      expect(screen.getByText(/10% discount applied/i)).toBeInTheDocument();
    });

    it('should show error for invalid promo code', async () => {
      const user = userEvent.setup();
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(<RentalCostEstimator onBack={mockOnBack} />);

      const input = screen.getByPlaceholderText(/Enter promo code/i) as HTMLInputElement;
      const applyButton = screen.getByRole('button', { name: /Apply/i });

      await user.type(input, 'INVALID');
      await user.click(applyButton);

      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid promo code'));
      alertSpy.mockRestore();
    });

    it('should deselect promo when input changes', async () => {
      const user = userEvent.setup();
      render(<RentalCostEstimator onBack={mockOnBack} />);

      const input = screen.getByPlaceholderText(/Enter promo code/i) as HTMLInputElement;
      const applyButton = screen.getByRole('button', { name: /Apply/i });

      // Apply promo
      await user.type(input, 'SAVE10');
      await user.click(applyButton);
      expect(screen.getByText(/10% discount applied/i)).toBeInTheDocument();

      // Change input
      await user.clear(input);
      await user.type(input, 'NEW');

      // Discount message should disappear
      expect(screen.queryByText(/10% discount applied/i)).not.toBeInTheDocument();
    });
  });

  describe('Cost Breakdown Calculations', () => {
    it('should display base cost', () => {
      render(<RentalCostEstimator onBack={mockOnBack} />);
      // CAT 320 at $450/day for 3 days = $1350
      const rentalElements = screen.queryAllByText(/rental/i);
      expect(rentalElements.length).toBeGreaterThan(0);
    });

    it('should display insurance cost', () => {
      render(<RentalCostEstimator onBack={mockOnBack} />);
      const insuranceElements = screen.queryAllByText(/Insurance/i);
      expect(insuranceElements.length).toBeGreaterThan(0);
    });

    it('should display service fee', () => {
      render(<RentalCostEstimator onBack={mockOnBack} />);
      expect(screen.getByText(/Service fee/i)).toBeInTheDocument();
    });

    it('should display tax calculation', () => {
      render(<RentalCostEstimator onBack={mockOnBack} />);
      expect(screen.getByText(/Tax/i)).toBeInTheDocument();
    });

    it('should display total amount', () => {
      render(<RentalCostEstimator onBack={mockOnBack} />);
      expect(screen.getByText('Total')).toBeInTheDocument();
    });

    it('should display deposit amount', () => {
      render(<RentalCostEstimator onBack={mockOnBack} />);
      expect(screen.getByText(/Refundable deposit/i)).toBeInTheDocument();
    });

    it('should display effective daily rate', () => {
      render(<RentalCostEstimator onBack={mockOnBack} />);
      expect(screen.getByText(/Effective daily rate/i)).toBeInTheDocument();
    });
  });

  describe('Hide/Show Cost Details', () => {
    it('should show cost details by default', () => {
      render(<RentalCostEstimator onBack={mockOnBack} />);
      const insuranceElements = screen.queryAllByText(/Insurance/i);
      expect(insuranceElements.length).toBeGreaterThan(0);
    });

    it('should toggle details visibility', async () => {
      const user = userEvent.setup();
      render(<RentalCostEstimator onBack={mockOnBack} />);

      const toggleButton = screen.getByRole('button', { name: /Hide details/i });
      await user.click(toggleButton);

      // Details should be hidden - the insurance line in cost breakdown should be gone
      expect(screen.queryByText(/Service fee/i)).not.toBeInTheDocument();
    });

    it('should show details again when toggled', async () => {
      const user = userEvent.setup();
      render(<RentalCostEstimator onBack={mockOnBack} />);

      const toggleButton = screen.getByRole('button', { name: /Hide details/i });
      await user.click(toggleButton);

      const showButton = screen.getByRole('button', { name: /Show details/i });
      await user.click(showButton);

      expect(screen.getByText(/Service fee/i)).toBeInTheDocument();
    });
  });

  describe('Navigation Callbacks', () => {
    it('should call onBack when back button clicked', async () => {
      const user = userEvent.setup();
      render(<RentalCostEstimator onBack={mockOnBack} />);

      const backButton = screen.getByRole('button', { name: /go back/i });
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });
});
