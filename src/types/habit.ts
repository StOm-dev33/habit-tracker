export type Habit = {
  id: string; // UUID, unique
  userId: string; // References User.id (must exist)
  name: string;
  description: string;
  frequency: 'daily';
  createdAt: string; // ISO timestamp
  completions: string[]; // Array of unique YYYY-MM-DD dates
};
