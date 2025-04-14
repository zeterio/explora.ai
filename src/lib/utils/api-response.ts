import { NextResponse } from 'next/server';

/**
 * Standard error response types for API endpoints
 */
export type ErrorResponseType = {
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
};

/**
 * Standard success response types for API endpoints
 */
export type SuccessResponseType<T> = {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    [key: string]: unknown;
  };
};

/**
 * Creates a standardized success response
 * 
 * @param data The data to return in the response
 * @param meta Optional metadata about the response
 * @param status HTTP status code, defaults to 200
 * @returns NextResponse with standardized JSON structure
 */
export function successResponse<T>(
  data: T,
  meta?: SuccessResponseType<T>['meta'],
  status = 200
): NextResponse<SuccessResponseType<T>> {
  return NextResponse.json(
    {
      data,
      ...(meta ? { meta } : {}),
    },
    { status }
  );
}

/**
 * Creates a standardized error response
 * 
 * @param message Error message
 * @param code Optional error code
 * @param details Optional error details
 * @param status HTTP status code, defaults to 400
 * @returns NextResponse with standardized error structure
 */
export function errorResponse(
  message: string,
  code?: string,
  details?: unknown,
  status = 400
): NextResponse<ErrorResponseType> {
  return NextResponse.json(
    {
      error: {
        message,
        ...(code ? { code } : {}),
        ...(details ? { details } : {}),
      },
    },
    { status }
  );
}

/**
 * Predefined responses for common error situations
 */
export const apiResponses = {
  badRequest: (message = 'Bad request', code?: string, details?: unknown) =>
    errorResponse(message, code, details, 400),
    
  unauthorized: (message = 'Unauthorized', code?: string, details?: unknown) =>
    errorResponse(message, code, details, 401),
    
  forbidden: (message = 'Forbidden', code?: string, details?: unknown) =>
    errorResponse(message, code, details, 403),
    
  notFound: (message = 'Resource not found', code?: string, details?: unknown) =>
    errorResponse(message, code, details, 404),
    
  methodNotAllowed: (message = 'Method not allowed', code?: string, details?: unknown) =>
    errorResponse(message, code, details, 405),
    
  conflict: (message = 'Resource conflict', code?: string, details?: unknown) =>
    errorResponse(message, code, details, 409),
    
  internalServerError: (message = 'Internal server error', code?: string, details?: unknown) =>
    errorResponse(message, code, details, 500),
}; 