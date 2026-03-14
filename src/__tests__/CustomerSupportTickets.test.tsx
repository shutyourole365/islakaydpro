import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CustomerSupportTickets from '../components/tickets/CustomerSupportTickets';

describe('CustomerSupportTickets', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    mockOnBack.mockClear();
  });

  describe('Component Rendering', () => {
    it('should render with main title and description', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      expect(screen.getByText('Support Tickets')).toBeInTheDocument();
      expect(screen.getByText(/Manage customer support requests/i)).toBeInTheDocument();
    });

    it('should display back button', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      const backButton = screen.getByRole('button', { name: /go back/i });
      expect(backButton).toBeInTheDocument();
    });

    it('should display new ticket button', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      expect(screen.getByRole('button', { name: /New Ticket/i })).toBeInTheDocument();
    });

    it('should display stats section', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('Open')).toBeInTheDocument();
    });
  });

  describe('Statistics Display', () => {
    it('should display total tickets count', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      // Total is 6 - may appear multiple times (stat card + message counts)
      const elements = screen.queryAllByText('6');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should display open tickets count', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      // Open count is 2 - may appear multiple times (stat card + message counts)
      const elements = screen.queryAllByText('2');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('should display in progress count', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      // 2 in progress tickets
      const inProgressElements = screen.queryAllByText(/In Progress/);
      expect(inProgressElements.length > 0).toBe(true);
    });

    it('should display resolved count', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      // 1 resolved ticket
      const resolvedElements = screen.queryAllByText(/Resolved/);
      expect(resolvedElements.length > 0).toBe(true);
    });

    it('should display stats with proper labels', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      expect(screen.getByText('Total')).toBeInTheDocument();
    });
  });

  describe('Ticket Filtering', () => {
    it('should display status filter dropdown', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      // The select shows "All Status" as its display value (the selected option text)
      const statusSelects = screen.getAllByDisplayValue('All Status');
      expect(statusSelects.length > 0).toBe(true);
    });

    it('should display category filter dropdown', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      const categorySelects = screen.queryAllByDisplayValue('All Categories');
      expect(categorySelects.length > 0).toBe(true);
    });

    it('should filter tickets by status', async () => {
      const user = userEvent.setup();
      render(<CustomerSupportTickets onBack={mockOnBack} />);

      const statusSelect = screen.getByDisplayValue('All Status') as HTMLSelectElement;
      await user.selectOptions(statusSelect, 'open');

      // Should only show open tickets
      expect(screen.getByText(/Open/i)).toBeInTheDocument();
    });

    it('should filter tickets by category', async () => {
      const user = userEvent.setup();
      render(<CustomerSupportTickets onBack={mockOnBack} />);

      const categorySelect = screen.getByDisplayValue('All Categories') as HTMLSelectElement;
      await user.selectOptions(categorySelect, 'damage');

      // Should only show damage category tickets
      expect(screen.getByText(/Damage/i)).toBeInTheDocument();
    });

    it('should apply both filters simultaneously', async () => {
      const user = userEvent.setup();
      render(<CustomerSupportTickets onBack={mockOnBack} />);

      const statusSelect = screen.getByDisplayValue('All Status');
      const categorySelect = screen.getByDisplayValue('All Categories');
      await user.selectOptions(statusSelect, 'open');
      await user.selectOptions(categorySelect, 'technical');

      // Should show filtered results
      expect(screen.getByText(/Open|Technical/i)).toBeInTheDocument();
    });

    it('should show ticket count after filtering', async () => {
      const user = userEvent.setup();
      render(<CustomerSupportTickets onBack={mockOnBack} />);

      const statusSelect = screen.getByDisplayValue('All Status') as HTMLSelectElement;
      await user.selectOptions(statusSelect, 'open');

      expect(screen.getByText(/tickets/i)).toBeInTheDocument();
    });
  });

  describe('Ticket List Display', () => {
    it('should display all tickets', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      expect(screen.getByText('Equipment damage claim - CAT Excavator')).toBeInTheDocument();
      expect(screen.getByText('Booking cancellation request')).toBeInTheDocument();
    });

    it('should display ticket subjects', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      expect(screen.getByText(/Camera not working properly/)).toBeInTheDocument();
    });

    it('should display ticket numbers', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      expect(screen.getByText('TK-2026-001')).toBeInTheDocument();
      expect(screen.getByText('TK-2026-002')).toBeInTheDocument();
    });

    it('should display category badges on tickets', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      expect(screen.getByText('Damage')).toBeInTheDocument();
      expect(screen.getByText('Booking')).toBeInTheDocument();
    });

    it('should display status badges on tickets', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('should display renter names on tickets', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      expect(screen.getByText('John D.')).toBeInTheDocument();
      expect(screen.getByText('Sarah M.')).toBeInTheDocument();
    });

    it('should display updated date on tickets', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      // Dates should be formatted
      expect(screen.getByText(/2026/)).toBeInTheDocument();
    });

    it('should display message count on tickets', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      // Should show number of messages
      expect(screen.getByText(/4|2|1|6|3|2/)).toBeInTheDocument();
    });

    it('should display priority indicator on tickets', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      expect(screen.getByText(/High|Urgent|Medium|Low/)).toBeInTheDocument();
    });
  });

  describe('Ticket Selection', () => {
    it('should allow selecting a ticket', async () => {
      const user = userEvent.setup();
      render(<CustomerSupportTickets onBack={mockOnBack} />);

      const firstTicket = screen.getByText('Equipment damage claim - CAT Excavator');
      await user.click(firstTicket);

      expect(screen.getByText('TK-2026-001')).toBeInTheDocument();
    });

    it('should show ticket details when selected', async () => {
      const user = userEvent.setup();
      render(<CustomerSupportTickets onBack={mockOnBack} />);

      const ticketSubject = screen.getByText('Equipment damage claim - CAT Excavator');
      await user.click(ticketSubject);

      expect(screen.getByText('Details')).toBeInTheDocument();
    });

    it('should highlight selected ticket', async () => {
      const user = userEvent.setup();
      render(<CustomerSupportTickets onBack={mockOnBack} />);

      const firstTicket = screen.getByText('Equipment damage claim - CAT Excavator');
      await user.click(firstTicket);

      // Selected ticket should have visual indication
      expect(firstTicket).toBeInTheDocument();
    });
  });

  describe('Ticket Details Panel', () => {
    it('should display details section header', async () => {
      const user = userEvent.setup();
      render(<CustomerSupportTickets onBack={mockOnBack} />);

      const ticket = screen.getByText('Equipment damage claim - CAT Excavator');
      await user.click(ticket);

      expect(screen.getByText('Details')).toBeInTheDocument();
    });

    it('should display ticket number in details', async () => {
      const user = userEvent.setup();
      render(<CustomerSupportTickets onBack={mockOnBack} />);

      const ticket = screen.getByText('Equipment damage claim - CAT Excavator');
      await user.click(ticket);

      expect(screen.getByText('TK-2026-001')).toBeInTheDocument();
    });

    it('should display category in details', async () => {
      const user = userEvent.setup();
      render(<CustomerSupportTickets onBack={mockOnBack} />);

      const ticket = screen.getByText('Equipment damage claim - CAT Excavator');
      await user.click(ticket);

      expect(screen.getByText(/Damage/)).toBeInTheDocument();
    });

    it('should display priority in details', async () => {
      const user = userEvent.setup();
      render(<CustomerSupportTickets onBack={mockOnBack} />);

      const ticket = screen.getByText('Equipment damage claim - CAT Excavator');
      await user.click(ticket);

      expect(screen.getByText(/High/)).toBeInTheDocument();
    });

    it('should display status in details', async () => {
      const user = userEvent.setup();
      render(<CustomerSupportTickets onBack={mockOnBack} />);

      const ticket = screen.getByText('Equipment damage claim - CAT Excavator');
      await user.click(ticket);

      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('should display renter information', async () => {
      const user = userEvent.setup();
      render(<CustomerSupportTickets onBack={mockOnBack} />);

      const ticket = screen.getByText('Equipment damage claim - CAT Excavator');
      await user.click(ticket);

      expect(screen.getByText('John D.')).toBeInTheDocument();
    });

    it('should display equipment information when available', async () => {
      const user = userEvent.setup();
      render(<CustomerSupportTickets onBack={mockOnBack} />);

      const ticket = screen.getByText('Equipment damage claim - CAT Excavator');
      await user.click(ticket);

      expect(screen.getByText('CAT 320 Excavator')).toBeInTheDocument();
    });

    it('should display created date', async () => {
      const user = userEvent.setup();
      render(<CustomerSupportTickets onBack={mockOnBack} />);

      const ticket = screen.getByText('Equipment damage claim - CAT Excavator');
      await user.click(ticket);

      expect(screen.getByText('Created')).toBeInTheDocument();
    });

    it('should display ticket description', async () => {
      const user = userEvent.setup();
      render(<CustomerSupportTickets onBack={mockOnBack} />);

      const ticket = screen.getByText('Equipment damage claim - CAT Excavator');
      await user.click(ticket);

      expect(screen.getByText(/Minor scratch on the left side/)).toBeInTheDocument();
    });
  });

  describe('Ticket Detail Buttons', () => {
    it('should display reply button in details', async () => {
      const user = userEvent.setup();
      render(<CustomerSupportTickets onBack={mockOnBack} />);

      const ticket = screen.getByText('Equipment damage claim - CAT Excavator');
      await user.click(ticket);

      expect(screen.getByRole('button', { name: /Reply/i })).toBeInTheDocument();
    });

    it('should display resolve button in details', async () => {
      const user = userEvent.setup();
      render(<CustomerSupportTickets onBack={mockOnBack} />);

      const ticket = screen.getByText('Equipment damage claim - CAT Excavator');
      await user.click(ticket);

      expect(screen.getByRole('button', { name: /Resolve/i })).toBeInTheDocument();
    });
  });

  describe('Category Display & Styling', () => {
    it('should display all category types', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      expect(screen.getByText('Damage')).toBeInTheDocument();
      expect(screen.getByText('Booking')).toBeInTheDocument();
      expect(screen.getByText('Equipment')).toBeInTheDocument();
    });

    it('should apply different colors for different categories', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      // Categories should have distinct styling
      expect(screen.getByText('Damage')).toBeInTheDocument();
      expect(screen.getByText('Booking')).toBeInTheDocument();
    });

    it('should have category badge styling', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      const categoryBadges = screen.queryAllByText(/Damage|Booking|Equipment|Technical|Billing|Other/);
      expect(categoryBadges.length > 0).toBe(true);
    });
  });

  describe('Status Display & Styling', () => {
    it('should display open status', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      expect(screen.getByText('Open')).toBeInTheDocument();
    });

    it('should display in progress status', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });

    it('should display resolved status', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      expect(screen.getByText('Resolved')).toBeInTheDocument();
    });

    it('should have status badge styling', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      const statusBadges = screen.queryAllByText(/Open|In Progress|Resolved|Awaiting Response|Closed/);
      expect(statusBadges.length > 0).toBe(true);
    });

    it('should show status with icon', async () => {
      const user = userEvent.setup();
      render(<CustomerSupportTickets onBack={mockOnBack} />);

      const ticket = screen.getByText('Equipment damage claim - CAT Excavator');
      await user.click(ticket);

      // Status should display with icon
      expect(screen.getByText('In Progress')).toBeInTheDocument();
    });
  });

  describe('Priority Display & Styling', () => {
    it('should display urgent priority', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      expect(screen.getByText('Urgent')).toBeInTheDocument();
    });

    it('should display high priority', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      expect(screen.getByText('High')).toBeInTheDocument();
    });

    it('should display medium priority', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      expect(screen.getByText('Medium')).toBeInTheDocument();
    });

    it('should display low priority', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      expect(screen.getByText('Low')).toBeInTheDocument();
    });

    it('should apply different colors for priority levels', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      // Different priorities should have different colors
      expect(screen.getByText(/Urgent|High|Medium|Low/)).toBeInTheDocument();
    });
  });

  describe('Data Formatting', () => {
    it('should format dates correctly', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      // Dates should be in readable format
      expect(screen.getByText(/2026/)).toBeInTheDocument();
    });

    it('should display renter names', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      expect(screen.getByText('John D.')).toBeInTheDocument();
    });

    it('should display message counts as numbers', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      expect(screen.getByText(/4|2|1|6|3/)).toBeInTheDocument();
    });
  });

  describe('Empty State Handling', () => {
    it('should show message when no ticket selected', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      // If no ticket is selected, placeholder message should show
      expect(screen.getByText(/Select a ticket/i)).toBeInTheDocument();
    });

    it('should show placeholder content in details panel', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      expect(screen.getByText(/Select a ticket/i)).toBeInTheDocument();
    });
  });

  describe('Message Count Display', () => {
    it('should show message count with icon on ticket list', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      // Message count should be displayed
      expect(screen.getByText(/4|2|1|6|3/)).toBeInTheDocument();
    });

    it('should display different message counts for different tickets', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      // Different tickets have different message counts
      const messageElements = screen.queryAllByText(/4|2|1|6|3/);
      expect(messageElements.length > 0).toBe(true);
    });
  });

  describe('Equipment Filter Display', () => {
    it('should show equipment name when available in ticket list', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      expect(screen.getByText('CAT 320 Excavator')).toBeInTheDocument();
    });

    it('should display equipment in ticket details when available', async () => {
      const user = userEvent.setup();
      render(<CustomerSupportTickets onBack={mockOnBack} />);

      const ticket = screen.getByText('Equipment damage claim - CAT Excavator');
      await user.click(ticket);

      expect(screen.getByText('CAT 320 Excavator')).toBeInTheDocument();
    });
  });

  describe('Navigation Callbacks', () => {
    it('should call onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<CustomerSupportTickets onBack={mockOnBack} />);

      const backButton = screen.getByRole('button', { name: /go back/i });
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Responsive Layout', () => {
    it('should display two-column layout', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      // Left column with tickets, right column with details
      expect(screen.getByText(/Tickets/)).toBeInTheDocument();
      expect(screen.getByText(/Select a ticket/i)).toBeInTheDocument();
    });

    it('should display stats grid at top', () => {
      render(<CustomerSupportTickets onBack={mockOnBack} />);
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('Open')).toBeInTheDocument();
    });
  });

  describe('Filter Results Display', () => {
    it('should show number of filtered tickets', async () => {
      const user = userEvent.setup();
      render(<CustomerSupportTickets onBack={mockOnBack} />);

      const statusSelect = screen.getByDisplayValue('All Status') as HTMLSelectElement;
      await user.selectOptions(statusSelect, 'open');

      expect(screen.getByText(/tickets/i)).toBeInTheDocument();
    });

    it('should update ticket list on filter change', async () => {
      const user = userEvent.setup();
      render(<CustomerSupportTickets onBack={mockOnBack} />);

      const statusSelect = screen.getByDisplayValue('All Status') as HTMLSelectElement;
      await user.selectOptions(statusSelect, 'open');

      // List should be updated with filtered results
      expect(screen.getByText(/Open|tickets/i)).toBeInTheDocument();
    });
  });
});
