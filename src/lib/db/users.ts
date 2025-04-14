/**
 * User database operations
 * 
 * Utility functions for user-related database operations
 */

import { connectToDatabase } from './connection';
import { Profile, ProfilePreferences } from '@/types/database';
import { encryptData, decryptData } from '@/lib/utils/encryption';
import { createLogEntry, LogAction } from './auditLog';
import { NextRequest } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get a user profile by ID
 * 
 * @param userId - The user ID
 * @returns The user profile or null if not found
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const supabase = await connectToDatabase(true);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      if (error.message.includes('not found')) {
        return null;
      }
      throw error;
    }
    
    return data as Profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to fetch user profile');
  }
}

/**
 * Create a user profile
 * 
 * @param userId - The user ID
 * @param profile - The profile data
 * @param requestInfo - Optional request information for audit logging
 * @returns The created profile
 */
export async function createUserProfile(
  userId: string, 
  profile: Partial<Profile>,
  requestInfo?: { ip: string; userAgent: string }
): Promise<Profile> {
  try {
    const supabase = await connectToDatabase(true);
    
    // Set default values if not provided
    const profileWithDefaults = {
      user_id: userId,
      name: profile.name || null,
      avatar_url: profile.avatar_url || null,
      bio: profile.bio || null,
      interests: profile.interests || [],
      preferences: profile.preferences || {
        theme: 'system',
        fontSize: 'medium',
        notificationsEnabled: true
      },
      is_email_verified: profile.is_email_verified || false,
      ...profile
    };
    
    const { data, error } = await supabase
      .from('profiles')
      .insert([profileWithDefaults])
      .select('*')
      .single();
    
    if (error) {
      throw error;
    }
    
    // Log the profile creation
    await createLogEntry({
      user_id: userId,
      action: 'profile_create',
      details: { profile_id: data.id },
      ip_address: requestInfo?.ip,
      user_agent: requestInfo?.userAgent
    });
    
    return data as Profile;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw new Error('Failed to create user profile');
  }
}

/**
 * Update a user profile
 * 
 * @param userId - The user ID
 * @param profile - The profile data to update
 * @param requestInfo - Optional request information for audit logging
 * @returns The updated profile
 */
export async function updateUserProfile(
  userId: string, 
  profile: Partial<Profile>,
  requestInfo?: { ip: string; userAgent: string }
): Promise<Profile> {
  try {
    const supabase = await connectToDatabase(true);
    
    const { data, error } = await supabase
      .from('profiles')
      .update(profile)
      .eq('user_id', userId)
      .select('*')
      .single();
    
    if (error) {
      throw error;
    }
    
    // Log the profile update
    await createLogEntry({
      user_id: userId,
      action: 'profile_update',
      details: { 
        profile_id: data.id,
        updated_fields: Object.keys(profile)
      },
      ip_address: requestInfo?.ip,
      user_agent: requestInfo?.userAgent
    });
    
    return data as Profile;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update user profile');
  }
}

/**
 * Update user preferences
 * 
 * @param userId - The user ID
 * @param preferences - The preferences to update
 * @param requestInfo - Optional request information for audit logging
 * @returns The updated profile
 */
export async function updateUserPreferences(
  userId: string,
  preferences: Partial<ProfilePreferences>,
  requestInfo?: { ip: string; userAgent: string }
): Promise<Profile> {
  try {
    // First get the current profile
    const profile = await getUserProfile(userId);
    
    if (!profile) {
      throw new Error('User profile not found');
    }
    
    // Merge existing preferences with new ones
    const updatedPreferences = {
      ...profile.preferences,
      ...preferences
    };
    
    // Update the profile with the new preferences
    const updatedProfile = await updateUserProfile(
      userId, 
      { preferences: updatedPreferences as any },
      requestInfo
    );
    
    // Log the preferences update
    await createLogEntry({
      user_id: userId,
      action: 'preferences_update',
      details: { 
        updated_preferences: Object.keys(preferences)
      },
      ip_address: requestInfo?.ip,
      user_agent: requestInfo?.userAgent
    });
    
    return updatedProfile;
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw new Error('Failed to update user preferences');
  }
}

/**
 * Update the user's last login timestamp
 * 
 * @param userId - The user ID
 * @param requestInfo - Optional request information for audit logging
 * @returns The updated profile
 */
export async function updateLastLogin(
  userId: string,
  requestInfo?: { ip: string; userAgent: string }
): Promise<Profile> {
  try {
    const supabase = await connectToDatabase(true);
    
    const { data, error } = await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('user_id', userId)
      .select('*')
      .single();
    
    if (error) {
      throw error;
    }
    
    // Log the login
    await createLogEntry({
      user_id: userId,
      action: 'login_success',
      ip_address: requestInfo?.ip,
      user_agent: requestInfo?.userAgent
    });
    
    return data as Profile;
  } catch (error) {
    console.error('Error updating last login:', error);
    throw new Error('Failed to update last login');
  }
}

