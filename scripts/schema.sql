-- Explora.AI Database Schema for Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (extends the auth.users table provided by Supabase)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  bio TEXT,
  interests TEXT[] DEFAULT '{}',
  preferences JSONB DEFAULT '{}',
  last_login TIMESTAMP WITH TIME ZONE,
  is_email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_user_id UNIQUE (user_id)
);

-- RLS (Row Level Security) for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = user_id);

-- Learning Paths table
CREATE TABLE IF NOT EXISTS learning_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  topics TEXT[] DEFAULT '{}',
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_hours INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for learning_paths
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;

-- Policies for learning_paths
CREATE POLICY "Users can view their own paths" ON learning_paths 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public paths" ON learning_paths 
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can create their own paths" ON learning_paths 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own paths" ON learning_paths 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own paths" ON learning_paths 
  FOR DELETE USING (auth.uid() = user_id);

-- Learning Path Items table
CREATE TABLE IF NOT EXISTS learning_path_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  order INTEGER NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completion_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for learning_path_items
ALTER TABLE learning_path_items ENABLE ROW LEVEL SECURITY;

-- Policies for learning_path_items
CREATE POLICY "Users can select their own path items" ON learning_path_items 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM learning_paths 
      WHERE learning_paths.id = learning_path_items.path_id 
        AND (learning_paths.user_id = auth.uid() OR learning_paths.is_public = TRUE)
    )
  );

CREATE POLICY "Users can insert their own path items" ON learning_path_items 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM learning_paths 
      WHERE learning_paths.id = learning_path_items.path_id 
        AND learning_paths.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own path items" ON learning_path_items 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM learning_paths 
      WHERE learning_paths.id = learning_path_items.path_id 
        AND learning_paths.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own path items" ON learning_path_items 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM learning_paths 
      WHERE learning_paths.id = learning_path_items.path_id 
        AND learning_paths.user_id = auth.uid()
    )
  );

-- Highlights table
CREATE TABLE IF NOT EXISTS highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  source_url TEXT,
  source_title TEXT,
  color TEXT,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for highlights
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;

-- Policies for highlights
CREATE POLICY "Users can view their own highlights" ON highlights 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own highlights" ON highlights 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own highlights" ON highlights 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own highlights" ON highlights 
  FOR DELETE USING (auth.uid() = user_id);

-- Assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  topic TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  score INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for assessments
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Policies for assessments
CREATE POLICY "Users can view their own assessments" ON assessments 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments" ON assessments 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments" ON assessments 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assessments" ON assessments 
  FOR DELETE USING (auth.uid() = user_id);

-- Assessment Questions table
CREATE TABLE IF NOT EXISTS assessment_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  options JSONB,
  correct_answer TEXT NOT NULL,
  user_answer TEXT,
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for assessment_questions
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;

-- Policies for assessment_questions
CREATE POLICY "Users can view their own assessment questions" ON assessment_questions 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE assessments.id = assessment_questions.assessment_id 
        AND assessments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create their own assessment questions" ON assessment_questions 
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE assessments.id = assessment_questions.assessment_id 
        AND assessments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own assessment questions" ON assessment_questions 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE assessments.id = assessment_questions.assessment_id 
        AND assessments.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own assessment questions" ON assessment_questions 
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE assessments.id = assessment_questions.assessment_id 
        AND assessments.user_id = auth.uid()
    )
  );

-- Add database triggers for updated_at fields
CREATE OR REPLACE FUNCTION trigger_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers to all tables
CREATE TRIGGER update_profiles_timestamp
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION trigger_update_timestamp();

CREATE TRIGGER update_learning_paths_timestamp
BEFORE UPDATE ON learning_paths
FOR EACH ROW EXECUTE FUNCTION trigger_update_timestamp();

CREATE TRIGGER update_learning_path_items_timestamp
BEFORE UPDATE ON learning_path_items
FOR EACH ROW EXECUTE FUNCTION trigger_update_timestamp();

CREATE TRIGGER update_highlights_timestamp
BEFORE UPDATE ON highlights
FOR EACH ROW EXECUTE FUNCTION trigger_update_timestamp();

CREATE TRIGGER update_assessments_timestamp
BEFORE UPDATE ON assessments
FOR EACH ROW EXECUTE FUNCTION trigger_update_timestamp();

CREATE TRIGGER update_assessment_questions_timestamp
BEFORE UPDATE ON assessment_questions
FOR EACH ROW EXECUTE FUNCTION trigger_update_timestamp(); 