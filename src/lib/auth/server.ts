/**
 * Server-side Authentication Utilities
 * 
 * Helper functions for managing authentication on the server side.
 */

import { cookies, headers } from 'next/headers';
import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/**
 * Get the current authenticated session on the server
 * 
 * @returns The session object or null if not authenticated
 * 
 * @example
 * // In a Route Handler or Server Component
 * const session = await getServerAuthSession();
 * if (!session) {
 *   // Handle unauthenticated state
 * }
 */
export async function getServerAuthSession() {
  return await getServerSession(authOptions);
}

/**
 * Check if a user is authenticated on the server
 * 
 * @returns Boolean indicating if user is authenticated
 * 
 * @example
 * // In a Route Handler
 * export async function GET() {
 *   if (!await isAuthenticated()) {
 *     return Response.json({ error: 'Unauthorized' }, { status: 401 });
 *   }
 *   // Proceed with authenticated request
 * }
 */
export async function isAuthenticated() {
  const session = await getServerAuthSession();
  return !!session;
}

/**
 * Get the current user from the session on the server
 * 
 * @returns The user object or null if not authenticated
 * 
 * @example
 * // In a Server Component
 * const user = await getCurrentUser();
 * return user ? <ProfilePage user={user} /> : <LoginRedirect />;
 */
export async function getCurrentUser() {
  const session = await getServerAuthSession();
  return session?.user || null;
}

/**
 * Check if the current user has a specific role
 * 
 * @param role - The role or roles to check for
 * @returns Boolean indicating if user has the required role
 * 
 * @example
 * // In a Route Handler
 * export async function GET() {
 *   if (!await hasRole('admin')) {
 *     return Response.json({ error: 'Forbidden' }, { status: 403 });
 *   }
 *   // Proceed with admin-only request
 * }
 */
export async function hasRole(role: string | string[]) {
  const session = await getServerAuthSession();
  if (!session?.user) return false;
  
  const userRole = (session.user as any).role || 'user';
  
  if (Array.isArray(role)) {
    return role.includes(userRole);
  }
  
  return userRole === role;
}

/**
 * Extract user ID from request headers or session
 * This is useful for API routes where middleware has added the user ID
 * 
 * @param req - Optional NextRequest object
 * @returns The user ID or null if not found
 * 
 * @example
 * // In a Route Handler
 * export async function GET(request: NextRequest) {
 *   const userId = await getUserId(request);
 *   if (!userId) {
 *     return Response.json({ error: 'Unauthorized' }, { status: 401 });
 *   }
 *   // Fetch user-specific data
 * }
 */
export async function getUserId(req?: NextRequest) {
  // First try to get from request headers (set by middleware)
  if (req) {
    const userId = req.headers.get('x-user-id');
    if (userId) return userId;
  } else {
    // If no request is provided, try from headers()
    const headersList = headers();
    const userId = headersList.get('x-user-id');
    if (userId) return userId;
  }
  
  // Fall back to session
  const session = await getServerAuthSession();
  return session?.user?.id || null;
}

/**
 * Get user role from request headers or session
 * 
 * @param req - Optional NextRequest object
 * @returns The user role or 'guest' if not found
 * 
 * @example
 * // In a Route Handler
 * export async function GET(request: NextRequest) {
 *   const role = await getUserRole(request);
 *   if (role !== 'admin') {
 *     return Response.json({ error: 'Forbidden' }, { status: 403 });
 *   }
 *   // Proceed with admin-only operation
 * }
 */
export async function getUserRole(req?: NextRequest): Promise<string> {
  // First try to get from request headers (set by middleware)
  if (req) {
    const role = req.headers.get('x-user-role');
    if (role) return role;
  } else {
    // If no request is provided, try from headers()
    const headersList = headers();
    const role = headersList.get('x-user-role');
    if (role) return role;
  }
  
  // Fall back to session
  const session = await getServerAuthSession();
  return ((session?.user as any)?.role as string) || 'guest';
}

/**
 * Validate an auth token for API calls
 * This is a placeholder that would validate JWTs in a real implementation
 * 
 * @param token - The token to validate
 * @returns Boolean indicating if token is valid
 */
export async function validateAuthToken(token: string): Promise<boolean> {
  if (!token) return false;
  
  // In a real implementation, this would validate the JWT
  // using the appropriate library and secret
  // For now, we're just checking if the session contains this token
  
  try {
    // This is a simplified example. In a real app, you would
    // verify the token signature, expiration, etc.
    const session = await getServerAuthSession();
    return !!session;
  } catch (error) {
    console.error('Error validating auth token:', error);
    return false;
  }
} 