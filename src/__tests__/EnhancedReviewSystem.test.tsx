import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EnhancedReviewSystem from '../components/reviews/EnhancedReviewSystem';

describe('EnhancedReviewSystem', () => {
  const mockOnSubmit = vi.fn(async (_: any) => Promise.resolve());
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('walks through steps and submits a review', async () => {
    const user = userEvent.setup();

    render(
      <EnhancedReviewSystem
        equipmentId="eq-1"
        equipmentTitle="Excavator 3000"
        bookingId="bk-1"
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );

    // Step 1: Overall rating — click the 4th star
    const starsRoot = screen.getAllByRole('button').find((btn) => btn.querySelector('svg.lucide-star'));
    expect(screen.getByText(/How was your rental/i)).toBeInTheDocument();

    // Click the 4th star (there are multiple star-buttons on the page, pick the first StarRating instance)
    const starButtons = screen.getAllByRole('button').filter(b => b.querySelector('svg.lucide-star'));
    await user.click(starButtons[3]); // select 4 stars

    await waitFor(() => expect(screen.getByText(/Very Good!/i)).toBeInTheDocument());

    // Next -> Aspects
    const nextBtn = screen.getByRole('button', { name: /next/i });
    await user.click(nextBtn);

    // Step 2: Aspect ratings — set each aspect to at least 1 (click second star inside each aspect block)
    const aspectLabels = [
      'Equipment Condition',
      'Cleanliness',
      'Listing Accuracy',
      'Owner Communication',
      'Value for Money',
    ];

    for (const label of aspectLabels) {
      const container = screen.getByText(label).closest('div');
      expect(container).toBeTruthy();
      const { getAllByRole } = within(container as HTMLElement);
      const aspectStars = getAllByRole('button').filter(b => b.querySelector('svg.lucide-star'));
      await user.click(aspectStars[1]); // give a rating > 0
    }

    // Next -> Details
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 3: Written review — fill title & comment, toggle recommendation
    const titleInput = screen.getByPlaceholderText(/e\.g\., Great excavator, worked perfectly!/i);
    const commentInput = screen.getByPlaceholderText(/Tell us about your experience with this equipment/i);

    await user.type(titleInput, 'Great machine');
    await user.type(commentInput, 'Worked exactly as expected. No issues.');

    // Toggle recommendation off
    const checkbox = screen.getByRole('checkbox');
    await user.click(checkbox);

    // Next -> Photos (optional)
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Submit review
    const submitBtn = screen.getByRole('button', { name: /Submit Review|Submitting...|Submit/i });
    await user.click(submitBtn);

    await waitFor(() => expect(mockOnSubmit).toHaveBeenCalled());

    const submitted = mockOnSubmit.mock.calls[0][0];
    expect(submitted.rating).toBe(4);
    expect(submitted.title).toBe('Great machine');
    expect(submitted.comment).toContain('Worked exactly as expected');
    expect(submitted.wouldRecommend).toBe(false);
    expect(Object.values(submitted.aspectRatings).every((v: number) => v > 0)).toBe(true);

    // onClose should be invoked after successful submit
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('prevents submission when overall rating is missing or details are empty', async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    render(
      <EnhancedReviewSystem
        equipmentId="eq-1"
        equipmentTitle="Excavator 3000"
        bookingId="bk-1"
        onSubmit={mockOnSubmit}
        onClose={mockOnClose}
      />
    );

    // Click Next without selecting rating — should alert and not proceed
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(alertSpy).toHaveBeenCalledWith('Please select an overall rating');

    // Select rating and proceed to details but leave title/comment empty — expect alert on submit
    const starButtons = screen.getAllByRole('button').filter(b => b.querySelector('svg.lucide-star'));
    await user.click(starButtons[4]); // 5 stars
    await user.click(screen.getByRole('button', { name: /next/i })); // to aspects

    // Fill aspects quickly
    const aspectButtons = screen.getAllByRole('button').filter(b => b.querySelector('svg.lucide-star'));
    // click first 5 aspect buttons (they map to the first StarRating instances after overall)
    for (let i = 0; i < 5; i++) {
      await user.click(aspectButtons[i]);
    }

    await user.click(screen.getByRole('button', { name: /next/i })); // to details

    // Attempt submit with empty title/comment
    await user.click(screen.getByRole('button', { name: /next|Submit Review/i }));
    expect(alertSpy).toHaveBeenCalledWith('Please provide a title and comment');

    alertSpy.mockRestore();
  });
});
