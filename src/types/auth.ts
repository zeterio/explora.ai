import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

/**
 * Role types for user authorization
 */
export type UserRole = 'user' | 'admin' | 'moderator';

/**
 * Extend the built-in session types
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession['user'];
    accessToken?: string;
    provider?: string;
    error?: string;
  }

  interface User extends DefaultUser {
    role?: UserRole;
  }
}

/**
 * Extend JWT types
 */
declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role?: UserRole;
    accessToken?: string;
    provider?: string;
  }
}

/**
 * Custom user preferences type
 */
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  notificationsEnabled: boolean;
  learningGoals?: string[];
  savedTopics?: string[];
  [key: string]: any;
}

/**
 * Comprehensive user profile type
 */
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  preferences: UserPreferences;
  lastLogin?: Date;
  isEmailVerified: boolean;
  bio?: string;
  interests?: string[];
}

/**
 * Sign in credentials type
 */
export interface SignInCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

/**
 * Registration data type
 */
export interface RegistrationData {
  email: string;
  password: string;
  name?: string;
  confirmPassword: string;
  acceptTerms: boolean;
} 