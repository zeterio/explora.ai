import { NextRequest } from 'next/server';
import { successResponse, apiResponses } from '@/lib/utils/api-response';

/**
 * Message types for the chat API
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}

/**
 * Dummy implementation of a chat API endpoint
 * In a real implementation, this would connect to an AI service
 * 
 * @route POST /api/chat
 * @body { messages: ChatMessage[] } - The conversation history
 * @returns { message: ChatMessage } - The AI response message
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate the request
    if (!body.messages || !Array.isArray(body.messages)) {
      return apiResponses.badRequest('Messages array is required');
    }
    
    // Extract the messages array
    const messages: ChatMessage[] = body.messages;
    
    // In a real implementation, this would call an AI service like OpenAI or Anthropic
    // For now, we'll just return a dummy response
    const dummyResponse: ChatMessage = {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'This is a dummy response from the Explora.AI API. In a real implementation, this would be a response from an AI service.',
      timestamp: Date.now(),
    };
    
    // Return the response
    return successResponse({ message: dummyResponse });
  } catch (error) {
    console.error('Error in chat API:', error);
    return apiResponses.internalServerError();
  }
}

/**
 * OPTIONS handler for CORS preflight requests
 */
export function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
} 