/**
 * Unauthorized Access Page
 *
 * Page displayed when a user tries to access a resource they don't have permission for.
 */

import Link from 'next/link';

import Button from '@/components/Button';

/**
 * Unauthorized page component
 * Shows a message and navigation options when user doesn't have permission
 */
export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="max-w-md space-y-6">
        <h1 className="text-4xl font-bold text-red-600">Access Denied</h1>

        <div className="p-6 rounded-lg bg-white shadow-md">
          <h2 className="text-2xl font-semibold mb-4">
            You don&apos;t have permission to access this page
          </h2>

          <p className="mb-4 text-gray-600">
            Your account doesn&apos;t have the required permissions to view this content. If you believe
            this is an error, please contact support.
          </p>

          <div className="flex flex-col space-y-3 mt-6">
            <Button variant="primary" size="lg">
              <Link href="/dashboard" className="w-full block">
                Go to Dashboard
              </Link>
            </Button>

            <Button variant="secondary" size="lg">
              <Link href="/" className="w-full block">
                Return to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
