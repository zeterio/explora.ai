/**
 * Types for the chat functionality
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export interface MessageContent {
  type: 'text' | 'image' | 'code' | 'markdown';
  content: string;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: MessageContent[];
  timestamp: number;
  isPinned?: boolean;
  tags?: string[];
  highlights?: Highlight[];
}

export interface Highlight {
  id: string;
  messageId: string;
  text: string;
  startIndex: number;
  endIndex: number;
  tags?: string[];
  relatedConversationId?: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  category?: 'concept' | 'topic' | 'skill' | 'custom';
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  parentConversationId?: string;
  learningPath?: LearningPath;
}

export interface LearningPath {
  id: string;
  title: string;
  description?: string;
  milestones: Milestone[];
  progress: number;
  createdAt: number;
  updatedAt: number;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  isComplete: boolean;
  messages: string[]; // Array of message IDs
}
