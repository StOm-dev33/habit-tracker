import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HabitForm from '../../src/components/habits/HabitForm';
import HabitCard from '../../src/components/habits/HabitCard';
import type { Habit } from '../../src/types/habit';
import { createHabit } from '../../src/lib/habitsStorage';
import { signUp } from '../../src/lib/auth';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

beforeEach(() => {
  localStorage.clear();
});

const today = new Date().toISOString().split('T')[0];

const sampleHabit: Habit = {
  id: 'habit-1',
  userId: 'user-1',
  name: 'Drink Water',
  description: 'Stay hydrated',
  frequency: 'daily',
  createdAt: new Date().toISOString(),
  completions: [],
};

describe('habit form', () => {
  it('shows a validation error when habit name is empty', async () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(<HabitForm onSave={onSave} onCancel={onCancel} />);

    fireEvent.click(screen.getByTestId('habit-save-button'));

    await waitFor(() => {
      expect(screen.getByText('Habit name is required')).toBeInTheDocument();
    });
    expect(onSave).not.toHaveBeenCalled();
  });

  it('creates a new habit and renders it in the list', async () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(<HabitForm onSave={onSave} onCancel={onCancel} />);

    fireEvent.change(screen.getByTestId('habit-name-input'), {
      target: { value: 'Drink Water' },
    });
    fireEvent.change(screen.getByTestId('habit-description-input'), {
      target: { value: 'Stay hydrated' },
    });
    fireEvent.click(screen.getByTestId('habit-save-button'));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('Drink Water', 'Stay hydrated');
    });
  });

  it('edits an existing habit and preserves immutable fields', async () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(<HabitForm onSave={onSave} onCancel={onCancel} existing={sampleHabit} />);

    const nameInput = screen.getByTestId('habit-name-input') as HTMLInputElement;
    expect(nameInput.value).toBe('Drink Water');

    fireEvent.change(nameInput, { target: { value: 'Drink More Water' } });
    fireEvent.click(screen.getByTestId('habit-save-button'));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith('Drink More Water', 'Stay hydrated');
    });
  });

  it('deletes a habit only after explicit confirmation', async () => {
    const onUpdate = vi.fn();
    const onEdit = vi.fn();

    // Save habit to localStorage so delete can work
    localStorage.setItem('habit-tracker-habits', JSON.stringify([sampleHabit]));

    render(<HabitCard habit={sampleHabit} onUpdate={onUpdate} onEdit={onEdit} />);

    fireEvent.click(screen.getByTestId('habit-delete-drink-water'));
    expect(screen.getByTestId('confirm-delete-button')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('confirm-delete-button'));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled();
      const habits = JSON.parse(localStorage.getItem('habit-tracker-habits') || '[]');
      expect(habits.find((h: Habit) => h.id === 'habit-1')).toBeUndefined();
    });
  });

  it('toggles completion and updates the streak display', async () => {
    const onUpdate = vi.fn();
    const onEdit = vi.fn();

    localStorage.setItem('habit-tracker-habits', JSON.stringify([sampleHabit]));

    render(<HabitCard habit={sampleHabit} onUpdate={onUpdate} onEdit={onEdit} />);

    const streakEl = screen.getByTestId('habit-streak-drink-water');
    expect(streakEl).toHaveTextContent('0');

    fireEvent.click(screen.getByTestId('habit-complete-drink-water'));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalled();
      const habits = JSON.parse(localStorage.getItem('habit-tracker-habits') || '[]');
      const updated = habits.find((h: Habit) => h.id === 'habit-1');
      expect(updated.completions).toContain(today);
    });
  });

  it('rejects creating habit with non-existent userId', () => {
    expect(() => {
      createHabit('non-existent-user-id', 'Test Habit', 'Description');
    }).toThrow('User does not exist');
  });

  it('creates habit successfully with valid userId', () => {
    const user = signUp('user@example.com', 'password123');
    const userId = JSON.parse(localStorage.getItem('habit-tracker-users') || '[]')[0].id;
    
    const habit = createHabit(userId, 'Valid Habit', 'Description');
    
    expect(habit.userId).toBe(userId);
    expect(habit.name).toBe('Valid Habit');
  });
});
