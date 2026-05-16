import { describe, it, expect, vi, beforeEach } from 'vitest';
import { enforceMaxLength, INPUT_LIMITS } from '../utils/validation';

// Pure unit tests for the length-cap guard. The mock for supabase is
// only used by the integration cases at the bottom.

describe('enforceMaxLength', () => {
  it('accepts a string at exactly the limit', () => {
    const exact = 'a'.repeat(INPUT_LIMITS.bio);
    expect(() => enforceMaxLength(exact, 'bio')).not.toThrow();
  });

  it('rejects a string one character over the limit', () => {
    const over = 'a'.repeat(INPUT_LIMITS.bio + 1);
    expect(() => enforceMaxLength(over, 'bio')).toThrow(
      /must be 500 characters or fewer \(got 501\)/
    );
  });

  it('uses the displayName in the error when provided', () => {
    const over = 'a'.repeat(INPUT_LIMITS.bio + 1);
    expect(() => enforceMaxLength(over, 'bio', 'Bio')).toThrow(
      /^Bio must be 500 characters or fewer/
    );
  });

  it('passes through null / undefined silently (no required-ness check)', () => {
    expect(() => enforceMaxLength(undefined, 'bio')).not.toThrow();
    expect(() => enforceMaxLength(null, 'bio')).not.toThrow();
  });

  it('passes through non-string values silently', () => {
    expect(() => enforceMaxLength(42, 'bio')).not.toThrow();
    expect(() => enforceMaxLength({}, 'bio')).not.toThrow();
  });

  it('catches the messageContent DoS scenario (10MB body)', () => {
    const huge = 'x'.repeat(10 * 1024 * 1024);
    expect(() => enforceMaxLength(huge, 'messageContent', 'Message')).toThrow(
      /Message must be 5000 characters or fewer/
    );
  });
});

// Integration: confirm the database service layer rejects oversized
// inputs BEFORE hitting supabase. Mock supabase so any leakage past
// the guard would surface as an unwanted insert call.

const { fromMock } = vi.hoisted(() => ({
  fromMock: vi.fn(),
}));

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: fromMock,
    rpc: vi.fn(),
  },
}));

vi.mock('../services/errorMonitoring', () => ({
  errorMonitoring: {
    captureException: vi.fn(),
    captureMessage: vi.fn(),
    initialize: vi.fn(),
    setUser: vi.fn(),
    clearUser: vi.fn(),
  },
}));

import {
  sendMessage,
  createReview,
  updateProfile,
  createEquipment,
  updateEquipment,
  addReviewResponse,
  submitReview,
} from '../services/database';

describe('database service: input length caps', () => {
  beforeEach(() => {
    fromMock.mockReset();
  });

  it('sendMessage rejects oversized content before calling supabase', async () => {
    const insertMock = vi.fn();
    fromMock.mockReturnValue({ insert: insertMock });

    await expect(
      sendMessage({
        conversationId: 'c',
        senderId: 's',
        receiverId: 'r',
        content: 'x'.repeat(5001),
      })
    ).rejects.toThrow(/Message must be 5000 characters or fewer/);

    expect(fromMock).not.toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('createReview rejects oversized comment before calling supabase', async () => {
    const insertMock = vi.fn();
    fromMock.mockReturnValue({ insert: insertMock });

    await expect(
      createReview({
        booking_id: 'b',
        equipment_id: 'e',
        reviewer_id: 'u',
        reviewee_id: null,
        rating: 5,
        title: 'ok',
        comment: 'x'.repeat(5001),
        is_equipment_review: true,
      } as Parameters<typeof createReview>[0])
    ).rejects.toThrow(/Review must be 5000 characters or fewer/);

    expect(fromMock).not.toHaveBeenCalled();
  });

  it('addReviewResponse rejects oversized response', async () => {
    fromMock.mockReturnValue({ update: vi.fn() });

    await expect(
      addReviewResponse('rev-1', 'x'.repeat(2001))
    ).rejects.toThrow(/Response must be 2000 characters or fewer/);

    expect(fromMock).not.toHaveBeenCalled();
  });

  it('updateProfile rejects oversized bio before calling supabase', async () => {
    const updateMock = vi.fn();
    fromMock.mockReturnValue({ update: updateMock });

    await expect(
      updateProfile('u-1', { bio: 'x'.repeat(501) })
    ).rejects.toThrow(/Bio must be 500 characters or fewer/);

    expect(fromMock).not.toHaveBeenCalled();
  });

  it('updateProfile accepts bio at exactly 500 chars (does call supabase)', async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: 'u-1', bio: 'ok' }, error: null });
    const select = vi.fn().mockReturnValue({ single });
    const eq = vi.fn().mockReturnValue({ select });
    const update = vi.fn().mockReturnValue({ eq });
    fromMock.mockReturnValue({ update });

    await updateProfile('u-1', { bio: 'x'.repeat(500) });
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('createEquipment rejects oversized description before calling supabase', async () => {
    fromMock.mockReturnValue({ insert: vi.fn() });

    await expect(
      createEquipment({
        title: 'tractor',
        description: 'x'.repeat(5001),
        daily_rate: 100,
      } as unknown as Parameters<typeof createEquipment>[0])
    ).rejects.toThrow(/Description must be 5000 characters or fewer/);

    expect(fromMock).not.toHaveBeenCalled();
  });

  it('updateEquipment rejects oversized title before calling supabase', async () => {
    fromMock.mockReturnValue({ update: vi.fn() });

    await expect(
      updateEquipment('eq-1', { title: 'x'.repeat(201) })
    ).rejects.toThrow(/Title must be 200 characters or fewer/);

    expect(fromMock).not.toHaveBeenCalled();
  });

  // submitReview is the alternate review-write entry point (used by the
  // dashboard) that bypasses createReview. Both paths must enforce the
  // same cap, otherwise the DoS guard is incomplete.
  it('submitReview rejects oversized comment before calling supabase', async () => {
    fromMock.mockReturnValue({ insert: vi.fn() });

    await expect(
      submitReview({
        bookingId: 'b-1',
        equipmentId: 'eq-1',
        reviewerId: 'u-1',
        revieweeId: 'u-2',
        rating: 5,
        title: 'ok',
        comment: 'x'.repeat(5001),
      } as Parameters<typeof submitReview>[0])
    ).rejects.toThrow(/Review must be 5000 characters or fewer/);

    expect(fromMock).not.toHaveBeenCalled();
  });

  it('submitReview rejects oversized title before calling supabase', async () => {
    fromMock.mockReturnValue({ insert: vi.fn() });

    await expect(
      submitReview({
        bookingId: 'b-1',
        equipmentId: 'eq-1',
        reviewerId: 'u-1',
        revieweeId: 'u-2',
        rating: 5,
        title: 'x'.repeat(201),
        comment: 'fine',
      } as Parameters<typeof submitReview>[0])
    ).rejects.toThrow(/Review title must be 200 characters or fewer/);

    expect(fromMock).not.toHaveBeenCalled();
  });
});
