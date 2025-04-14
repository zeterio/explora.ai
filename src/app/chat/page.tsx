/**
 * Chat page
 * 
 * This page displays the AI chat interface.
 */

import React from 'react';
import ChatContainer from '@/components/chat/ChatContainer';

/**
 * Chat page
 * 
 * @returns Next.js page component
 */
export default function ChatPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
            Chat with Explora.AI
          </h1>
          
          <p className="mb-8 text-gray-600 dark:text-gray-300">
            Ask questions, explore topics, and learn with AI assistance. 
            Your conversations help personalize your learning experience.
          </p>
          
          <div className="h-[600px] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
            <ChatContainer />
          </div>
        </div>
      </main>
    </div>
  );
} 