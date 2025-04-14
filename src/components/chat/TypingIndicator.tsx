/**
 * TypingIndicator component
 * 
 * This component displays an animated typing indicator
 * to show that the AI is processing a response.
 */

import React from 'react';

interface TypingIndicatorProps {
  className?: string;
}

/**
 * TypingIndicator component
 * 
 * @param props - Component props
 * @returns React component
 */
export default function TypingIndicator({ className = '' }: TypingIndicatorProps) {
  return (
    <div className={`flex justify-start ${className}`}>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2">
        <div className="flex space-x-2">
          <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" />
          <div 
            className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" 
            style={{ animationDelay: '0.2s' }} 
          />
          <div 
            className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 animate-bounce" 
            style={{ animationDelay: '0.4s' }} 
          />
        </div>
      </div>
    </div>
  );
} 