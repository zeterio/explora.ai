'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';

/**
 * Provider wrapper for the application
 * 
 * This component wraps the application in various providers like:
 * - SessionProvider for authentication
 * - Other providers can be added here as needed
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
} 