/**
 * Store encrypted sensitive user information
 * 
 * @param userId - The user ID
 * @param sensitiveData - The sensitive data to encrypt and store
 * @param requestInfo - Optional request information for audit logging
 * @returns Success status
 */
export async function storeSensitiveUserData(
  userId: string,
  sensitiveData: any,
  requestInfo?: { ip: string; userAgent: string }
): Promise<boolean> {
  try {
    const supabase = await connectToDatabase(true);
    
    // Encrypt the sensitive data
    const encryptedData = encryptData(sensitiveData);
    
    // Store the encrypted data
    const { error } = await supabase
      .from('profiles')
      .update({ sensitive_info: encryptedData })
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    // Log the sensitive data update (without the actual data)
    await createLogEntry({
      user_id: userId,
      action: 'profile_update',
      details: { 
        updated_fields: ['sensitive_info']
      },
      severity: 'warning', // Higher severity for sensitive operations
      ip_address: requestInfo?.ip,
      user_agent: requestInfo?.userAgent
    });
    
    return true;
  } catch (error) {
    console.error('Error storing sensitive user data:', error);
    throw new Error('Failed to store sensitive user data');
  }
}

/**
 * Retrieve and decrypt sensitive user information
 * 
 * @param userId - The user ID
 * @returns Decrypted sensitive data
 */
export async function getSensitiveUserData(userId: string): Promise<any> {
  try {
    const supabase = await connectToDatabase(true);
    
    const { data, error } = await supabase
      .from('profiles')
      .select('sensitive_info')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      throw error;
    }
    
    if (!data?.sensitive_info) {
      return null;
    }
    
    // Convert from base64 to Buffer if needed
    const encryptedBuffer = typeof data.sensitive_info === 'string' 
      ? Buffer.from(data.sensitive_info, 'base64')
      : data.sensitive_info;
    
    // Decrypt the data
    return decryptData(encryptedBuffer);
  } catch (error) {
    console.error('Error getting sensitive user data:', error);
    throw new Error('Failed to get sensitive user data');
  }
}

/**
 * Generate an email verification token for a user
 * 
 * @param userId - The user ID
 * @returns The generated token
 */
export async function generateEmailVerificationToken(userId: string): Promise<string> {
  try {
    const supabase = await connectToDatabase(true);
    
    // Generate a unique token
    const token = uuidv4();
    
    // Set expiry to 24 hours from now
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);
    
    // Store the token and expiry in the profile
    const { error } = await supabase
      .from('profiles')
      .update({
        email_verification_token: token,
        email_verification_token_expiry: expiry.toISOString()
      })
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    
    return token;
  } catch (error) {
    console.error('Error generating email verification token:', error);
    throw new Error('Failed to generate email verification token');
  }
}

/**
 * Verify a user's email using the verification token
 * 
 * @param userId - The user ID
 * @param token - The verification token to validate
 * @returns Success status
 */
export async function verifyUserEmail(
  userId: string, 
  token: string,
  requestInfo?: { ip: string; userAgent: string }
): Promise<boolean> {
  try {
    const supabase = await connectToDatabase(true);
    
    // Get the stored token and expiry
    const { data, error } = await supabase
      .from('profiles')
      .select('email_verification_token, email_verification_token_expiry')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      throw error;
    }
    
    // Check if token matches and is not expired
    if (
      data.email_verification_token !== token ||
      !data.email_verification_token_expiry ||
      new Date(data.email_verification_token_expiry) < new Date()
    ) {
      return false;
    }
    
    // Mark email as verified and clear token
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_email_verified: true,
        email_verification_token: null,
        email_verification_token_expiry: null
      })
      .eq('user_id', userId);
    
    if (updateError) {
      throw updateError;
    }
    
    // Log the email verification
    await createLogEntry({
      user_id: userId,
      action: 'email_change',
      details: { verified: true },
      ip_address: requestInfo?.ip,
      user_agent: requestInfo?.userAgent
    });
    
    return true;
  } catch (error) {
    console.error('Error verifying user email:', error);
    throw new Error('Failed to verify user email');
  }
}

/**
 * Extract request information from a NextRequest object for audit logging
 * 
 * @param req - The NextRequest object
 * @returns Object containing IP address and user agent
 */
export function getRequestInfo(req: NextRequest): { ip: string; userAgent: string } {
  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             'unknown';
  
  const userAgent = req.headers.get('user-agent') || 'unknown';
  
  return { ip, userAgent };
} 