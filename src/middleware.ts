import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * Paths that require authentication
 */
const protectedPaths = [
  '/dashboard',
  '/profile',
  '/learning-paths',
  '/highlights',
  '/assessments',
];

/**
 * Paths that should redirect authenticated users away (like login page)
 */
const authRedirectPaths = [
  '/login',
  '/register',
];

/**
 * Public API paths that don't require authentication
 */
const publicApiPaths = [
  '/api/health',
  '/api/auth',
];

/**
 * Check if the path is a protected one
 * @param path - Path to check
 * @returns Boolean indicating if the path is protected
 */
function isProtectedPath(path: string): boolean {
  return protectedPaths.some(prefix => path.startsWith(prefix));
}

/**
 * Check if the path is a login or registration page
 * @param path - Path to check
 * @returns Boolean indicating if the path should redirect authenticated users
 */
function isAuthRedirectPath(path: string): boolean {
  return authRedirectPaths.some(prefix => path.startsWith(prefix));
}

/**
 * Check if the path is a public API endpoint
 * @param path - Path to check
 * @returns Boolean indicating if the path is a public API endpoint
 */
function isPublicApiPath(path: string): boolean {
  return publicApiPaths.some(prefix => path.startsWith(prefix));
}

/**
 * Check if the path is a Next.js internal path
 * @param path - Path to check
 * @returns Boolean indicating if the path is a Next.js internal path
 */
function isNextInternalPath(path: string): boolean {
  return (
    path.startsWith('/_next') ||
    path.startsWith('/favicon') ||
    path.startsWith('/public')
  );
}

/**
 * Next.js middleware function
 * Handles authentication and route protection
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow Next.js internal paths
  if (isNextInternalPath(pathname)) {
    return NextResponse.next();
  }
  
  // Allow public API paths
  if (isPublicApiPath(pathname)) {
    return NextResponse.next();
  }

  // Get the authentication token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  // User is authenticated
  if (token) {
    // Redirect away from login/register pages
    if (isAuthRedirectPath(pathname)) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    
    // Add user information to headers for API routes
    if (pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', token.id as string);
      requestHeaders.set('x-user-role', (token.role || 'user') as string);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
    
    // Allow access to protected paths for authenticated users
    return NextResponse.next();
  }
  
  // User is not authenticated
  
  // Redirect to login if trying to access protected paths
  if (isProtectedPath(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }
  
  // Block access to protected API routes
  if (pathname.startsWith('/api/') && !isPublicApiPath(pathname)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Allow access to public pages
  return NextResponse.next();
}

/**
 * Configure paths that trigger the middleware
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (e.g. robots.txt)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 