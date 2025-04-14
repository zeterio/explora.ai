import { config } from '@/config';

/**
 * Base API client for making requests to the backend
 * 
 * This module provides a consistent way to interact with
 * the API endpoints with proper error handling and authentication.
 */

/**
 * API error interface
 */
export interface ApiError {
  message: string;
  code?: string;
  status: number;
  details?: unknown;
}

/**
 * API client options
 */
export interface ApiClientOptions {
  baseUrl?: string;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
}

/**
 * Create an API client with the provided options
 */
export function createApiClient(options: ApiClientOptions = {}) {
  const baseUrl = options.baseUrl || config.api.baseUrl;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  /**
   * Make a request to the API
   */
  async function request<T>(
    endpoint: string,
    method: string,
    data?: unknown,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    
    const headers = {
      ...defaultHeaders,
      ...customHeaders,
    };

    const config: RequestInit = {
      method,
      headers,
      credentials: options.credentials || 'include',
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, config);
      const responseData = await response.json();

      if (!response.ok) {
        const error: ApiError = {
          message: responseData.error?.message || 'An unknown error occurred',
          code: responseData.error?.code,
          status: response.status,
          details: responseData.error?.details,
        };
        throw error;
      }

      return responseData;
    } catch (error) {
      if (error instanceof Error) {
        const apiError: ApiError = {
          message: error.message,
          status: 500,
        };
        throw apiError;
      }
      throw error;
    }
  }

  return {
    get: <T>(endpoint: string, headers?: Record<string, string>): Promise<T> => 
      request<T>(endpoint, 'GET', undefined, headers),
      
    post: <T>(endpoint: string, data?: unknown, headers?: Record<string, string>): Promise<T> => 
      request<T>(endpoint, 'POST', data, headers),
      
    put: <T>(endpoint: string, data?: unknown, headers?: Record<string, string>): Promise<T> => 
      request<T>(endpoint, 'PUT', data, headers),
      
    patch: <T>(endpoint: string, data?: unknown, headers?: Record<string, string>): Promise<T> => 
      request<T>(endpoint, 'PATCH', data, headers),
      
    delete: <T>(endpoint: string, headers?: Record<string, string>): Promise<T> => 
      request<T>(endpoint, 'DELETE', undefined, headers),
  };
}

/**
 * Default API client instance
 */
export const api = createApiClient(); 