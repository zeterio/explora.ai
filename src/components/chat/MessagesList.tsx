/**
 * MessagesList component
 * 
 * This component renders the list of messages in the chat interface,
 * handling both main messages and threaded replies.
 */

import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '@/app/api/chat/route';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

// Extended message type to include threading information
export interface ThreadedMessage extends ChatMessage {
  parentId?: string;
  threadIds?: string[];
}

interface MessagesListProps {
  messages: ThreadedMessage[];
  isLoading?: boolean;
  onReply?: (messageId: string) => void;
}

/**
 * MessagesList component
 * 
 * @param props - Component props
 * @returns React component
 */
export default function MessagesList({
  messages,
  isLoading = false,
  onReply
}: MessagesListProps) {
  const endRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change or loading state changes
  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);
  
  // Group messages by parent to organize threads
  const messageGroups = messages.reduce((groups, message) => {
    if (message.parentId) {
      // This is a threaded reply, add to parent's thread
      const parentGroup = groups.find(group => group.id === message.parentId);
      if (parentGroup) {
        parentGroup.replies.push(message);
      } else {
        // If parent not found (which shouldn't happen), treat as main message
        groups.push({
          id: message.id,
          message,
          replies: []
        });
      }
    } else {
      // This is a main message, create a new group
      groups.push({
        id: message.id,
        message,
        replies: []
      });
    }
    return groups;
  }, [] as { id: string; message: ThreadedMessage; replies: ThreadedMessage[] }[]);
  
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500 dark:text-gray-400">
            Start a conversation by sending a message...
          </p>
        </div>
      ) : (
        messageGroups.map(group => (
          <div key={group.id} className="message-group">
            {/* Main message */}
            <MessageBubble 
              message={group.message}
              onReply={onReply}
            />
            
            {/* Threaded replies */}
            {group.replies.length > 0 && (
              <div className="ml-6">
                {group.replies.map(reply => (
                  <MessageBubble
                    key={reply.id}
                    message={reply}
                    isThread={true}
                    parentId={group.message.id}
                  />
                ))}
              </div>
            )}
          </div>
        ))
      )}
      
      {/* Loading indicator */}
      {isLoading && <TypingIndicator />}
      
      {/* Ref for scrolling to bottom */}
      <div ref={endRef} />
    </div>
  );
} 