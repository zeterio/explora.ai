/**
 * MessageBubble component
 * 
 * This component renders an individual message bubble in the chat interface.
 * It handles different styling for user vs. AI messages.
 */

import React from 'react';
import { ChatMessage } from '@/app/api/chat/route';

interface MessageBubbleProps {
  message: ChatMessage;
  isThread?: boolean;
  parentId?: string;
  onReply?: (messageId: string) => void;
}

/**
 * MessageBubble component
 * 
 * @param props - Component props
 * @returns React component
 */
export default function MessageBubble({
  message,
  isThread = false,
  parentId,
  onReply
}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';
  
  // Determine the appropriate styling based on the message role
  const bubbleStyles = isUser
    ? 'bg-blue-500 text-white'
    : isSystem
      ? 'bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
      : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200';
  
  // For threaded messages, we add indentation and visual indicators
  const threadStyles = isThread 
    ? 'ml-6 border-l-2 border-gray-300 dark:border-gray-600 pl-3'
    : '';
  
  return (
    <div className={`group mb-4 ${threadStyles}`}>
      {/* Thread indicator if this is a threaded message */}
      {isThread && parentId && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          In reply to message #{parentId.substring(0, 8)}
        </div>
      )}
      
      <div 
        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        <div 
          className={`max-w-[80%] rounded-lg px-4 py-2 ${bubbleStyles}`}
        >
          {/* Message content with support for basic markdown */}
          <div className="prose prose-sm dark:prose-invert">
            {message.content}
          </div>
          
          {/* Message timestamp */}
          <div className="text-xs opacity-70 mt-1 flex items-center justify-between">
            <span>
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
            
            {/* Reply button - only show when hovering and if onReply is provided */}
            {onReply && !isThread && (
              <button
                onClick={() => onReply(message.id)}
                className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white/70 hover:text-white/100 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Reply
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 