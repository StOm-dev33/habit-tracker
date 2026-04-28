import { describe, it, expect } from 'vitest';
import { toggleHabitCompletion } from '../../src/lib/habits';
import type { Habit } from '../../src/types/habit';

const baseHabit: Habit = {
  id: '1',
  userId: 'user1',
  name: 'Drink Water',
  description: '',
  frequency: 'daily',
  createdAt: '2024-01-01T00:00:00.000Z',
  completions: [],
};

describe('toggleHabitCompletion', () => {
  it('adds a completion date when the date is not present', () => {
    const result = toggleHabitCompletion(baseHabit, '2024-01-10');
    expect(result.completions).toContain('2024-01-10');
  });

  it('removes a completion date when the date already exists', () => {
    const habit = { ...baseHabit, completions: ['2024-01-10'] };
    const result = toggleHabitCompletion(habit, '2024-01-10');
    expect(result.completions).not.toContain('2024-01-10');
  });

  it('does not mutate the original habit object', () => {
    const habit = { ...baseHabit, completions: ['2024-01-09'] };
    toggleHabitCompletion(habit, '2024-01-10');
    expect(habit.completions).toEqual(['2024-01-09']);
  });

  it('does not return duplicate completion dates', () => {
    const habit = { ...baseHabit, completions: ['2024-01-10', '2024-01-10'] };
    const result = toggleHabitCompletion(habit, '2024-01-09');
    const count = result.completions.filter((d) => d === '2024-01-10').length;
    expect(count).toBe(1);
  });
});
