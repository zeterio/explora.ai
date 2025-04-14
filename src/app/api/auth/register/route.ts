import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getSupabase } from '@/lib/db/supabase';
import { createUserProfile } from '@/lib/db/users';

// Registration request schema
const registerSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

/**
 * API route for user registration
 * 
 * @returns NextResponse with success/error message
 */
export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = registerSchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { name, email, password } = validation.data;
    
    // Get Supabase admin client
    const supabase = getSupabase(true);
    
    // Check if the user already exists
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email);
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Create the user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for simplicity, remove in production
      user_metadata: {
        name,
      },
    });
    
    if (authError) {
      console.error('Error creating user:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 500 }
      );
    }
    
    // Create a profile for the user
    if (authData.user) {
      try {
        await createUserProfile(authData.user.id, {
          name,
          is_email_verified: true, // Since we auto-confirmed
        });
      } catch (profileError) {
        console.error('Error creating user profile:', profileError);
        // We don't want to fail the registration if profile creation fails
        // The profile will be created on first login
      }
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'User registered successfully',
        user: { 
          id: authData.user.id,
          email: authData.user.email,
          name 
        } 
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 