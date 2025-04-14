/**
 * Database schema types for Supabase
 */

export interface Profile {
  id: string;
  updated_at: string;
  created_at: string;
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  interests: string[] | null;
  preferences: ProfilePreferences | null;
  last_login: string | null;
  is_email_verified: boolean;
}

export interface ProfilePreferences {
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  notificationsEnabled: boolean;
  learningGoals?: string[];
  savedTopics?: string[];
  [key: string]: any;
}

export interface LearningPath {
  id: string;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  user_id: string;
  is_public: boolean;
  topics: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimated_hours: number | null;
}

export interface LearningPathItem {
  id: string;
  created_at: string;
  updated_at: string;
  path_id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  completed: boolean;
  completion_date: string | null;
  notes: string | null;
}

export interface Highlight {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  content: string;
  source_url: string | null;
  source_title: string | null;
  color: string | null;
  tags: string[] | null;
  notes: string | null;
}

export interface Assessment {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  title: string;
  description: string;
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  score: number | null;
  completed_at: string | null;
  questions: AssessmentQuestion[];
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  options?: string[];
  correct_answer: string | number;
  user_answer?: string | number;
  explanation?: string;
} 