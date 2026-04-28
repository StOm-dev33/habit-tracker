import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

import LoginForm from '../../src/components/auth/LoginForm';
import SignupForm from '../../src/components/auth/SignupForm';
import { signUp, logout, deleteUser, getSession, getUsers } from '../../src/lib/auth';
import { createHabit, getHabits } from '../../src/lib/habitsStorage';

beforeEach(() => {
  localStorage.clear();
});

describe('auth flow', () => {
  it('submits the signup form and creates a session', async () => {
    render(<SignupForm />);
    fireEvent.change(screen.getByTestId('auth-signup-email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByTestId('auth-signup-password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByTestId('auth-signup-submit'));

    await waitFor(() => {
      const session = localStorage.getItem('habit-tracker-session');
      expect(session).not.toBeNull();
      const parsed = JSON.parse(session!);
      expect(parsed.email).toBe('test@example.com');
    });
  });

  it('shows an error for duplicate signup email', async () => {
    signUp('duplicate@example.com', 'password123');
    render(<SignupForm />);
    fireEvent.change(screen.getByTestId('auth-signup-email'), {
      target: { value: 'duplicate@example.com' },
    });
    fireEvent.change(screen.getByTestId('auth-signup-password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByTestId('auth-signup-submit'));

    await waitFor(() => {
      expect(screen.getByText('User already exists')).toBeInTheDocument();
    });
  });

  it('submits the login form and stores the active session', async () => {
    signUp('login@example.com', 'password123');
    localStorage.removeItem('habit-tracker-session');

    render(<LoginForm />);
    fireEvent.change(screen.getByTestId('auth-login-email'), {
      target: { value: 'login@example.com' },
    });
    fireEvent.change(screen.getByTestId('auth-login-password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByTestId('auth-login-submit'));

    await waitFor(() => {
      const session = localStorage.getItem('habit-tracker-session');
      expect(session).not.toBeNull();
      const parsed = JSON.parse(session!);
      expect(parsed.email).toBe('login@example.com');
    });
  });

  it('shows an error for invalid login credentials', async () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByTestId('auth-login-email'), {
      target: { value: 'wrong@example.com' },
    });
    fireEvent.change(screen.getByTestId('auth-login-password'), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByTestId('auth-login-submit'));

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });

  it('logout clears session and stores null', () => {
    signUp('logout@example.com', 'password123');
    expect(getSession()).not.toBeNull();
    
    logout();
    
    const session = localStorage.getItem('habit-tracker-session');
    expect(session).toBe('null'); // Stores explicit null
  });

  it('deleteUser removes user and cascades delete their habits', () => {
    const result = signUp('delete@example.com', 'password123');
    const userId = getUsers()[0].id;
    
    // Create a habit for the user
    createHabit(userId, 'Test Habit', 'Description');
    expect(getHabits()).toHaveLength(1);
    
    // Delete the user
    deleteUser(userId);
    
    // Verify user is deleted
    expect(getUsers()).toHaveLength(0);
    
    // Verify habits are cascade deleted
    expect(getHabits()).toHaveLength(0);
  });

  it('deleteUser clears session if deleting current user', () => {
    signUp('current@example.com', 'password123');
    const userId = getUsers()[0].id;
    
    expect(getSession()).not.toBeNull();
    
    deleteUser(userId);
    
    expect(getSession()).toBeNull();
  });
});
