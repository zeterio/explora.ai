/**
 * File Upload Utilities
 * 
 * This module handles file uploads, particularly user avatars/profile pictures.
 */

import { connectToDatabase } from './connection';
import { updateUserProfile } from './users';
import { createLogEntry } from './auditLog';
import { v4 as uuidv4 } from 'uuid';

/**
 * Upload a profile picture for a user
 * 
 * @param userId - The user ID
 * @param file - The file to upload (Buffer or Base64)
 * @param filename - The original filename
 * @param contentType - The file's content type
 * @param requestInfo - Optional request information for audit logging
 * @returns The URL of the uploaded image
 */
export async function uploadProfilePicture(
  userId: string,
  file: Buffer | string,
  filename: string,
  contentType: string,
  requestInfo?: { ip: string; userAgent: string }
): Promise<string> {
  try {
    const supabase = await connectToDatabase(true);
    
    // Generate a unique filename
    const fileExt = filename.split('.').pop();
    const uniqueFilename = `${userId}/${uuidv4()}.${fileExt}`;
    
    // Convert data to appropriate format if needed
    const fileData = typeof file === 'string' 
      ? Buffer.from(file.replace(/^data:image\/\w+;base64,/, ''), 'base64')
      : file;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase
      .storage
      .from('avatars')
      .upload(uniqueFilename, fileData, {
        contentType,
        upsert: true,
      });
    
    if (error) {
      throw error;
    }
    
    // Get the public URL
    const { data: urlData } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(uniqueFilename);
    
    const publicUrl = urlData.publicUrl;
    
    // Update the user's profile with the new avatar URL
    await updateUserProfile(
      userId, 
      { avatar_url: publicUrl },
      requestInfo
    );
    
    // Create specific log entry for avatar upload
    await createLogEntry({
      user_id: userId,
      action: 'profile_update',
      details: { 
        updated_fields: ['avatar_url'],
        file_type: contentType
      },
      ip_address: requestInfo?.ip,
      user_agent: requestInfo?.userAgent
    });
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw new Error('Failed to upload profile picture');
  }
}

/**
 * Delete a user's profile picture
 * 
 * @param userId - The user ID
 * @param requestInfo - Optional request information for audit logging
 * @returns Success status
 */
export async function deleteProfilePicture(
  userId: string,
  requestInfo?: { ip: string; userAgent: string }
): Promise<boolean> {
  try {
    const supabase = await connectToDatabase(true);
    
    // First get the current profile to extract avatar URL
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('user_id', userId)
      .single();
    
    if (profileError) {
      throw profileError;
    }
    
    if (!profile.avatar_url) {
      // No avatar to delete
      return true;
    }
    
    // Extract filename from URL
    const url = new URL(profile.avatar_url);
    const pathParts = url.pathname.split('/');
    const filename = pathParts[pathParts.length - 1];
    const storagePath = `${userId}/${filename}`;
    
    // Delete the file from storage
    const { error: deleteError } = await supabase
      .storage
      .from('avatars')
      .remove([storagePath]);
    
    if (deleteError) {
      throw deleteError;
    }
    
    // Update profile to remove avatar URL
    await updateUserProfile(
      userId, 
      { avatar_url: null },
      requestInfo
    );
    
    // Log the avatar deletion
    await createLogEntry({
      user_id: userId,
      action: 'profile_update',
      details: { 
        updated_fields: ['avatar_url'],
        deleted: true
      },
      ip_address: requestInfo?.ip,
      user_agent: requestInfo?.userAgent
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    throw new Error('Failed to delete profile picture');
  }
} 