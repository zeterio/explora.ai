/**
 * Database connection utility
 * 
 * This module handles database connection management.
 * It uses a singleton pattern to reuse connections across API requests.
 */

import { getSupabase } from './supabase';

// Define connection state interface
interface ConnectionStatus {
  isConnected: boolean;
  client: any | null;
}

// Initialize connection state
const connectionState: ConnectionStatus = {
  isConnected: false,
  client: null,
};

/**
 * Connect to the database
 * @param {boolean} isAdmin - Whether to use admin privileges
 * @returns Promise resolving to the Supabase client
 */
export async function connectToDatabase(isAdmin = false) {
  // If already connected, return the existing connection
  if (connectionState.isConnected && connectionState.client) {
    return connectionState.client;
  }

  try {
    // Get the Supabase client instance
    const supabaseClient = getSupabase(isAdmin);
    
    // Verify connection by making a simple query
    const { data, error } = await supabaseClient.from('health_check').select('*').limit(1).maybeSingle();
    
    if (error && !error.message.includes('relation "health_check" does not exist')) {
      // If error is not just about missing table, it's a real connection error
      throw error;
    }
    
    // Connection is successful
    connectionState.isConnected = true;
    connectionState.client = supabaseClient;
    
    console.log('Supabase connected successfully');
    return connectionState.client;
  } catch (error) {
    console.error('Supabase connection failed:', error);
    throw new Error('Failed to connect to Supabase');
  }
}

/**
 * Disconnect from the database
 * Used primarily in testing and when shutting down the application
 */
export async function disconnectFromDatabase() {
  if (!connectionState.isConnected) {
    return;
  }

  try {
    // Supabase doesn't need explicit disconnection, 
    // but we'll reset our connection state
    connectionState.isConnected = false;
    connectionState.client = null;
    
    console.log('Database client reset successfully');
  } catch (error) {
    console.error('Database client reset failed:', error);
    throw new Error('Failed to reset database connection');
  }
} 