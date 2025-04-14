/**
 * ChatContainer component
 * 
 * This component serves as the main container for the chat interface.
 * It handles the layout and houses all child components like message list and input.
 */

import React, { useState } from 'react';
import { ChatMessage } from '@/app/api/chat/route';
import MessagesList, { ThreadedMessage } from './MessagesList';
import MessageInput from './MessageInput';

interface ChatContainerProps {
  className?: string;
  title?: string;
}

/**
 * ChatContainer component
 * 
 * @param props - Component props
 * @returns React component
 */
export default function ChatContainer({
  className = '',
  title = 'Explora.AI Chat'
}: ChatContainerProps) {
  // State to track messages with thread support
  const [messages, setMessages] = useState<ThreadedMessage[]>([]);
  // State to track loading state during AI responses
  const [isLoading, setIsLoading] = useState(false);
  // State to track which message is being replied to
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  
  /**
   * Handle sending a new message
   */
  const handleSendMessage = async (content: string) => {
    // Create new user message
    const userMessage: ThreadedMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: Date.now()
    };
    
    // If replying to a message, add the parent ID
    if (replyingTo) {
      userMessage.parentId = replyingTo;
      setReplyingTo(null); // Reset reply state
    }
    
    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    
    // Set loading state while waiting for AI response
    setIsLoading(true);
    
    try {
      // Create messages array for context, flattening threads
      const contextMessages = messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp
      }));
      
      // Add the new user message
      contextMessages.push({
        id: userMessage.id,
        role: userMessage.role,
        content: userMessage.content,
        timestamp: userMessage.timestamp
      });
      
      // Call API with all messages for context
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: contextMessages
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }
      
      const data = await response.json();
      
      // Create AI response message, possibly as a threaded reply
      const aiMessage: ThreadedMessage = {
        ...data.data.message,
        // If user message was a reply, AI response should be in the same thread
        parentId: userMessage.parentId
      };
      
      // Add AI response to messages
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error fetching AI response:', error);
      
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error processing your request. Please try again.',
          timestamp: Date.now(),
          // If user message was a reply, error message should be in the same thread
          parentId: userMessage.parentId
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  /**
   * Handle replying to a message
   */
  const handleReply = (messageId: string) => {
    setReplyingTo(messageId);
  };
  
  /**
   * Handle canceling a reply
   */
  const handleCancelReply = () => {
    setReplyingTo(null);
  };
  
  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-900 rounded-lg shadow-lg ${className}`}>
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h2>
      </div>
      
      {/* Messages list */}
      <MessagesList 
        messages={messages}
        isLoading={isLoading}
        onReply={handleReply}
      />
      
      {/* Message input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-2">
        <MessageInput 
          onSend={handleSendMessage}
          disabled={isLoading}
          autoFocus={true}
          replyingTo={replyingTo}
          onCancelReply={handleCancelReply}
        />
      </div>
    </div>
  );
} 