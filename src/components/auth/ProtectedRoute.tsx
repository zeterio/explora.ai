/**
 * ProtectedRoute Component
 * 
 * Wraps routes that require authentication.
 * Redirects unauthenticated users to the login page.
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Spinner } from '@/components/ui/Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string | string[];
}

/**
 * ProtectedRoute component
 * 
 * @param {React.ReactNode} children - Components to render when authenticated
 * @param {string|string[]} [requiredRole] - Optional role(s) required to access the route
 * @returns Protected route component
 * 
 * @example
 * // Basic protection (just requires authentication)
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 * 
 * @example
 * // Role-based protection
 * <ProtectedRoute requiredRole="admin">
 *   <AdminPanel />
 * </ProtectedRoute>
 */
export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  
  useEffect(() => {
    // Check if the session is loading
    if (status === 'loading') {
      return;
    }
    
    // If not authenticated, redirect to login
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    
    // If authentication is required but not present
    if (!session) {
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    
    // If role check is required
    if (requiredRole) {
      const userRole = (session.user as any)?.role || 'user';
      
      // Check against a single required role
      if (typeof requiredRole === 'string') {
        if (userRole !== requiredRole) {
          router.push('/unauthorized');
          return;
        }
      } 
      // Check against an array of allowed roles
      else if (Array.isArray(requiredRole)) {
        if (!requiredRole.includes(userRole)) {
          router.push('/unauthorized');
          return;
        }
      }
    }
    
    // User is authorized
    setIsAuthorized(true);
  }, [session, status, requiredRole, router]);
  
  // Show loading spinner while checking authentication
  if (status === 'loading' || !isAuthorized) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="large" />
      </div>
    );
  }
  
  // Render the protected content
  return <>{children}</>;
} 