// src/lib/db/index.ts

import { User, Session, Item, FileObject, Notification } from './types';

/**
 * Local database implementation for FretLab app
 */
class LocalDB {
  private static readonly DB_NAME = 'FretLabDB';
  private static readonly DB_VERSION = 1;

  private db: IDBDatabase | null = null;
  private isInitialized = false;

  /**
   * Initialize the database
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(LocalDB.DB_NAME, LocalDB.DB_VERSION);
      
      request.onerror = () => {
        console.error('Database error:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores for each entity
        if (!db.objectStoreNames.contains('users')) {
          const userStore = db.createObjectStore('users', { keyPath: 'id' });
          userStore.createIndex('email', 'email', { unique: true });
          userStore.createIndex('external_id', 'external_id', { unique: true });
        }
        
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionStore.createIndex('user_id', 'user_id');
          sessionStore.createIndex('refresh_token_hash', 'refresh_token_hash', { unique: true });
          sessionStore.createIndex('expires_at', 'expires_at');
        }
        
        if (!db.objectStoreNames.contains('items')) {
          const itemStore = db.createObjectStore('items', { keyPath: 'id' });
          itemStore.createIndex('owner_id', 'owner_id');
          itemStore.createIndex('created_at', 'created_at');
          itemStore.createIndex('status', 'status');
          itemStore.createIndex('deleted_at', 'deleted_at');
        }
        
        if (!db.objectStoreNames.contains('files')) {
          const fileStore = db.createObjectStore('files', { keyPath: 'id' });
          fileStore.createIndex('owner_id', 'owner_id');
          fileStore.createIndex('bucket_key', 'bucket_key', { unique: true });
        }
        
        if (!db.objectStoreNames.contains('notifications')) {
          const notificationStore = db.createObjectStore('notifications', { keyPath: 'id' });
          notificationStore.createIndex('user_id', 'user_id');
          notificationStore.createIndex('read_at', 'read_at');
          notificationStore.createIndex('created_at', 'created_at');
        }
      };
    });
  }

  /**
   * Get database instance (initializes if needed)
   */
  private async getDB(): Promise<IDBDatabase> {
    if (!this.isInitialized) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Database not initialized');
    }
    return this.db;
  }

  /* ── User methods ──────────────────────────────────────────── */

  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const db = await this.getDB();
    const id = crypto.randomUUID();
    const now = new Date();
    
    const newUser: User = {
      ...user,
      id,
      created_at: now,
      updated_at: now
    };
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.add(newUser);
      
      request.onsuccess = () => resolve(newUser);
      request.onerror = () => reject(request.error);
    });
  }

  async getUser(id: string): Promise<User | null> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['users'], 'readonly');
      const store = transaction.objectStore('users');
      const index = store.index('email');
      const request = index.get(email);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      
      // Get existing user
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        if (!getRequest.result) {
          reject(new Error('User not found'));
          return;
        }
        
        const updatedUser = {
          ...getRequest.result,
          ...updates,
          updated_at: new Date()
        };
        
        const putRequest = store.put(updatedUser);
        putRequest.onsuccess = () => resolve(updatedUser);
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteUser(id: string): Promise<void> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['users'], 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /* ── Session methods ───────────────────────────────────────── */

  async createSession(session: Omit<Session, 'id' | 'created_at'>): Promise<Session> {
    const db = await this.getDB();
    const id = crypto.randomUUID();
    const now = new Date();
    
    const newSession: Session = {
      ...session,
      id,
      created_at: now
    };
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sessions'], 'readwrite');
      const store = transaction.objectStore('sessions');
      const request = store.add(newSession);
      
      request.onsuccess = () => resolve(newSession);
      request.onerror = () => reject(request.error);
    });
  }

  async getSession(id: string): Promise<Session | null> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sessions'], 'readonly');
      const store = transaction.objectStore('sessions');
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getSessionByToken(tokenHash: string): Promise<Session | null> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sessions'], 'readonly');
      const store = transaction.objectStore('sessions');
      const index = store.index('refresh_token_hash');
      const request = index.get(tokenHash);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async updateSession(id: string, updates: Partial<Session>): Promise<Session> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sessions'], 'readwrite');
      const store = transaction.objectStore('sessions');
      
      // Get existing session
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        if (!getRequest.result) {
          reject(new Error('Session not found'));
          return;
        }
        
        const updatedSession = {
          ...getRequest.result,
          ...updates
        };
        
        const putRequest = store.put(updatedSession);
        putRequest.onsuccess = () => resolve(updatedSession);
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteSession(id: string): Promise<void> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['sessions'], 'readwrite');
      const store = transaction.objectStore('sessions');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /* ── Item methods (example resource) ───────────────────────── */

  async createItem(item: Omit<Item, 'id' | 'created_at' | 'updated_at'>): Promise<Item> {
    const db = await this.getDB();
    const id = crypto.randomUUID();
    const now = new Date();
    
    const newItem: Item = {
      ...item,
      id,
      created_at: now,
      updated_at: now
    };
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['items'], 'readwrite');
      const store = transaction.objectStore('items');
      const request = store.add(newItem);
      
      request.onsuccess = () => resolve(newItem);
      request.onerror = () => reject(request.error);
    });
  }

  async getItem(id: string): Promise<Item | null> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['items'], 'readonly');
      const store = transaction.objectStore('items');
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async listItems(ownerId: string, options?: { page?: number; limit?: number }): Promise<{ data: Item[]; page: { limit: number; offset: number; total: number } }> {
    const db = await this.getDB();
    
    // For simplicity, we're using an in-memory approach since IndexedDB
    // doesn't support offset for range queries like a normal database
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['items'], 'readonly');
      const store = transaction.objectStore('items');
      
      // First, get count of items (all active items)
      const countRequest = store.count();
      let count: number;
      
      countRequest.onsuccess = () => {
        count = countRequest.result;
        
        // Get all items that match owner and aren't deleted
        if (!options?.limit) options = { ...options, limit: 25 };
        if (!options?.page) options.page = 0;
        
        const offset = options.page * options.limit;
        const range = IDBKeyRange.bound([ownerId, new Date(0)], [ownerId, new Date(Date.now() + 1000000)]);
        
        const getAllRequest = store.getAll(range, options.limit);
        getAllRequest.onsuccess = () => {
          resolve({
            data: getAllRequest.result,
            page: {
              limit: options!.limit!,
              offset,
              total: count
            }
          });
        };
        getAllRequest.onerror = () => reject(getAllRequest.error);
      };
      countRequest.onerror = () => reject(countRequest.error);
    });
  }

  async updateItem(id: string, updates: Partial<Item>): Promise<Item> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['items'], 'readwrite');
      const store = transaction.objectStore('items');
      
      // Get existing item
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        if (!getRequest.result) {
          reject(new Error('Item not found'));
          return;
        }
        
        const updatedItem = {
          ...getRequest.result,
          ...updates,
          updated_at: new Date()
        };
        
        const putRequest = store.put(updatedItem);
        putRequest.onsuccess = () => resolve(updatedItem);
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async deleteItem(id: string): Promise<void> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['items'], 'readwrite');
      const store = transaction.objectStore('items');
      
      // Rather than full deletion, we do soft delete (set deleted_at)
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        if (!getRequest.result) {
          reject(new Error('Item not found'));
          return;
        }
        
        const updatedItem = {
          ...getRequest.result,
          deleted_at: new Date()
        };
        
        const putRequest = store.put(updatedItem);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  /* ── File methods ──────────────────────────────────────────── */

  async createFile(file: Omit<FileObject, 'id' | 'created_at'>): Promise<FileObject> {
    const db = await this.getDB();
    const id = crypto.randomUUID();
    const now = new Date();
    
    const newFile: FileObject = {
      ...file,
      id,
      created_at: now
    };
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      const request = store.add(newFile);
      
      request.onsuccess = () => resolve(newFile);
      request.onerror = () => reject(request.error);
    });
  }

  async getFile(id: string): Promise<FileObject | null> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      const request = store.get(id);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteFile(id: string): Promise<void> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['files'], 'readwrite');
      const store = transaction.objectStore('files');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /* ── Notification methods ──────────────────────────────────── */

  async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification> {
    const db = await this.getDB();
    const id = crypto.randomUUID();
    const now = new Date();
    
    const newNotification: Notification = {
      ...notification,
      id,
      created_at: now
    };
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['notifications'], 'readwrite');
      const store = transaction.objectStore('notifications');
      const request = store.add(newNotification);
      
      request.onsuccess = () => resolve(newNotification);
      request.onerror = () => reject(request.error);
    });
  }

  async getNotifications(userId: string, options?: { page?: number; limit?: number }): Promise<{ data: Notification[]; page: { limit: number; offset: number; total: number } }> {
    const db = await this.getDB();
    
    // For simplicity with IndexedDB, we'll just return paginated results
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['notifications'], 'readonly');
      const store = transaction.objectStore('notifications');
      
      const index = store.index('user_id');
      const range = IDBKeyRange.only(userId);
      
      // Get count of notifications
      const countRequest = index.count(range);
      
      countRequest.onsuccess = () => {
        const count = countRequest.result;
        
        if (!options?.limit) options = { ...options, limit: 25 };
        if (!options?.page) options.page = 0;
        
        const offset = options.page * options.limit;
        
        // Get notifications for user
        const getAllRequest = index.getAll(range, options.limit);
        getAllRequest.onsuccess = () => {
          resolve({
            data: getAllRequest.result,
            page: {
              limit: options!.limit!,
              offset,
              total: count
            }
          });
        };
        getAllRequest.onerror = () => reject(getAllRequest.error);
      };
      countRequest.onerror = () => reject(countRequest.error);
    });
  }

  async markNotificationAsRead(id: string): Promise<void> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['notifications'], 'readwrite');
      const store = transaction.objectStore('notifications');
      
      // Get existing notification
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        if (!getRequest.result) {
          reject(new Error('Notification not found'));
          return;
        }
        
        const updatedNotification = {
          ...getRequest.result,
          read_at: new Date()
        };
        
        const putRequest = store.put(updatedNotification);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    const db = await this.getDB();
    
    // Get all notifications for a user
    const transaction = db.transaction(['notifications'], 'readonly');
    const store = transaction.objectStore('notifications');
    const index = store.index('user_id');
    const range = IDBKeyRange.only(userId);
    const getAllRequest = index.getAll(range);
    
    getAllRequest.onsuccess = () => {
      const notifications = getAllRequest.result;
      
      // Update all notifications
      const updateTransaction = db.transaction(['notifications'], 'readwrite');
      const updateStore = updateTransaction.objectStore('notifications');
      
      for (const notification of notifications) {
        if (!notification.read_at) {  // Only mark unread ones as read
          const updated = { ...notification, read_at: new Date() };
          updateStore.put(updated);
        }
      }
      
      resolve();  
    };
    getAllRequest.onerror = () => reject(getAllRequest.error);
  }

  async deleteNotification(id: string): Promise<void> {
    const db = await this.getDB();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['notifications'], 'readwrite');
      const store = transaction.objectStore('notifications');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const localDB = new LocalDB();