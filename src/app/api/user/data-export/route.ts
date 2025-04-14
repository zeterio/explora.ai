/**
 * API route for GDPR data export and account deletion
 */

import { NextRequest, NextResponse } from 'next/server';
import { exportUserData } from '@/lib/db/userDataExport';
import { getCurrentUser } from '@/lib/auth/server';
import { createLogEntry } from '@/lib/db/auditLog';
import { getRequestInfo } from '@/lib/db/users';

/**
 * GET /api/user/data-export
 * Export all user data for GDPR compliance
 */
export async function GET(req: NextRequest) {
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
    
    // Export the user data
    const userData = await exportUserData(user.id);
    
    // Log the data export
    await createLogEntry({
      user_id: user.id,
      action: 'data_export',
      severity: 'warning', // Higher severity for GDPR operations
      ip_address: requestInfo.ip,
      user_agent: requestInfo.userAgent
    });
    
    // Set headers for file download
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set(
      'Content-Disposition', 
      `attachment; filename="explora-ai-data-export-${new Date().toISOString().split('T')[0]}.json"`
    );
    
    // Return the data as a downloadable file
    return new NextResponse(
      JSON.stringify(userData, null, 2),
      {
        status: 200,
        headers
      }
    );
  } catch (error) {
    console.error('Error in GET /api/user/data-export:', error);
    return NextResponse.json(
      { error: 'Failed to export user data' },
      { status: 500 }
    );
  }
} 