/**
 * API route for handling user avatar/profile picture operations
 */

import { NextRequest, NextResponse } from 'next/server';
import { uploadProfilePicture, deleteProfilePicture } from '@/lib/db/uploads';
import { getRequestInfo } from '@/lib/db/users';
import { getCurrentUser } from '@/lib/auth/server';

/**
 * POST /api/user/avatar
 * Upload a new profile picture
 */
export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if the request is multipart/form-data
    const contentType = req.headers.get('content-type') || '';
    
    // Handle different upload formats
    let file: Buffer | string;
    let filename: string;
    let mimeType: string;
    
    if (contentType.includes('multipart/form-data')) {
      // Handle multipart form data upload
      const formData = await req.formData();
      const fileData = formData.get('file') as File;
      
      if (!fileData) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        );
      }
      
      file = Buffer.from(await fileData.arrayBuffer());
      filename = fileData.name;
      mimeType = fileData.type;
    } else {
      // Handle JSON upload with base64 data
      const data = await req.json();
      
      if (!data.file || !data.filename || !data.contentType) {
        return NextResponse.json(
          { error: 'Missing required fields: file, filename, contentType' },
          { status: 400 }
        );
      }
      
      file = data.file as string;
      filename = data.filename as string;
      mimeType = data.contentType as string;
    }
    
    // Validate file type
    if (!mimeType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }
    
    // Get request info for audit logging
    const requestInfo = getRequestInfo(req);
    
    // Upload the avatar
    const avatarUrl = await uploadProfilePicture(
      user.id,
      file,
      filename,
      mimeType,
      requestInfo
    );
    
    return NextResponse.json({ 
      success: true,
      avatarUrl
    });
  } catch (error) {
    console.error('Error in POST /api/user/avatar:', error);
    return NextResponse.json(
      { error: 'Failed to upload profile picture' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/avatar
 * Delete the current profile picture
 */
export async function DELETE(req: NextRequest) {
  try {
    // Get the authenticated user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get request info for audit logging
    const requestInfo = getRequestInfo(req);
    
    // Delete the avatar
    await deleteProfilePicture(user.id, requestInfo);
    
    return NextResponse.json({ 
      success: true 
    });
  } catch (error) {
    console.error('Error in DELETE /api/user/avatar:', error);
    return NextResponse.json(
      { error: 'Failed to delete profile picture' },
      { status: 500 }
    );
  }
} 