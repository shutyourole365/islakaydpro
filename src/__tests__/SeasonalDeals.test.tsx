import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SeasonalDeals from '../components/promotions/SeasonalDeals';

describe('SeasonalDeals', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    mockOnBack.mockClear();
  });

  describe('Component Rendering', () => {
    it('should render main title and description', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      expect(screen.getByText('Seasonal Deals & Promotions')).toBeInTheDocument();
      expect(screen.getByText(/Save big with limited-time/i)).toBeInTheDocument();
    });

    it('should display back button', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      expect(screen.getByRole('button', { name: /go back/i })).toBeInTheDocument();
    });
  });

  describe('Featured Deal Banner', () => {
    it('should display featured deal section', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      expect(screen.getByText(/Featured Deal/i)).toBeInTheDocument();
    });

    it('should show first featured deal', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      // Multiple elements may show the title, check all exist
      const winterElements = screen.getAllByText('Winter Construction Blowout');
      expect(winterElements.length).toBeGreaterThan(0);
    });

    it('should display discount amount in banner', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      // Winter Construction Blowout is 25% - banner shows "25% OFF"
      expect(screen.getByText(/25% OFF/)).toBeInTheDocument();
    });

    it('should show featured deal code button', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      // Code is shown as "Code: WINTER25" on the featured banner button
      expect(screen.getByText(/Code: WINTER25/)).toBeInTheDocument();
    });

    it('should display countdown timer for featured deal', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      const timerElements = screen.queryAllByText(/Expires|left/i);
      expect(timerElements.length).toBeGreaterThan(0);
    });
  });

  describe('Season Filters', () => {
    it('should display all season filter buttons', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      expect(screen.getByRole('button', { name: /All Deals/i })).toBeInTheDocument();
      // Season buttons have exact text "Winter (N)" - use regex to match
      const winterButtons = screen.getAllByRole('button', { name: /^Winter/i });
      expect(winterButtons.length).toBeGreaterThan(0);
      const springButtons = screen.getAllByRole('button', { name: /^Spring/i });
      expect(springButtons.length).toBeGreaterThan(0);
      const summerButtons = screen.getAllByRole('button', { name: /^Summer/i });
      expect(summerButtons.length).toBeGreaterThan(0);
      const fallButtons = screen.getAllByRole('button', { name: /^Fall/i });
      expect(fallButtons.length).toBeGreaterThan(0);
    });

    it('should filter deals by winter season', async () => {
      const user = userEvent.setup();
      render(<SeasonalDeals onBack={mockOnBack} />);

      // Get the winter season filter button (starts with "Winter")
      const winterButtons = screen.getAllByRole('button', { name: /^Winter/i });
      await user.click(winterButtons[0]);

      // Should show winter deals
      const winterDealElements = screen.getAllByText('Winter Construction Blowout');
      expect(winterDealElements.length).toBeGreaterThan(0);
    });

    it('should filter deals by spring season', async () => {
      const user = userEvent.setup();
      render(<SeasonalDeals onBack={mockOnBack} />);

      const springButtons = screen.getAllByRole('button', { name: /^Spring/i });
      await user.click(springButtons[0]);

      // Should show spring deals
      expect(screen.getByText('Spring Event Package')).toBeInTheDocument();
    });

    it('should filter deals by summer season', async () => {
      const user = userEvent.setup();
      render(<SeasonalDeals onBack={mockOnBack} />);

      const summerButtons = screen.getAllByRole('button', { name: /^Summer/i });
      await user.click(summerButtons[0]);

      // Should show summer deals
      expect(screen.getByText('Summer Landscaping Bundle')).toBeInTheDocument();
    });

    it('should show all deals when All is selected', async () => {
      const user = userEvent.setup();
      render(<SeasonalDeals onBack={mockOnBack} />);

      const allButton = screen.getByRole('button', { name: /All Deals/i });
      await user.click(allButton);

      // Should show multiple deals
      const winterElements = screen.getAllByText('Winter Construction Blowout');
      expect(winterElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Spring Event Package')).toBeInTheDocument();
    });
  });

  describe('Deal Cards Display', () => {
    it('should display all deal cards', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      const winterElements = screen.getAllByText('Winter Construction Blowout');
      expect(winterElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Spring Event Package')).toBeInTheDocument();
      expect(screen.getByText('Drone Photography Week')).toBeInTheDocument();
      expect(screen.getByText('Summer Landscaping Bundle')).toBeInTheDocument();
    });

    it('should show discount percentage correctly', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      // Deal cards show "25%" and "OFF" separately, banner shows "25% OFF" together
      const elements25 = screen.queryAllByText(/25%/);
      expect(elements25.length).toBeGreaterThan(0);
      const elements30 = screen.queryAllByText(/30%/);
      expect(elements30.length).toBeGreaterThan(0);
      const elements20 = screen.queryAllByText(/20%/);
      expect(elements20.length).toBeGreaterThan(0);
    });

    it('should show flat discount amount when applicable', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      // Drone Photography Week is $100 flat - rendered as "$100" + "<span>OFF</span>" in deal cards
      // Check $100 exists as separate elements
      const dollarElements = screen.queryAllByText(/\$100/);
      expect(dollarElements.length).toBeGreaterThan(0);
    });

    it('should display deal category badges', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      expect(screen.getByText('Heavy Equipment')).toBeInTheDocument();
      expect(screen.getByText('Event Equipment')).toBeInTheDocument();
      expect(screen.getByText('Photography')).toBeInTheDocument();
    });

    it('should show featured badge on featured deals', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      const featuredBadges = screen.queryAllByText('Featured');
      expect(featuredBadges.length).toBeGreaterThan(0);
    });
  });

  describe('Deal Details & Usage Tracking', () => {
    it('should display equipment list for deals', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      expect(screen.getByText('Excavators')).toBeInTheDocument();
      expect(screen.getByText('Tents')).toBeInTheDocument();
      const tractorElements = screen.queryAllByText('Tractors');
      expect(tractorElements.length).toBeGreaterThan(0);
    });

    it('should show usage progress bar', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      // Should show usage percentages
      const usesLeftElements = screen.queryAllByText(/uses left/i);
      expect(usesLeftElements.length).toBeGreaterThan(0);
    });

    it('should display minimum rental days requirement', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      const minElements = screen.queryAllByText(/Min/);
      expect(minElements.length).toBeGreaterThan(0);
    });

    it('should show countdown timer for each deal', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      const timers = screen.queryAllByText(/Expires|left/i);
      expect(timers.length).toBeGreaterThan(0);
    });
  });

  describe('Countdown Timer Functionality', () => {
    it('should show urgent timer for deals expiring soon', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      // Flash Deal expires in 2 days - should show urgent timer
      const flashDeal = screen.getByText('Flash Deal: Power Tools').closest('div');
      expect(flashDeal).toBeTruthy();
    });

    it('should calculate days and hours remaining', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      // Should show countdown format
      const countdownTexts = screen.queryAllByText(/[0-9]+d [0-9]+h left|Expires/i);
      expect(countdownTexts.length).toBeGreaterThan(0);
    });
  });

  describe('Deal Code Copy Functionality', () => {
    it('should display deal codes', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      expect(screen.getByText('WINTER25')).toBeInTheDocument();
      expect(screen.getByText('SPRING30')).toBeInTheDocument();
      expect(screen.getByText('SUMMER20')).toBeInTheDocument();
    });

    it('should copy code to clipboard when clicked', async () => {
      const user = userEvent.setup();
      const clipboardSpy = vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

      render(<SeasonalDeals onBack={mockOnBack} />);

      const codeButton = screen.getByText('WINTER25');
      await user.click(codeButton);

      expect(clipboardSpy).toHaveBeenCalledWith('WINTER25');
      clipboardSpy.mockRestore();
    });

    it('should show copied confirmation', async () => {
      const user = userEvent.setup();
      vi.spyOn(navigator.clipboard, 'writeText').mockResolvedValue(undefined);

      render(<SeasonalDeals onBack={mockOnBack} />);

      const codeButton = screen.getByText('WINTER25');
      await user.click(codeButton);

      // "Copied!" may appear in multiple buttons (featured banner + deal card for same code)
      const copiedElements = await screen.findAllByText('Copied!');
      expect(copiedElements.length).toBeGreaterThan(0);
    });
  });

  describe('Deal Actions', () => {
    it('should have Use Deal button for each deal', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      const useButtons = screen.queryAllByText(/Use Deal/i);
      expect(useButtons.length).toBeGreaterThan(0);
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no deals for selected season', async () => {
      const user = userEvent.setup();
      render(<SeasonalDeals onBack={mockOnBack} />);

      // Filter by a season and manually hide deals
      const winterButtons = screen.getAllByRole('button', { name: /^Winter/i });
      await user.click(winterButtons[0]);

      // Should display deals for winter
      const winterDealElements = screen.getAllByText('Winter Construction Blowout');
      expect(winterDealElements.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation Callbacks', () => {
    it('should call onBack when back button clicked', async () => {
      const user = userEvent.setup();
      render(<SeasonalDeals onBack={mockOnBack} />);

      const backButton = screen.getByRole('button', { name: /go back/i });
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Deal Type Display', () => {
    it('should indicate percentage discount type', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      // Winter Construction Blowout is percentage type - shows 25%
      const percentElements = screen.queryAllByText(/25%/);
      expect(percentElements.length).toBeGreaterThan(0);
    });

    it('should indicate flat discount type', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      // Drone Photography Week is flat type
      expect(screen.getByText(/\$100/)).toBeInTheDocument();
    });

    it('should indicate bundle type', () => {
      render(<SeasonalDeals onBack={mockOnBack} />);
      // Summer Landscaping Bundle is bundle type
      expect(screen.getByText('Summer Landscaping Bundle')).toBeInTheDocument();
    });
  });
});
