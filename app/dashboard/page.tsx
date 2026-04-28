'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSession, logout } from '../../src/lib/auth';
import { getHabitsByUser, createHabit, updateHabit } from '../../src/lib/habitsStorage';
import type { Habit } from '../../src/types/habit';
import HabitCard from '../../src/components/habits/HabitCard';
import HabitForm from '../../src/components/habits/HabitForm';

export default function DashboardPage() {
  const router = useRouter();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [userId, setUserId] = useState('');

  const loadHabits = useCallback((uid: string) => {
    const userHabits = getHabitsByUser(uid);
    setHabits(userHabits);
  }, []);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push('/login');
      return;
    }
    setUserId(session.userId);
    loadHabits(session.userId);
  }, [router, loadHabits]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleSave = (name: string, description: string) => {
    if (editingHabit) {
      const updated: Habit = {
        ...editingHabit,
        name,
        description,
      };
      updateHabit(updated);
      setEditingHabit(null);
    } else {
      createHabit(userId, name, description);
    }
    setShowForm(false);
    loadHabits(userId);
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingHabit(null);
  };

  return (
    <div data-testid="dashboard-page" className="min-h-screen bg-gray-50">
      <header className="bg-indigo-600 text-white px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Habit Tracker</h1>
        <button
          data-testid="auth-logout-button"
          onClick={handleLogout}
          className="text-sm bg-indigo-700 hover:bg-indigo-800 px-3 py-1 rounded-md focus:outline-none focus:ring-2 focus:ring-white"
        >
          Log Out
        </button>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {!showForm && (
          <button
            data-testid="create-habit-button"
            onClick={() => { setShowForm(true); setEditingHabit(null); }}
            className="w-full mb-6 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            + Add New Habit
          </button>
        )}

        {showForm && (
          <HabitForm
            onSave={handleSave}
            onCancel={handleCancel}
            existing={editingHabit || undefined}
          />
        )}

        {habits.length === 0 && !showForm ? (
          <div
            data-testid="empty-state"
            className="text-center py-16 text-gray-400"
          >
            <p className="text-5xl mb-4">📋</p>
            <p className="text-lg font-medium">No habits yet</p>
            <p className="text-sm mt-1">Click the button above to add your first habit!</p>
          </div>
        ) : (
          habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onUpdate={() => loadHabits(userId)}
              onEdit={handleEdit}
            />
          ))
        )}
      </main>
    </div>
  );
}
