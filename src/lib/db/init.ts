// src/lib/db/init.ts

import { localDB } from './index';

/**
 * Initialize the local database and seed with test data
 */
export async function initDatabase(): Promise<void> {
  try {
    await localDB.init();
    
    console.log('Local database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize local database:', error);
    throw error;
  }
}

// Initialize the database when this module is imported
initDatabase().catch(error => {
  console.error('Database initialization failed:', error);
});