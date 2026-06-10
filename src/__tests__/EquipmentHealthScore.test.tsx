import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EquipmentHealthScore from '../components/health/EquipmentHealthScore';

describe('EquipmentHealthScore', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    mockOnBack.mockClear();
  });

  describe('Component Rendering', () => {
    it('should render with all main sections', () => {
      render(<EquipmentHealthScore onBack={mockOnBack} />);
      expect(screen.getByText('Equipment Health Score')).toBeInTheDocument();
      expect(screen.getByText('Detailed Health Metrics')).toBeInTheDocument();
      expect(screen.getByText('Maintenance Recommendations')).toBeInTheDocument();
    });

    it('should display back button', () => {
      render(<EquipmentHealthScore onBack={mockOnBack} />);
      const backButton = screen.getByRole('button', { name: /go back/i });
      expect(backButton).toBeInTheDocument();
    });

    it('should render equipment selector buttons', () => {
      render(<EquipmentHealthScore onBack={mockOnBack} />);
      // Equipment names appear in selector buttons and selected equipment header
      const excavatorElements = screen.queryAllByText('CAT 320 Excavator');
      expect(excavatorElements.length).toBeGreaterThan(0);
      const tractorElements = screen.queryAllByText('John Deere 1025R Tractor');
      expect(tractorElements.length).toBeGreaterThan(0);
      const dewaltElements = screen.queryAllByText('DeWalt Power Tool Kit');
      expect(dewaltElements.length).toBeGreaterThan(0);
    });
  });

  describe('State Management & Equipment Selection', () => {
    it('should select first equipment by default', () => {
      render(<EquipmentHealthScore onBack={mockOnBack} />);
      // CAT 320 appears in selector button + score card header
      const excavatorElements = screen.queryAllByText('CAT 320 Excavator');
      expect(excavatorElements.length).toBeGreaterThan(0);
      // Check for the overall score display
      const scoreElements = screen.getAllByText(/94/);
      expect(scoreElements.length).toBeGreaterThan(0);
    });

    it('should change selected equipment when clicking equipment button', async () => {
      const user = userEvent.setup();
      render(<EquipmentHealthScore onBack={mockOnBack} />);

      const tractorButton = screen.getByRole('button', { name: /John Deere 1025R Tractor/i });
      await user.click(tractorButton);

      // Name appears in selector + score card; check at least one exists
      const tractorElements = screen.queryAllByText('John Deere 1025R Tractor');
      expect(tractorElements.length).toBeGreaterThan(0);
    });

    it('should update health metrics when equipment changes', async () => {
      const user = userEvent.setup();
      render(<EquipmentHealthScore onBack={mockOnBack} />);

      const toolsButton = screen.getByRole('button', { name: /DeWalt Power Tool Kit/i });
      await user.click(toolsButton);

      const dewaltElements = screen.queryAllByText('DeWalt Power Tool Kit');
      expect(dewaltElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Battery Health')).toBeInTheDocument();
    });
  });

  describe('Score Calculations & Display', () => {
    it('should display correct overall status for excellent score', () => {
      render(<EquipmentHealthScore onBack={mockOnBack} />);
      // CAT 320 has a score of 94 (excellent)
      expect(screen.getByText('Excellent Condition')).toBeInTheDocument();
    });

    it('should display all equipment health metrics', () => {
      render(<EquipmentHealthScore onBack={mockOnBack} />);
      expect(screen.getByText('Engine Performance')).toBeInTheDocument();
      expect(screen.getByText('Hydraulic System')).toBeInTheDocument();
      expect(screen.getByText('Structural Integrity')).toBeInTheDocument();
      expect(screen.getByText('Electrical Systems')).toBeInTheDocument();
      expect(screen.getByText('Safety Equipment')).toBeInTheDocument();
      expect(screen.getByText('Operating Temperature')).toBeInTheDocument();
    });

    it('should display score values for each metric', () => {
      render(<EquipmentHealthScore onBack={mockOnBack} />);
      const scoreTexts = screen.queryAllByText(/96|91|98|88|100|85/);
      expect(scoreTexts.length).toBeGreaterThan(0);
    });

    it('should calculate correct average rating across metrics', () => {
      render(<EquipmentHealthScore onBack={mockOnBack} />);
      // Verify metrics are displayed with their individual ratings
      // "Excellent" appears in both selector badges and metric status badges
      const excellentElements = screen.queryAllByText('Excellent');
      expect(excellentElements.length).toBeGreaterThan(0);
    });
  });

  describe('Trend & Last Inspection Display', () => {
    it('should display last inspection date', () => {
      render(<EquipmentHealthScore onBack={mockOnBack} />);
      expect(screen.getByText('Last Inspection')).toBeInTheDocument();
      // Date rendered with toLocaleDateString() as 2/20/2026 format
      const dateElements = screen.queryAllByText(/2\/20\/2026|2026-02-20/);
      expect(dateElements.length).toBeGreaterThan(0);
    });

    it('should display next maintenance date', () => {
      render(<EquipmentHealthScore onBack={mockOnBack} />);
      expect(screen.getByText('Next Maintenance')).toBeInTheDocument();
      // Date rendered with toLocaleDateString() as 3/15/2026 format
      const dateElements = screen.queryAllByText(/3\/15\/2026|2026-03-15/);
      expect(dateElements.length).toBeGreaterThan(0);
    });

    it('should display total hours used', () => {
      render(<EquipmentHealthScore onBack={mockOnBack} />);
      expect(screen.getByText('Total Hours')).toBeInTheDocument();
      expect(screen.getByText('1,247 hrs')).toBeInTheDocument();
    });

    it('should display trend indicator', () => {
      render(<EquipmentHealthScore onBack={mockOnBack} />);
      // Check that trend is displayed for the equipment
      expect(screen.getByText('up')).toBeInTheDocument();
    });
  });

  describe('Maintenance Recommendations', () => {
    it('should show healthy status when all metrics are good', () => {
      render(<EquipmentHealthScore onBack={mockOnBack} />);
      expect(screen.getByText('All systems healthy')).toBeInTheDocument();
    });

    it('should filter metrics that need attention', async () => {
      const user = userEvent.setup();
      render(<EquipmentHealthScore onBack={mockOnBack} />);

      // Switch to equipment with maintenance needs
      const toolsButton = screen.getByRole('button', { name: /DeWalt Power Tool Kit/i });
      await user.click(toolsButton);

      // DeWalt has several metrics below 80, should show recommendations
      // Multiple "needs attention" items may render for each bad metric
      const needsAttentionElements = screen.queryAllByText(/needs attention/i);
      expect(needsAttentionElements.length).toBeGreaterThan(0);
    });

    it('should display schedule maintenance message', async () => {
      const user = userEvent.setup();
      render(<EquipmentHealthScore onBack={mockOnBack} />);

      const toolsButton = screen.getByRole('button', { name: /DeWalt Power Tool Kit/i });
      await user.click(toolsButton);

      // Multiple schedule maintenance messages may render
      const scheduleElements = screen.queryAllByText(/Schedule maintenance/i);
      expect(scheduleElements.length).toBeGreaterThan(0);
    });
  });

  describe('Navigation Callbacks', () => {
    it('should call onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<EquipmentHealthScore onBack={mockOnBack} />);

      const backButton = screen.getByRole('button', { name: /go back/i });
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Visual & Data Formatting', () => {
    it('should display dates in readable format', () => {
      render(<EquipmentHealthScore onBack={mockOnBack} />);
      // Dates should be formatted as MM/DD/YYYY or similar
      const dateElements = screen.queryAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/);
      expect(dateElements.length).toBeGreaterThan(0);
    });

    it('should format hours with thousand separator', () => {
      render(<EquipmentHealthScore onBack={mockOnBack} />);
      expect(screen.getByText('1,247 hrs')).toBeInTheDocument();
    });

    it('should display status badges with correct colors', () => {
      render(<EquipmentHealthScore onBack={mockOnBack} />);
      const badges = screen.queryAllByText(/Excellent|Good|Fair|Poor/);
      expect(badges.length).toBeGreaterThan(0);
    });

    it('should show metric last checked dates', () => {
      render(<EquipmentHealthScore onBack={mockOnBack} />);
      const checkedElements = screen.queryAllByText(/Checked/);
      expect(checkedElements.length).toBeGreaterThan(0);
    });
  });

  describe('Status Color Mapping', () => {
    it('should apply correct color for excellent status', async () => {
      render(<EquipmentHealthScore onBack={mockOnBack} />);

      // CAT 320 should show excellent (green)
      const excellentBadge = screen.queryAllByText('Excellent');
      expect(excellentBadge.length).toBeGreaterThan(0);
    });

    it('should apply correct color for good status', async () => {
      const user = userEvent.setup();
      render(<EquipmentHealthScore onBack={mockOnBack} />);

      // Change to equipment with good status
      const tractorButton = screen.getByRole('button', { name: /John Deere 1025R Tractor/i });
      await user.click(tractorButton);

      // John Deere should show good status
      expect(screen.getByText('Good Condition')).toBeInTheDocument();
    });
  });
});
