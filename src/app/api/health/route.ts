import { connectToDatabase } from '@/lib/db/connection';
import { NextResponse } from 'next/server';

/**
 * Health check endpoint
 * Tests database connectivity and returns status
 * 
 * @returns JSON status response
 */
export async function GET() {
  try {
    // Check Supabase connection
    const supabase = await connectToDatabase();
    
    // Check if Supabase is responding
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('profiles')
      .select('count(*)');
    
    const responseTime = Date.now() - startTime;
    
    if (error) {
      return NextResponse.json({
        status: 'error',
        message: 'Database connection error',
        error: error.message,
      }, { status: 500 });
    }
    
    // Return health status
    return NextResponse.json({
      status: 'healthy',
      database: {
        connected: true,
        responseTime: `${responseTime}ms`,
      },
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
} 