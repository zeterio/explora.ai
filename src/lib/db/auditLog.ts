/**
 * Audit Logging System
 * 
 * This module provides logging functionality for tracking user data changes
 * and system events for compliance and debugging purposes.
 */

import { connectToDatabase } from './connection';

export type LogAction = 
  | 'profile_create'
  | 'profile_update'
  | 'profile_delete'
  | 'login_success'
  | 'login_failed'
  | 'password_reset'
  | 'email_change'
  | 'preferences_update'
  | 'data_export'
  | 'account_delete'
  | 'admin_action';

export type LogSeverity = 'info' | 'warning' | 'error';

export interface AuditLogEntry {
  id?: string;
  timestamp?: string;
  user_id: string;
  action: LogAction;
  details?: Record<string, any>;
  severity?: LogSeverity;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Create an audit log entry
 * 
 * @param entry - The log entry to create
 * @returns The created log entry
 */
export async function createLogEntry(entry: AuditLogEntry): Promise<AuditLogEntry> {
  try {
    const supabase = await connectToDatabase(true);
    
    const logEntry = {
      user_id: entry.user_id,
      action: entry.action,
      details: entry.details || {},
      severity: entry.severity || 'info',
      ip_address: entry.ip_address || null,
      user_agent: entry.user_agent || null,
      timestamp: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('audit_logs')
      .insert([logEntry])
      .select('*')
      .single();
    
    if (error) {
      // Don't throw here - log to console but don't break the app flow
      console.error('Error creating audit log entry:', error);
      return logEntry;
    }
    
    return data as AuditLogEntry;
  } catch (error) {
    console.error('Error in audit logging:', error);
    // Return the original entry rather than throwing
    // This prevents audit logging failures from breaking core functionality
    return entry;
  }
}

/**
 * Get audit logs for a specific user
 * 
 * @param userId - The user ID to get logs for
 * @param limit - Maximum number of logs to return
 * @param offset - Pagination offset
 * @returns Array of audit log entries
 */
export async function getUserAuditLogs(
  userId: string,
  limit = 50,
  offset = 0
): Promise<AuditLogEntry[]> {
  try {
    const supabase = await connectToDatabase(true);
    
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      throw error;
    }
    
    return data as AuditLogEntry[];
  } catch (error) {
    console.error('Error fetching user audit logs:', error);
    throw new Error('Failed to fetch user audit logs');
  }
}

/**
 * Clear old audit logs (can be used for data retention policies)
 * 
 * @param olderThan - Date threshold for logs to delete
 * @returns Number of logs deleted
 */
export async function clearOldAuditLogs(olderThan: Date): Promise<number> {
  try {
    const supabase = await connectToDatabase(true);
    
    const { data, error, count } = await supabase
      .from('audit_logs')
      .delete()
      .lt('timestamp', olderThan.toISOString())
      .select('count');
    
    if (error) {
      throw error;
    }
    
    return count || 0;
  } catch (error) {
    console.error('Error clearing old audit logs:', error);
    throw new Error('Failed to clear old audit logs');
  }
} 