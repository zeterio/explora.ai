/**
 * Client-side Authentication Utilities
 * 
 * Helper functions for managing authentication on the client side.
 */

import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to check if the user has a specific role
 * 
 * @param role - The role to check for (or array of roles)
 * @returns Boolean indicating if the user has the required role
 * 
 * @example
 * const isAdmin = useHasRole('admin');
 * if (isAdmin) {
 *   // Render admin UI
 * }
 */
export function useHasRole(role: string | string[]) {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || 'user';
  
  if (Array.isArray(role)) {
    return role.includes(userRole);
  }
  
  return userRole === role;
}

/**
 * Hook to manage authentication state with loading and error states
 * 
 * @returns Authentication state and helper functions
 * 
 * @example
 * const { isAuthenticated, isLoading, user, login, logout } = useAuth();
 * 
 * if (isLoading) return <LoadingSpinner />;
 * 
 * if (!isAuthenticated) {
 *   return <button onClick={() => login()}>Sign In</button>;
 * }
 * 
 * return (
 *   <div>
 *     <p>Welcome, {user?.name}</p>
 *     <button onClick={logout}>Sign Out</button>
 *   </div>
 * );
 */
export function useAuth() {
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const isLoading = status === 'loading';
  const isAuthenticated = status === 'authenticated';
  
  /**
   * Sign in with credentials or specified provider
   */
  const login = useCallback(async (
    { email, password, provider, callbackUrl }: 
    { email?: string; password?: string; provider?: string; callbackUrl?: string } = {}
  ) => {
    try {
      setError(null);
      
      if (provider) {
        // OAuth login
        await signIn(provider, { callbackUrl: callbackUrl || '/dashboard' });
      } else if (email && password) {
        // Credentials login
        const result = await signIn('credentials', {
          redirect: false,
          email,
          password,
        });
        
        if (!result?.ok) {
          setError(result?.error || 'Authentication failed');
          return false;
        }
        
        router.push(callbackUrl || '/dashboard');
        return true;
      } else {
        // Default to credentials form
        await signIn(undefined, { callbackUrl: callbackUrl || '/dashboard' });
      }
      
      return true;
    } catch (err) {
      console.error('Authentication error:', err);
      setError('An unexpected error occurred');
      return false;
    }
  }, [router]);
  
  /**
   * Sign out the current user
   */
  const logout = useCallback(async (callbackUrl?: string) => {
    try {
      await signOut({ callbackUrl: callbackUrl || '/' });
      return true;
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to sign out');
      return false;
    }
  }, []);
  
  return {
    isAuthenticated,
    isLoading,
    user: session?.user || null,
    login,
    logout,
    error,
  };
}

/**
 * Hook to redirect based on authentication status
 * 
 * @param options - Configuration options
 * @returns Authentication state
 * 
 * @example
 * // Redirect to dashboard if authenticated
 * useAuthRedirect({ whenAuthenticated: '/dashboard' });
 * 
 * @example
 * // Redirect to login if not authenticated 
 * useAuthRedirect({ whenNotAuthenticated: '/login' });
 */
export function useAuthRedirect(
  options: {
    whenAuthenticated?: string;
    whenNotAuthenticated?: string;
  } = {}
) {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    // Don't redirect while loading
    if (status === 'loading') return;
    
    const { whenAuthenticated, whenNotAuthenticated } = options;
    
    if (status === 'authenticated' && whenAuthenticated) {
      router.push(whenAuthenticated);
    } else if (status === 'unauthenticated' && whenNotAuthenticated) {
      router.push(whenNotAuthenticated);
    }
  }, [status, router, options]);
  
  return {
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    user: session?.user || null,
  };
} 