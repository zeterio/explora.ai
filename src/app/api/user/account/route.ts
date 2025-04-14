/**
 * API route for account management, including deletion
 */

import { NextRequest, NextResponse } from 'next/server';
import { deleteUserAccount } from '@/lib/db/userDataExport';
import { getCurrentUser } from '@/lib/auth/server';
import { createLogEntry } from '@/lib/db/auditLog';
import { getRequestInfo } from '@/lib/db/users';

/**
 * DELETE /api/user/account
 * Delete the user's account (GDPR right to be forgotten)
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
    
    // For security, require confirmation
    const data = await req.json();
    
    if (!data.confirmation || data.confirmation !== 'DELETE_MY_ACCOUNT') {
      return NextResponse.json({
        error: 'Account deletion requires confirmation',
        message: 'Please provide the confirmation field with value "DELETE_MY_ACCOUNT"'
      }, { status: 400 });
    }
    
    // Log the account deletion before deleting (since we won't be able to log after)
    await createLogEntry({
      user_id: user.id,
      action: 'account_delete',
      severity: 'warning',
      ip_address: requestInfo.ip,
      user_agent: requestInfo.userAgent
    });
    
    // Delete the account
    await deleteUserAccount(user.id);
    
    // Return success
    return NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error in DELETE /api/user/account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
} 