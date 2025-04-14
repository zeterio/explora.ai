/**
 * User Data Export and GDPR Compliance Functions
 * 
 * This module handles GDPR-related operations like data export and user deletion.
 */

import { connectToDatabase } from './connection';
import { getUserProfile } from './users';
import { Profile } from '@/types/database';

/**
 * Export all user data for GDPR compliance
 * 
 * @param userId - The user ID
 * @returns Object containing all user data
 */
export async function exportUserData(userId: string): Promise<Record<string, any>> {
  try {
    const supabase = await connectToDatabase(true);
    
    // Get user profile
    const profile = await getUserProfile(userId);
    
    if (!profile) {
      throw new Error('User profile not found');
    }
    
    // Get learning paths
    const { data: learningPaths, error: pathsError } = await supabase
      .from('learning_paths')
      .select('*')
      .eq('user_id', userId);
    
    if (pathsError) {
      throw pathsError;
    }
    
    // TODO: Add other user-related data as needed
    
    // Compile all user data into a single object
    const userData = {
      profile,
      learningPaths: learningPaths || [],
      // Add other data types here
    };
    
    return userData;
  } catch (error) {
    console.error('Error exporting user data:', error);
    throw new Error('Failed to export user data');
  }
}

/**
 * Delete user account and all associated data
 * 
 * @param userId - The user ID
 * @returns Success status
 */
export async function deleteUserAccount(userId: string): Promise<{ success: boolean }> {
  try {
    const supabase = await connectToDatabase(true);
    
    // First, delete profile (should cascade to other tables via foreign keys)
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId);
    
    if (profileError) {
      throw profileError;
    }
    
    // Then delete the actual auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    
    if (authError) {
      throw authError;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw new Error('Failed to delete user account');
  }
} 