'use client';

import { useState } from 'react';
import { validateHabitName } from '../../lib/validators';
import type { Habit } from '../../types/habit';

type Props = {
  onSave: (name: string, description: string) => void;
  onCancel: () => void;
  existing?: Habit;
};

export default function HabitForm({ onSave, onCancel, existing }: Props) {
  const [name, setName] = useState(existing?.name || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateHabitName(name);
    if (!validation.valid) {
      setError(validation.error || 'Invalid name');
      return;
    }
    setError('');
    onSave(validation.value, description);
  };

  return (
    <div data-testid="habit-form" className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        {existing ? 'Edit Habit' : 'New Habit'}
      </h3>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="habit-name" className="block text-sm font-medium text-gray-700 mb-1">
            Habit Name
          </label>
          <input
            id="habit-name"
            type="text"
            data-testid="habit-name-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. Drink Water"
          />
        </div>

        <div>
          <label htmlFor="habit-description" className="block text-sm font-medium text-gray-700 mb-1">
            Description (optional)
          </label>
          <input
            id="habit-description"
            type="text"
            data-testid="habit-description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="e.g. Drink 8 glasses a day"
          />
        </div>

        <div>
          <label htmlFor="habit-frequency" className="block text-sm font-medium text-gray-700 mb-1">
            Frequency
          </label>
          <select
            id="habit-frequency"
            data-testid="habit-frequency-select"
            defaultValue="daily"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="daily">Daily</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            data-testid="habit-save-button"
            className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            Save Habit
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
