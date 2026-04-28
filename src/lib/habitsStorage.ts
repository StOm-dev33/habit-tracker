import type { Habit } from '../types/habit';
import { v4 as uuidv4 } from 'uuid';
import { getUsers } from './auth';

const HABITS_KEY = 'habit-tracker-habits';

export function getHabits(): Habit[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(HABITS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveHabits(habits: Habit[]): void {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

export function getHabitsByUser(userId: string): Habit[] {
  return getHabits().filter((h) => h.userId === userId);
}

export function createHabit(userId: string, name: string, description: string): Habit {
  // Validate that userId exists in users
  const users = getUsers();
  const userExists = users.some((u) => u.id === userId);
  if (!userExists) {
    throw new Error('User does not exist');
  }

  const habits = getHabits();
  const newHabit: Habit = {
    id: uuidv4(),
    userId,
    name,
    description,
    frequency: 'daily',
    createdAt: new Date().toISOString(),
    completions: [],
  };
  habits.push(newHabit);
  saveHabits(habits);
  return newHabit;
}

export function updateHabit(updated: Habit): void {
  const habits = getHabits();
  const index = habits.findIndex((h) => h.id === updated.id);
  if (index !== -1) {
    habits[index] = updated;
    saveHabits(habits);
  }
}

export function deleteHabit(habitId: string): void {
  const habits = getHabits().filter((h) => h.id !== habitId);
  saveHabits(habits);
}

export function deleteHabitsByUserId(userId: string): void {
  const habits = getHabits().filter((h) => h.userId !== userId);
  saveHabits(habits);
}
