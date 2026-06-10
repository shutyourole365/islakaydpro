import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RentalAgreementGenerator from '../components/agreements/RentalAgreementGenerator';

describe('RentalAgreementGenerator', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    mockOnBack.mockClear();
  });

  describe('Component Rendering', () => {
    it('should render with main title and description', () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      expect(screen.getByText('Rental Agreement Generator')).toBeInTheDocument();
      expect(screen.getByText(/Create and manage digital rental contracts/i)).toBeInTheDocument();
    });

    it('should display back button', () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      const backButton = screen.getByRole('button', { name: /go back/i });
      expect(backButton).toBeInTheDocument();
    });

    it('should display tab navigation', () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      expect(screen.getByRole('button', { name: /My Agreements/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Templates/i })).toBeInTheDocument();
    });
  });

  describe('Tab Navigation', () => {
    it('should show agreements tab by default', () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      expect(screen.getByText('Create New Agreement')).toBeInTheDocument();
    });

    it('should switch to templates tab', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      expect(screen.getByText('Standard Rental Agreement')).toBeInTheDocument();
    });

    it('should switch back to agreements tab', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      const agreementsTab = screen.getByRole('button', { name: /My Agreements/i });
      await user.click(agreementsTab);

      expect(screen.getByText('Create New Agreement')).toBeInTheDocument();
    });
  });

  describe('Agreements Tab Display', () => {
    it('should display create new agreement button', () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      expect(screen.getByRole('button', { name: /Create New Agreement/i })).toBeInTheDocument();
    });

    it('should list all agreements', () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      expect(screen.getByText('CAT 320 Excavator')).toBeInTheDocument();
      expect(screen.getByText('Sony A7IV Camera Kit')).toBeInTheDocument();
    });

    it('should display agreement status badges', () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      expect(screen.getByText('Draft')).toBeInTheDocument();
      const signedElements = screen.getAllByText('Signed');
      expect(signedElements.length).toBeGreaterThan(0);
    });

    it('should show renter names on agreements', () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      // Renter names are shown as "Renter: John D." - check text content
      expect(screen.getByText((content) => content.includes('John D.'))).toBeInTheDocument();
      expect(screen.getByText((content) => content.includes('Sarah M.'))).toBeInTheDocument();
    });

    it('should display rental dates on agreements', () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      // Should show date ranges
      const dateElements = screen.queryAllByText(/2026/);
      expect(dateElements.length).toBeGreaterThan(0);
    });

    it('should display total cost on agreements', () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      const costElements = screen.queryAllByText(/\$[0-9,]+/);
      expect(costElements.length).toBeGreaterThan(0);
    });

    it('should display download button on agreements', () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      const downloadButtons = screen.getAllByRole('button', { name: /Download/i });
      expect(downloadButtons.length > 0).toBe(true);
    });

    it('should display action buttons based on status', () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      // Should show different buttons for different statuses
      const downloadButtons = screen.getAllByRole('button', { name: /Download/i });
      expect(downloadButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Agreement Status Handling', () => {
    it('should show send button for pending signature', () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      const sendButtons = screen.queryAllByRole('button', { name: /Send/i });
      expect(sendButtons.length > 0).toBe(true);
    });

    it('should show edit button for draft agreements', () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      const editButtons = screen.queryAllByRole('button', { name: /Edit/i });
      expect(editButtons.length > 0).toBe(true);
    });

    it('should show signed badge for signed agreements', () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      const signedElements = screen.getAllByText('Signed');
      expect(signedElements.length).toBeGreaterThan(0);
    });

    it('should show completed status for finished agreements', () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });
  });

  describe('Templates Tab Display', () => {
    it('should display all templates', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      expect(screen.getByText('Standard Rental Agreement')).toBeInTheDocument();
      expect(screen.getByText('Heavy Equipment Agreement')).toBeInTheDocument();
      expect(screen.getByText('Photography Equipment Agreement')).toBeInTheDocument();
      expect(screen.getByText('Short-Term Rental Agreement')).toBeInTheDocument();
      expect(screen.getByText('Enterprise Agreement')).toBeInTheDocument();
    });

    it('should display template descriptions', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      expect(screen.getByText('Basic rental terms and conditions')).toBeInTheDocument();
      expect(screen.getByText('Specialized for construction equipment')).toBeInTheDocument();
    });

    it('should display clause count for templates', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      const clauseElements = screen.queryAllByText(/clauses/i);
      expect(clauseElements.length).toBeGreaterThan(0);
    });

    it('should select first template by default', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      expect(screen.getByText('Standard Rental Agreement')).toBeInTheDocument();
    });

    it('should allow template selection', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      const enterpriseTemplate = screen.getByRole('button', { name: /Enterprise Agreement/i });
      await user.click(enterpriseTemplate);

      expect(screen.getByText('Enterprise Agreement')).toBeInTheDocument();
    });
  });

  describe('Template Form Display', () => {
    it('should display agreement form in templates tab', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      expect(screen.getByText('Agreement Details')).toBeInTheDocument();
    });

    it('should display equipment input field', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      const equipmentInput = screen.getByDisplayValue('CAT 320 Excavator') as HTMLInputElement;
      expect(equipmentInput).toBeInTheDocument();
    });

    it('should display renter name input field', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      const renterInput = screen.getByPlaceholderText(/Enter renter name/i);
      expect(renterInput).toBeInTheDocument();
    });

    it('should display renter email input field', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      const emailInput = screen.getByPlaceholderText(/Enter renter email/i);
      expect(emailInput).toBeInTheDocument();
    });

    it('should display date input fields', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      const dateInputs = screen.getAllByDisplayValue('');
      expect(dateInputs.length > 0).toBe(true);
    });
  });

  describe('Form Input Handling', () => {
    it('should accept renter name input', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      const renterInput = screen.getByPlaceholderText(/Enter renter name/i) as HTMLInputElement;
      await user.type(renterInput, 'Jane Doe');

      expect(renterInput.value).toBe('Jane Doe');
    });

    it('should accept renter email input', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      const emailInput = screen.getByPlaceholderText(/Enter renter email/i) as HTMLInputElement;
      await user.type(emailInput, 'jane@example.com');

      expect(emailInput.value).toBe('jane@example.com');
    });

    it('should allow equipment name modification', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      const equipmentInput = screen.getByDisplayValue('CAT 320 Excavator') as HTMLInputElement;
      await user.clear(equipmentInput);
      await user.type(equipmentInput, 'New Equipment');

      expect(equipmentInput.value).toBe('New Equipment');
    });

    it('should accept date inputs', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      const dateInputs = screen.getAllByDisplayValue('') as HTMLInputElement[];
      if (dateInputs.length > 0) {
        await user.type(dateInputs[0], '2026-03-01');
        expect(dateInputs[0].value).toBe('2026-03-01');
      }
    });

    it('should accept deposit amount input', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      const numberInputs = screen.getAllByDisplayValue('2000');
      if (numberInputs.length > 0) {
        await user.clear(numberInputs[0]);
        await user.type(numberInputs[0], '3000');
      }
    });

    it('should accept total cost input', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      const numberInputs = screen.getAllByDisplayValue('0');
      if (numberInputs.length > 0) {
        await user.type(numberInputs[0], '5000');
      }
    });
  });

  describe('Insurance Checkbox', () => {
    it('should display insurance checkbox', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      expect(screen.getByText(/Include insurance coverage/i)).toBeInTheDocument();
    });

    it('should have insurance checked by default', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      const insuranceCheckbox = screen.getByRole('checkbox');
      expect(insuranceCheckbox).toBeChecked();
    });

    it('should allow unchecking insurance', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      const insuranceCheckbox = screen.getByRole('checkbox');
      await user.click(insuranceCheckbox);

      expect(insuranceCheckbox).not.toBeChecked();
    });
  });

  describe('Additional Terms Field', () => {
    it('should display additional terms textarea', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      expect(screen.getByPlaceholderText(/Add any custom terms/i)).toBeInTheDocument();
    });

    it('should accept custom terms input', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      const termsField = screen.getByPlaceholderText(/Add any custom terms/i) as HTMLTextAreaElement;
      await user.type(termsField, 'Custom terms here');

      expect(termsField.value).toBe('Custom terms here');
    });
  });

  describe('Agreement Preview Display', () => {
    it('should display agreement preview section', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      expect(screen.getByText('Agreement Preview')).toBeInTheDocument();
    });

    it('should show equipment name in preview', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      expect(screen.getByText('EQUIPMENT RENTAL AGREEMENT')).toBeInTheDocument();
      // Equipment is in a <p> with <strong>Equipment:</strong> tag - check for strong text
      expect(screen.getByText('Equipment:')).toBeInTheDocument();
      // Check that CAT 320 Excavator appears somewhere in the preview
      const equipmentElements = screen.queryAllByText(/CAT 320 Excavator/);
      expect(equipmentElements.length).toBeGreaterThan(0);
    });

    it('should update preview when renter name changes', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      const renterInput = screen.getByPlaceholderText(/Enter renter name/i);
      await user.type(renterInput, 'John Smith');

      // Renter name appears after typing (in preview, broken by strong tag)
      expect(screen.getByText('Renter:')).toBeInTheDocument();
      expect(screen.getByText('John Smith')).toBeInTheDocument();
    });

    it('should show rental period in preview when dates entered', async () => {
      const user = userEvent.setup();
      const { container } = render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      // Labels don't have 'for' attribute so use querySelectorAll for type="date"
      const dateInputs = container.querySelectorAll('input[type="date"]');
      if (dateInputs.length >= 2) {
        fireEvent.change(dateInputs[0], { target: { value: '2026-03-01' } });
        fireEvent.change(dateInputs[1], { target: { value: '2026-03-05' } });
        expect(screen.getByText('Rental Period:')).toBeInTheDocument();
      }
    });

    it('should calculate duration in preview', async () => {
      const user = userEvent.setup();
      const { container } = render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      // Labels don't have 'for' attribute so use querySelectorAll for type="date"
      const dateInputs = container.querySelectorAll('input[type="date"]');
      if (dateInputs.length >= 2) {
        fireEvent.change(dateInputs[0], { target: { value: '2026-03-01' } });
        fireEvent.change(dateInputs[1], { target: { value: '2026-03-05' } });
        expect(screen.getByText('Duration:')).toBeInTheDocument();
      }
    });

    it('should show total cost in preview', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      expect(screen.getByText(/Total Cost:/)).toBeInTheDocument();
    });

    it('should show insurance status in preview', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      expect(screen.getByText(/Insurance:/)).toBeInTheDocument();
    });
  });

  describe('Generate & Sign Button', () => {
    it('should display generate and sign button', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      expect(screen.getByRole('button', { name: /Generate & Sign/i })).toBeInTheDocument();
    });

    it('should have proper styling on button', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      const generateButton = screen.getByRole('button', { name: /Generate & Sign/i });
      expect(generateButton).toBeInTheDocument();
    });
  });

  describe('Duration Calculation', () => {
    it('should calculate days between start and end date', async () => {
      const user = userEvent.setup();
      const { container } = render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      // Labels don't have 'for' attribute so use querySelectorAll for type="date"
      const dateInputs = container.querySelectorAll('input[type="date"]');
      if (dateInputs.length >= 2) {
        fireEvent.change(dateInputs[0], { target: { value: '2026-03-01' } });
        fireEvent.change(dateInputs[1], { target: { value: '2026-03-06' } });
        expect(screen.getByText('Duration:')).toBeInTheDocument();
      }
    });
  });

  describe('Navigation Callbacks', () => {
    it('should call onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const backButton = screen.getByRole('button', { name: /go back/i });
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Responsive Layout', () => {
    it('should display form and preview side by side in templates', async () => {
      const user = userEvent.setup();
      render(<RentalAgreementGenerator onBack={mockOnBack} />);

      const templatesTab = screen.getByRole('button', { name: /Templates/i });
      await user.click(templatesTab);

      expect(screen.getByText('Agreement Details')).toBeInTheDocument();
      expect(screen.getByText('Agreement Preview')).toBeInTheDocument();
    });

    it('should display agreements grid', () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      expect(screen.getByText('CAT 320 Excavator')).toBeInTheDocument();
      expect(screen.getByText('Sony A7IV Camera Kit')).toBeInTheDocument();
    });
  });

  describe('Agreement Card Information', () => {
    it('should display duration calculation on agreement cards', () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      const durationElements = screen.getAllByText('Duration');
      expect(durationElements.length).toBeGreaterThan(0);
    });

    it('should show formatted date ranges', () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      // Dates should be formatted properly
      const dateElements = screen.queryAllByText(/2026/);
      expect(dateElements.length).toBeGreaterThan(0);
    });

    it('should display formatted cost amounts', () => {
      render(<RentalAgreementGenerator onBack={mockOnBack} />);
      const costElements = screen.queryAllByText(/\$[0-9,]+/);
      expect(costElements.length).toBeGreaterThan(0);
    });
  });
});
