'use client';

import { useState } from 'react';
import type { Habit } from '../../types/habit';
import { getHabitSlug } from '../../lib/slug';
import { calculateCurrentStreak } from '../../lib/streaks';
import { toggleHabitCompletion } from '../../lib/habits';
import { updateHabit, deleteHabit } from '../../lib/habitsStorage';

type Props = {
  habit: Habit;
  onUpdate: () => void;
  onEdit: (habit: Habit) => void;
};

export default function HabitCard({ habit, onUpdate, onEdit }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const slug = getHabitSlug(habit.name);
  const today = new Date().toISOString().split('T')[0];
  const isCompleted = habit.completions.includes(today);
  const streak = calculateCurrentStreak(habit.completions);

  const handleToggle = () => {
    const updated = toggleHabitCompletion(habit, today);
    updateHabit(updated);
    onUpdate();
  };

  const handleDelete = () => {
    deleteHabit(habit.id);
    onUpdate();
  };

  return (
    <div
      data-testid={`habit-card-${slug}`}
      className={`p-4 rounded-lg shadow-sm border-2 mb-4 ${
        isCompleted ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 text-lg">{habit.name}</h3>
          {habit.description && (
            <p className="text-gray-500 text-sm mt-1">{habit.description}</p>
          )}
          <div
            data-testid={`habit-streak-${slug}`}
            className="mt-2 text-sm font-medium text-indigo-600"
          >
            🔥 {streak} day{streak !== 1 ? 's' : ''} streak
          </div>
        </div>

        <div className="flex flex-col gap-2 ml-4">
          <button
            data-testid={`habit-complete-${slug}`}
            onClick={handleToggle}
            className={`px-3 py-1 rounded-md text-sm font-medium focus:outline-none focus:ring-2 ${
              isCompleted
                ? 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-400'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400'
            }`}
          >
            {isCompleted ? '✓ Done' : 'Mark Done'}
          </button>

          <button
            data-testid={`habit-edit-${slug}`}
            onClick={() => onEdit(habit)}
            className="px-3 py-1 rounded-md text-sm font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Edit
          </button>

          <button
            data-testid={`habit-delete-${slug}`}
            onClick={() => setShowConfirm(true)}
            className="px-3 py-1 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-400"
          >
            Delete
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="mt-4 p-3 bg-red-50 rounded-md border border-red-200">
          <p className="text-sm text-red-700 mb-3">
            Are you sure you want to delete this habit?
          </p>
          <div className="flex gap-2">
            <button
              data-testid="confirm-delete-button"
              onClick={handleDelete}
              className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
