/**
 * API route for handling email verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateEmailVerificationToken, verifyUserEmail, getRequestInfo } from '@/lib/db/users';
import { getCurrentUser } from '@/lib/auth/server';

/**
 * POST /api/user/email-verification
 * Request a new email verification token
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
    
    // Generate a new verification token
    const token = await generateEmailVerificationToken(user.id);
    
    // In a real app, you would now send an email with the verification link
    // e.g., sendVerificationEmail(user.email, token);
    
    // For development purposes, we'll return the token directly
    // In production, you should only return a success message
    const isProduction = process.env.NODE_ENV === 'production';
    
    return NextResponse.json({
      success: true,
      message: 'Verification email sent',
      ...(isProduction ? {} : { token })
    });
  } catch (error) {
    console.error('Error in POST /api/user/email-verification:', error);
    return NextResponse.json(
      { error: 'Failed to send verification email' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/email-verification
 * Verify email with the provided token
 */
export async function PUT(req: NextRequest) {
  try {
    // Get the authenticated user
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse the request body to get the token
    const data = await req.json();
    
    if (!data.token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }
    
    // Get request info for audit logging
    const requestInfo = getRequestInfo(req);
    
    // Verify the email
    const success = await verifyUserEmail(user.id, data.token, requestInfo);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Error in PUT /api/user/email-verification:', error);
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    );
  }
} 