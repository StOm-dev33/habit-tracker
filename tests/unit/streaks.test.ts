import { describe, it, expect } from 'vitest';
import { calculateCurrentStreak } from '../../src/lib/streaks';

/* MENTOR_TRACE_STAGE3_HABIT_A91 */

describe('calculateCurrentStreak', () => {
  const today = '2024-01-10';
  const yesterday = '2024-01-09';
  const twoDaysAgo = '2024-01-08';
  const threeDaysAgo = '2024-01-07';

  it('returns 0 when completions is empty', () => {
    expect(calculateCurrentStreak([], today)).toBe(0);
  });

  it('returns 0 when today is not completed', () => {
    expect(calculateCurrentStreak([yesterday], today)).toBe(0);
    expect(calculateCurrentStreak([yesterday, twoDaysAgo], today)).toBe(0);
  });

  it('returns the correct streak for consecutive completed days', () => {
    expect(calculateCurrentStreak([today], today)).toBe(1);
    expect(calculateCurrentStreak([today, yesterday], today)).toBe(2);
    expect(calculateCurrentStreak([today, yesterday, twoDaysAgo], today)).toBe(3);
    expect(calculateCurrentStreak([today, yesterday, twoDaysAgo, threeDaysAgo], today)).toBe(4);
  });

  it('ignores duplicate completion dates', () => {
    expect(calculateCurrentStreak([today, today, yesterday, yesterday], today)).toBe(2);
    expect(calculateCurrentStreak([today, today, today], today)).toBe(1);
  });

  it('breaks the streak when a calendar day is missing', () => {
    expect(calculateCurrentStreak([today, twoDaysAgo], today)).toBe(1);
    expect(calculateCurrentStreak([today, yesterday, threeDaysAgo], today)).toBe(2);
  });
});
