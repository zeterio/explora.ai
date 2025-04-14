-- Explora.AI Database Schema Updates

-- Create audit_logs table for tracking user data changes
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  severity TEXT CHECK (severity IN ('info', 'warning', 'error')) DEFAULT 'info',
  ip_address TEXT,
  user_agent TEXT
);

-- Create index for faster queries on user_id and timestamp
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);

-- RLS (Row Level Security) for audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for audit_logs
-- Only admins can insert logs (via service role)
CREATE POLICY "Admins can insert audit logs" ON audit_logs 
  FOR INSERT TO authenticated USING (auth.jwt() ? 'admin_access');

-- Users can only view their own logs
CREATE POLICY "Users can view own audit logs" ON audit_logs 
  FOR SELECT USING (auth.uid() = user_id);

-- Add sensitive_info column to profiles for encrypted data
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS sensitive_info BYTEA;

-- Add email_verification_token and token_expiry to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verification_token TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_verification_token_expiry TIMESTAMP WITH TIME ZONE; 