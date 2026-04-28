import type { User, Session } from '../types/auth';
import { v4 as uuidv4 } from 'uuid';

const USERS_KEY = 'habit-tracker-users';
const SESSION_KEY = 'habit-tracker-session';

export function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSession(): Session | null {
  if (typeof window === 'undefined') return null;
  const data = localStorage.getItem(SESSION_KEY);
  if (!data) return null;
  try {
    const parsed = JSON.parse(data);
    return parsed;
  } catch {
    return null;
  }
}

export function saveSession(session: Session | null): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function signUp(email: string, password: string): { success: boolean; error?: string } {
  const users = getUsers();
  const existing = users.find((u) => u.email === email);
  if (existing) {
    return { success: false, error: 'User already exists' };
  }
  const newUser: User = {
    id: uuidv4(),
    email,
    password,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);
  saveSession({ userId: newUser.id, email: newUser.email });
  return { success: true };
}

export function login(email: string, password: string): { success: boolean; error?: string } {
  const users = getUsers();
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) {
    return { success: false, error: 'Invalid email or password' };
  }
  saveSession({ userId: user.id, email: user.email });
  return { success: true };
}

export function deleteUser(userId: string): void {
  // Delete user from users array
  const users = getUsers();
  const filtered = users.filter((u) => u.id !== userId);
  saveUsers(filtered);
  
  // Cascade delete all habits belonging to this user
  if (typeof window !== 'undefined') {
    const habitsKey = 'habit-tracker-habits';
    const habitsData = localStorage.getItem(habitsKey);
    const habits = habitsData ? JSON.parse(habitsData) : [];
    const filteredHabits = habits.filter((h: any) => h.userId !== userId);
    localStorage.setItem(habitsKey, JSON.stringify(filteredHabits));
  }
  
  // Clear session if deleting current user
  const session = getSession();
  if (session && session.userId === userId) {
    saveSession(null);
  }
}

export function logout(): void {
  saveSession(null);
}
