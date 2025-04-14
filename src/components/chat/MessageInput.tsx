/**
 * MessageInput component
 * 
 * This component renders the input field for typing messages in the chat interface.
 */

import React, { useState, useRef, useEffect } from 'react';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  autoFocus?: boolean;
  replyingTo?: string | null;
  onCancelReply?: () => void;
}

/**
 * MessageInput component
 * 
 * @param props - Component props
 * @returns React component
 */
export default function MessageInput({
  onSend,
  disabled = false,
  placeholder = 'Type your message...',
  autoFocus = false,
  replyingTo = null,
  onCancelReply
}: MessageInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus input when autoFocus is true or when replyingTo changes
  useEffect(() => {
    if ((autoFocus || replyingTo) && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus, replyingTo]);
  
  /**
   * Handle submitting the message
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || disabled) return;
    
    onSend(input.trim());
    setInput('');
  };
  
  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Reply indicator */}
      {replyingTo && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-t-lg border-t border-x border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-600 dark:text-gray-300">
            Replying to message
          </span>
          <button
            type="button"
            onClick={onCancelReply}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Cancel
          </button>
        </div>
      )}
      
      <div className="flex space-x-2 p-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            flex-1 px-4 py-2 
            border border-gray-300 dark:border-gray-600 
            rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 
            bg-white dark:bg-gray-800 
            text-gray-800 dark:text-white
            disabled:opacity-60 disabled:cursor-not-allowed
            ${replyingTo ? 'rounded-t-none border-t-0' : ''}
          `}
        />
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className="
            px-4 py-2 
            bg-blue-500 hover:bg-blue-600 
            text-white rounded-lg 
            focus:outline-none focus:ring-2 focus:ring-blue-500 
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors
          "
        >
          Send
        </button>
      </div>
    </form>
  );
} 