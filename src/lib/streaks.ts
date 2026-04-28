export function calculateCurrentStreak(completions: string[], today?: string): number {
  const todayDate = today || new Date().toISOString().split('T')[0];

  const unique = [...new Set(completions)].sort();

  if (!unique.includes(todayDate)) {
    return 0;
  }

  let streak = 0;
  let current = new Date(todayDate + 'T12:00:00Z');

  while (true) {
    const dateStr = current.toISOString().split('T')[0];
    if (unique.includes(dateStr)) {
      streak++;
      current.setUTCDate(current.getUTCDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
