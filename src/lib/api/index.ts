// src/lib/api/index.ts

import { User, Session, Item, FileObject, Notification } from '../db/types';

// Mock API client for FretLab app
class APIClient {
  private baseUrl = '/api/v1';
  
  // Handle API errors
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    return response.json();
  }

  /* ── Auth endpoints ────────────────────────────────────────── */

  async getCurrentUser(): Promise<User> {
    // In a real implementation, this would make an HTTP request
    // For mock purposes, we'll use localStorage to simulate session
    
    const session = this.getSessionFromStorage();
    if (!session) {
      throw new Error('Not authenticated');
    }
    
    return session.user;
  }

  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    // In a real implementation, this would make an HTTP request to the auth endpoint
    
    // Mock login - in production would call API
    const users = await this.getAllUsers();
    const user = users.find(u => u.email === email);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Simple mock token generation
    const token = btoa(`${email}:${password}`);
    
    // Store session in localStorage
    const session = {
      user,
      token,
      expires_at: new Date(Date.now() + 3600000) // 1 hour
    };
    this.setSessionToStorage(session);
    
    return { 
      user: session.user,
      token: session.token 
    };
  }

  async logout(): Promise<void> {
    // Remove session from localStorage
    this.clearSessionFromStorage();
  }

  async register(displayName: string, email: string, password: string): Promise<{ user: User; token: string }> {
    // In a real implementation, this would make an HTTP request to the register endpoint
    
    const user: User = {
      id: crypto.randomUUID(),
      email,
      display_name: displayName,
      role: 'member',
      created_at: new Date(),
      updated_at: new Date(),
      external_id: null,
      password_hash: btoa(password), // This should be properly hashed in real app
      avatar_file_id: null,
      email_verified_at: null,
      deleted_at: null
    };
    
    // In a real implementation we'd store this to the backend
    // Here we're using localStorage and localDB for simplicity
    
    const token = btoa(`${email}:${password}`);
    
    const session = {
      user,
      token,
      expires_at: new Date(Date.now() + 3600000) // 1 hour
    };
    this.setSessionToStorage(session);
    
    return { 
      user: session.user,
      token: session.token 
    };
  }

  /* ── User profile endpoints ────────────────────────────────── */

  async getProfile(): Promise<User> {
    const session = this.getSessionFromStorage();
    if (!session) {
      throw new Error('Not authenticated');
    }
    
    return session.user;
  }

  async updateProfile(updates: Partial<Omit<User, 'id' | 'email' | 'created_at' | 'updated_at' | 'role'>>): Promise<User> {
    const session = this.getSessionFromStorage();
    if (!session) {
      throw new Error('Not authenticated');
    }
    
    const user = {
      ...session.user,
      ...updates,
      updated_at: new Date()
    };
    
    return user;
  }

  /* ── Item CRUD endpoints ───────────────────────────────────── */

  async listItems(options?: { page?: number; limit?: number }): Promise<{ data: Item[]; page: { limit: number; offset: number; total: number } }> {
    // This would normally be an HTTP request
    // In our case, using localDB
    
    const session = this.getSessionFromStorage();
    if (!session) {
      throw new Error('Not authenticated');
    }
    
    // For simplicity, return all items (in real app would support pagination)
    // We're going to create mock data here for demonstration purposes
    return {
      data: [],
      page: { limit: 25, offset: 0, total: 0 }
    };
  }

  async getItem(id: string): Promise<Item> {
    // In a real app, this would be an HTTP GET request
    throw new Error('Not implemented');
  }

  async createItem(item: Omit<Item, 'id' | 'created_at' | 'updated_at'>): Promise<Item> {
    // In a real app, this would be an HTTP POST request
    throw new Error('Not implemented');
  }

  async updateItem(id: string, updates: Partial<Omit<Item, 'id' | 'created_at' | 'updated_at'>>): Promise<Item> {
    // In a real app, this would be an HTTP PUT request
    throw new Error('Not implemented');
  }

  async deleteItem(id: string): Promise<void> {
    // In a real app, this would be an HTTP DELETE request
    throw new Error('Not implemented');
  }

  /* ── Notification endpoints ────────────────────────────────── */

  async listNotifications(options?: { page?: number; limit?: number }): Promise<{ data: Notification[]; page: { limit: number; offset: number; total: number } }> {
    // In a real app, this would be an HTTP GET request to notifications endpoint
    throw new Error('Not implemented');
  }

  async markNotificationAsRead(id: string): Promise<void> {
    // In a real app, this would be an HTTP PUT request
    throw new Error('Not implemented');
  }

  async markAllNotificationsAsRead(): Promise<void> {
    // In a real app, this would be an HTTP POST request
    throw new Error('Not implemented');
  }

  /* ── Helper methods ─────────────────────────────────────────── */

  private setSessionToStorage(session: { user: User; token: string; expires_at: Date }): void {
    const sessionData = {
      ...session,
      expires_at: session.expires_at.toISOString()
    };
    localStorage.setItem('fl_session', JSON.stringify(sessionData));
  }

  private getSessionFromStorage(): { user: User; token: string; expires_at: Date } | null {
    const sessionStr = localStorage.getItem('fl_session');
    if (!sessionStr) return null;
    
    try {
      const session = JSON.parse(sessionStr);
      session.expires_at = new Date(session.expires_at);
      
      // Check if session is expired
      if (session.expires_at < new Date()) {
        this.clearSessionFromStorage();
        return null;
      }
      
      return session;
    } catch {
      this.clearSessionFromStorage();
      return null;
    }
  }

  private clearSessionFromStorage(): void {
    localStorage.removeItem('fl_session');
  }

  private async getAllUsers(): Promise<User[]> {
    // For demo purposes, return some mock users
    return [
      {
        id: 'user-1',
        email: 'admin@example.com',
        display_name: 'Admin User',
        role: 'owner',
        created_at: new Date(),
        updated_at: new Date(),
        external_id: null,
        password_hash: btoa('admin123'),
        avatar_file_id: null,
        email_verified_at: new Date(),
        deleted_at: null
      },
      {
        id: 'user-2',
        email: 'member@example.com',
        display_name: 'Member User',  
        role: 'member',
        created_at: new Date(),
        updated_at: new Date(),
        external_id: null,
        password_hash: btoa('member123'),
        avatar_file_id: null,
        email_verified_at: new Date(),
        deleted_at: null
      }
    ];
  }
}

export const api = new APIClient();