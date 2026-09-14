// src/lib/auth.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from './db/types';
import { api } from './api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (displayName: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Get the current auth context.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Provider component for providing auth context throughout the app.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if session exists on app start
    checkSession();
  }, []);

  async function checkSession() {
    try {
      // Try to get current user from session
      const currentUser = await api.getProfile();
      setUser(currentUser);
    } catch (error) {
      // No valid session - clear user
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    try {
      const { user: loggedInUser } = await api.login(email, password);
      setUser(loggedInUser);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async function register(displayName: string, email: string, password: string) {
    try {
      const { user: registeredUser } = await api.register(displayName, email, password);
      setUser(registeredUser);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async function logout() {
    try {
      await api.logout();
      setUser(null);
    } catch (error) {
      // Even if logout fails, clear local state
      setUser(null);
    }
  }

  async function refreshSession() {
    try {
      const currentUser = await api.getProfile();
      setUser(currentUser);
    } catch (error) {
      setUser(null);
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}