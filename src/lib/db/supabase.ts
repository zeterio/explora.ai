/**
 * Supabase client utility
 * 
 * This module provides a Supabase client instance for database access.
 * It uses a singleton pattern to reuse the client across API requests.
 */

import { createClient } from '@supabase/supabase-js';

// Check if required environment variables are set
if (!process.env.SUPABASE_URL) {
  throw new Error('Missing environment variable: SUPABASE_URL');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing environment variable: SUPABASE_SERVICE_ROLE_KEY');
}

// Initialize Supabase client with service role key for server-side operations
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// For client-side operations, we'll use the anon key if available
export const supabaseClient = process.env.SUPABASE_ANON_KEY 
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
    )
  : null;

/**
 * Get the appropriate Supabase client based on the context
 * @param {boolean} isAdmin - Whether to use the admin client with service role key
 * @returns Supabase client instance
 */
export function getSupabase(isAdmin = false) {
  return isAdmin ? supabaseAdmin : (supabaseClient || supabaseAdmin);
}

/**
 * Helper to check if a Supabase error is a "not found" error
 */
export function isNotFoundError(error: any): boolean {
  return error?.message?.includes('not found') || error?.code === 'PGRST116';
}

/**
 * Helper to check if a Supabase error is a "duplicate" error
 */
export function isDuplicateError(error: any): boolean {
  return error?.message?.includes('duplicate key') || error?.code === '23505';
} 