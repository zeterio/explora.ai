/**
 * API route for user profile operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserProfile, updateUserProfile, getRequestInfo } from '@/lib/db/users';
import { getCurrentUser } from '@/lib/auth/server';

/**
 * GET /api/user/profile
 * Get the current user's profile
 */
export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user from session
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get the user's profile
    const profile = await getUserProfile(user.id);
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }
    
    // Return the profile data
    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error in GET /api/user/profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/user/profile
 * Update the current user's profile
 */
export async function PATCH(req: NextRequest) {
  try {
    // Get the authenticated user from session
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const data = await req.json();
    
    // Extract request info for audit logging
    const requestInfo = getRequestInfo(req);
    
    // Update allowed fields only
    const allowedFields = [
      'name', 
      'bio', 
      'interests', 
      'preferences'
    ];
    
    const updateData: Record<string, any> = {};
    
    // Filter to only allowed fields
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }
    
    // Check if there are any fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }
    
    // Update the profile
    const updatedProfile = await updateUserProfile(
      user.id, 
      updateData, 
      requestInfo
    );
    
    // Return the updated profile
    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error('Error in PATCH /api/user/profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
} 