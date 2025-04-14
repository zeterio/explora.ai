/**
 * Application configuration
 * 
 * This module centralizes environment-specific configuration,
 * allowing consistent access to environment variables and settings.
 */

/**
 * Environment types
 */
export type Environment = 'development' | 'test' | 'production';

/**
 * Current environment
 */
export const environment = (process.env.NODE_ENV || 'development') as Environment;

/**
 * Check if the application is running in development mode
 */
export const isDevelopment = environment === 'development';

/**
 * Check if the application is running in test mode
 */
export const isTest = environment === 'test';

/**
 * Check if the application is running in production mode
 */
export const isProduction = environment === 'production';

/**
 * Application configuration object
 */
export const config = {
  /**
   * Application general settings
   */
  app: {
    name: 'Explora.AI',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    url: process.env.NEXT_PUBLIC_APP_URL || (
      isProduction 
        ? 'https://explora-ai.vercel.app' 
        : 'http://localhost:3000'
    ),
  },
  
  /**
   * API configuration
   */
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || (
      isProduction 
        ? 'https://explora-ai.vercel.app/api' 
        : 'http://localhost:3000/api'
    ),
    timeout: 30000, // 30 seconds
  },
  
  /**
   * Authentication configuration
   */
  auth: {
    sessionDuration: 60 * 60 * 24 * 7, // 7 days in seconds
  },
  
  /**
   * Feature flags
   */
  features: {
    enableGuides: process.env.NEXT_PUBLIC_ENABLE_GUIDES === 'true',
    enableSelfAssessment: process.env.NEXT_PUBLIC_ENABLE_SELF_ASSESSMENT === 'true',
    enableLearningPaths: true,
    enableChat: true,
  },
}; 