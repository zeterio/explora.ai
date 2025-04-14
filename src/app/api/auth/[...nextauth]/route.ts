import NextAuth from 'next-auth';
import type { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import EmailProvider from 'next-auth/providers/email';
import { config } from '@/config';
import { getSupabase } from '@/lib/db/supabase';
import { getUserProfile, createUserProfile, updateLastLogin } from '@/lib/db/users';

/**
 * NextAuth.js configuration options
 * 
 * Comprehensive authentication setup with multiple providers
 * and enhanced security features.
 * 
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: AuthOptions = {
  providers: [
    // OAuth authentication providers
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
    
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
    }),
    
    // Email magic link authentication
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT ? parseInt(process.env.EMAIL_SERVER_PORT) : 587,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD
        }
      },
      from: process.env.EMAIL_FROM || 'noreply@explora.ai',
      maxAge: 24 * 60 * 60, // 24 hours
    }),
    
    // Credentials authentication
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        
        try {
          // Get Supabase client
          const supabase = getSupabase();
          
          // Sign in with Supabase Auth
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });
          
          if (error || !data.user) {
            console.error('Authentication error:', error);
            return null;
          }
          
          // Get user profile or create if doesn't exist
          let profile = await getUserProfile(data.user.id);
          
          if (!profile) {
            // Create a new profile for the user
            profile = await createUserProfile(data.user.id, {
              name: data.user.user_metadata?.name || null,
              avatar_url: data.user.user_metadata?.avatar_url || null,
              is_email_verified: data.user.email_confirmed_at ? true : false,
            });
          } else {
            // Update last login time
            await updateLastLogin(data.user.id);
          }
          
          // Return the user object for NextAuth
          return {
            id: data.user.id,
            name: profile.name || data.user.user_metadata?.name || data.user.email?.split('@')[0],
            email: data.user.email,
            role: data.user.user_metadata?.role || 'user',
            image: profile.avatar_url,
          };
        } catch (error) {
          console.error('Error in credentials authorization:', error);
          return null;
        }
      },
    }),
  ],
  
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/error',
    verifyRequest: '/verify-request', // Used for email provider
    newUser: '/profile', // Redirect new users here
  },
  
  session: {
    strategy: 'jwt',
    maxAge: config.auth.sessionDuration,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET,
    maxAge: config.auth.sessionDuration,
  },
  
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Add custom validation logic here
      // For example, only allow verified emails
      // if (profile?.email_verified === false) return false;
      
      // For OAuth logins, create or update user profile in Supabase
      if (account && account.provider !== 'credentials' && user.email) {
        try {
          // Get Supabase admin client
          const supabase = getSupabase(true);
          
          // Check if user exists in Supabase Auth
          const { data: existingUser } = await supabase.auth.admin.getUserByEmail(user.email);
          
          if (!existingUser) {
            // Create user in Supabase Auth
            const { data, error } = await supabase.auth.admin.createUser({
              email: user.email,
              email_confirm: true,
              user_metadata: {
                name: user.name,
                avatar_url: user.image,
                provider: account.provider,
              },
            });
            
            if (error) {
              console.error('Error creating Supabase user:', error);
              return false;
            }
            
            // Create user profile
            if (data.user) {
              await createUserProfile(data.user.id, {
                name: user.name || null,
                avatar_url: user.image || null,
                is_email_verified: true,
              });
            }
          } else {
            // Update profile for existing user
            const profile = await getUserProfile(existingUser.user.id);
            
            if (!profile) {
              // Create profile if doesn't exist
              await createUserProfile(existingUser.user.id, {
                name: user.name || null,
                avatar_url: user.image || null,
                is_email_verified: true,
              });
            } else {
              // Update last login time
              await updateLastLogin(existingUser.user.id);
            }
          }
        } catch (error) {
          console.error('Error in OAuth signin:', error);
          // Don't fail the sign in if profile operations fail
        }
      }
      
      return true;
    },
    
    async jwt({ token, user, account }) {
      // Add custom claims to JWT
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || 'user';
      }
      
      // Add access token if available (from OAuth providers)
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      
      return token;
    },
    
    async session({ session, token }) {
      // Add custom properties to session
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role as string;
        (session as any).accessToken = token.accessToken as string;
        (session as any).provider = token.provider as string;
      }
      return session;
    },
  },
  
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // Handle post-sign in events
      try {
        if (user.id) {
          // Update last login timestamp
          await updateLastLogin(user.id);
        }
      } catch (error) {
        console.error('Error in signIn event:', error);
      }
    },
  },
  
  debug: process.env.NODE_ENV === 'development',
};

/**
 * NextAuth.js handler
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 